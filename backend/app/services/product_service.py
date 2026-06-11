from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


def normalize_sku(sku: str) -> str:
    return sku.strip().upper()


def get_product_by_id(db: Session, product_id: int) -> Product | None:
    return db.get(Product, product_id)


def get_product_by_sku(db: Session, sku: str) -> Product | None:
    statement = select(Product).where(Product.sku == normalize_sku(sku))
    return db.scalar(statement)


def get_products(db: Session) -> list[Product]:
    statement = select(Product).order_by(Product.created_at.desc())
    return list(db.scalars(statement))


def create_product(db: Session, product_data: ProductCreate) -> Product:
    product = Product(
        name=product_data.name.strip(),
        description=product_data.description.strip() if product_data.description else None,
        sku=normalize_sku(product_data.sku),
        price=product_data.price,
        quantity=product_data.quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def update_product(db: Session, product: Product, product_data: ProductUpdate) -> Product:
    updates = product_data.model_dump(exclude_unset=True)

    if "name" in updates and updates["name"] is not None:
        product.name = updates["name"].strip()
    if "description" in updates:
        product.description = updates["description"].strip() if updates["description"] else None
    if "sku" in updates and updates["sku"] is not None:
        product.sku = normalize_sku(updates["sku"])
    if "price" in updates and updates["price"] is not None:
        product.price = updates["price"]
    if "quantity" in updates and updates["quantity"] is not None:
        product.quantity = updates["quantity"]

    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.commit()

