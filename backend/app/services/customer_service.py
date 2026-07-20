from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def normalize_email(email: str) -> str:
    return email.strip().lower()


def normalize_optional_text(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = value.strip()
    return normalized or None


def get_customer_by_id(db: Session, customer_id: int) -> Customer | None:
    return db.get(Customer, customer_id)


def get_customer_by_email(db: Session, email: str) -> Customer | None:
    statement = select(Customer).where(Customer.email == normalize_email(email))
    return db.scalar(statement)


def get_customer_by_phone(db: Session, phone: str | None) -> Customer | None:
    normalized_phone = normalize_optional_text(phone)
    if normalized_phone is None:
        return None

    statement = select(Customer).where(Customer.phone == normalized_phone)
    return db.scalar(statement)


def get_customers(db: Session, search: str | None = None) -> list[Customer]:
    statement = select(Customer)

    normalized_search = normalize_optional_text(search)
    if normalized_search is not None:
        search_term = f"%{normalized_search}%"
        statement = statement.where(
            or_(
                Customer.first_name.ilike(search_term),
                Customer.last_name.ilike(search_term),
                Customer.phone.ilike(search_term),
            )
        )

    statement = statement.order_by(Customer.created_at.desc())
    return list(db.scalars(statement))


def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    customer = Customer(
        first_name=customer_data.first_name.strip(),
        last_name=customer_data.last_name.strip(),
        email=normalize_email(customer_data.email),
        phone=normalize_optional_text(customer_data.phone),
        address=normalize_optional_text(customer_data.address),
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer: Customer, customer_data: CustomerUpdate) -> Customer:
    updates = customer_data.model_dump(exclude_unset=True)

    if "first_name" in updates and updates["first_name"] is not None:
        customer.first_name = updates["first_name"].strip()
    if "last_name" in updates and updates["last_name"] is not None:
        customer.last_name = updates["last_name"].strip()
    if "email" in updates and updates["email"] is not None:
        customer.email = normalize_email(updates["email"])
    if "phone" in updates:
        customer.phone = normalize_optional_text(updates["phone"])
    if "address" in updates:
        customer.address = normalize_optional_text(updates["address"])

    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer: Customer) -> None:
    db.delete(customer)
    db.commit()
