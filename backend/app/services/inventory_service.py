from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.inventory_transaction import InventoryTransaction
from app.models.product import Product


INCREASE = "IN"
DECREASE = "OUT"


def adjust_stock(
    db: Session,
    product: Product,
    transaction_type: str,
    quantity_changed: int,
    notes: str | None = None,
) -> InventoryTransaction:
    previous_quantity = product.quantity

    if transaction_type == INCREASE:
        new_quantity = previous_quantity + quantity_changed
    else:
        new_quantity = previous_quantity - quantity_changed

    product.quantity = new_quantity
    transaction = InventoryTransaction(
        product_id=product.id,
        transaction_type=transaction_type,
        quantity_changed=quantity_changed,
        previous_quantity=previous_quantity,
        new_quantity=new_quantity,
        notes=notes.strip() if notes else None,
    )

    db.add(transaction)
    db.commit()
    db.refresh(product)
    db.refresh(transaction)
    return transaction


def get_inventory_history(db: Session, product_id: int) -> list[InventoryTransaction]:
    statement = (
        select(InventoryTransaction)
        .where(InventoryTransaction.product_id == product_id)
        .order_by(InventoryTransaction.created_at.desc())
    )
    return list(db.scalars(statement))


def get_low_stock_products(db: Session, threshold: int) -> list[Product]:
    statement = select(Product).where(Product.quantity <= threshold).order_by(Product.quantity.asc())
    return list(db.scalars(statement))
