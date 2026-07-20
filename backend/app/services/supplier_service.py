from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.supplier import Supplier
from app.schemas.supplier import SupplierCreate, SupplierUpdate


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    return normalized or None


def get_supplier_by_id(db: Session, supplier_id: int) -> Supplier | None:
    return db.get(Supplier, supplier_id)


def get_supplier_by_email(db: Session, email: str) -> Supplier | None:
    statement = select(Supplier).where(Supplier.email == normalize_email(email))
    return db.scalar(statement)


def get_supplier_by_phone(db: Session, phone: str | None) -> Supplier | None:
    normalized_phone = normalize_optional_text(phone)
    if normalized_phone is None:
        return None

    statement = select(Supplier).where(Supplier.phone == normalized_phone)
    return db.scalar(statement)


def get_suppliers(db: Session, search: str | None = None) -> list[Supplier]:
    statement = select(Supplier)

    normalized_search = normalize_optional_text(search)
    if normalized_search is not None:
        search_term = f"%{normalized_search}%"
        statement = statement.where(
            or_(
                Supplier.company_name.ilike(search_term),
                Supplier.contact_person.ilike(search_term),
                Supplier.phone.ilike(search_term),
            )
        )

    statement = statement.order_by(Supplier.created_at.desc())
    return list(db.scalars(statement))


def create_supplier(db: Session, supplier_data: SupplierCreate) -> Supplier:
    supplier = Supplier(
        company_name=supplier_data.company_name.strip(),
        contact_person=normalize_optional_text(supplier_data.contact_person),
        email=normalize_email(supplier_data.email),
        phone=normalize_optional_text(supplier_data.phone),
        address=normalize_optional_text(supplier_data.address),
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def update_supplier(db: Session, supplier: Supplier, supplier_data: SupplierUpdate) -> Supplier:
    updates = supplier_data.model_dump(exclude_unset=True)

    if "company_name" in updates and updates["company_name"] is not None:
        supplier.company_name = updates["company_name"].strip()
    if "contact_person" in updates:
        supplier.contact_person = normalize_optional_text(updates["contact_person"])
    if "email" in updates and updates["email"] is not None:
        supplier.email = normalize_email(updates["email"])
    if "phone" in updates:
        supplier.phone = normalize_optional_text(updates["phone"])
    if "address" in updates:
        supplier.address = normalize_optional_text(updates["address"])

    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier: Supplier) -> None:
    db.delete(supplier)
    db.commit()
