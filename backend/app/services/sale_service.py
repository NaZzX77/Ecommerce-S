from collections import defaultdict
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import String, cast, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.customer import Customer
from app.models.inventory_transaction import InventoryTransaction
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate


def get_sale_by_id(db: Session, sale_id: int) -> Sale | None:
    statement = (
        select(Sale)
        .where(Sale.id == sale_id)
        .options(
            joinedload(Sale.customer),
            selectinload(Sale.items).joinedload(SaleItem.product),
        )
    )
    return db.scalar(statement)


def get_sales(db: Session, search: str | None = None) -> list[Sale]:
    statement = (
        select(Sale)
        .join(Customer)
        .options(joinedload(Sale.customer), selectinload(Sale.items))
    )

    if search and search.strip():
        search_term = f"%{search.strip()}%"
        statement = statement.where(
            or_(
                cast(Sale.id, String).ilike(search_term),
                Customer.first_name.ilike(search_term),
                Customer.last_name.ilike(search_term),
                Customer.phone.ilike(search_term),
                Customer.email.ilike(search_term),
            )
        )

    statement = statement.order_by(Sale.created_at.desc())
    return list(db.scalars(statement))


def create_sale(db: Session, sale_data: SaleCreate) -> Sale:
    customer = db.get(Customer, sale_data.customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    requested_quantities: dict[int, int] = defaultdict(int)
    for item in sale_data.items:
        requested_quantities[item.product_id] += item.quantity

    product_ids = list(requested_quantities)
    products = list(
        db.scalars(select(Product).where(Product.id.in_(product_ids)).with_for_update())
    )
    products_by_id = {product.id: product for product in products}

    missing_product_ids = [product_id for product_id in product_ids if product_id not in products_by_id]
    if missing_product_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product not found: {missing_product_ids[0]}.",
        )

    for product_id, requested_quantity in requested_quantities.items():
        product = products_by_id[product_id]
        if requested_quantity > product.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}.",
            )

    sale_items: list[SaleItem] = []
    grand_total = Decimal("0.00")

    try:
        sale = Sale(customer_id=customer.id, subtotal=Decimal("0.00"), grand_total=Decimal("0.00"))
        db.add(sale)
        db.flush()

        for item in sale_data.items:
            product = products_by_id[item.product_id]
            selling_price = product.price
            item_subtotal = selling_price * item.quantity
            previous_quantity = product.quantity
            new_quantity = previous_quantity - item.quantity

            product.quantity = new_quantity
            sale_items.append(
                SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    selling_price=selling_price,
                    subtotal=item_subtotal,
                )
            )
            db.add(
                InventoryTransaction(
                    product_id=product.id,
                    transaction_type="OUT",
                    quantity_changed=item.quantity,
                    previous_quantity=previous_quantity,
                    new_quantity=new_quantity,
                    notes=f"Sale #{sale.id}",
                )
            )
            grand_total += item_subtotal

        sale.subtotal = grand_total
        sale.grand_total = grand_total
        db.add_all(sale_items)
        db.commit()
        return get_sale_by_id(db, sale.id) or sale
    except Exception:
        db.rollback()
        raise
