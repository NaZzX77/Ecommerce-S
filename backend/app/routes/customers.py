from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerUpdate
from app.services.customer_service import (
    create_customer,
    delete_customer,
    get_customer_by_email,
    get_customer_by_id,
    get_customer_by_phone,
    get_customers,
    normalize_email,
    normalize_optional_text,
    update_customer,
)


router = APIRouter(prefix="/customers")


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer_route(
    customer_data: CustomerCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> CustomerResponse:
    if get_customer_by_email(db, customer_data.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this email already exists.",
        )

    if get_customer_by_phone(db, customer_data.phone) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A customer with this phone already exists.",
        )

    return create_customer(db, customer_data)


@router.get("", response_model=list[CustomerResponse])
def list_customers_route(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    search: Annotated[str | None, Query(max_length=120)] = None,
) -> list[CustomerResponse]:
    return get_customers(db, search)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer_route(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> CustomerResponse:
    customer = get_customer_by_id(db, customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
def update_customer_route(
    customer_id: int,
    customer_data: CustomerUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> CustomerResponse:
    customer = get_customer_by_id(db, customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    if customer_data.email is not None and normalize_email(customer_data.email) != customer.email:
        existing_customer = get_customer_by_email(db, customer_data.email)
        if existing_customer is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A customer with this email already exists.",
            )

    normalized_phone = normalize_optional_text(customer_data.phone)
    if customer_data.phone is not None and normalized_phone != customer.phone:
        existing_customer = get_customer_by_phone(db, normalized_phone)
        if existing_customer is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A customer with this phone already exists.",
            )

    return update_customer(db, customer, customer_data)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_route(
    customer_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Response:
    customer = get_customer_by_id(db, customer_id)
    if customer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")

    delete_customer(db, customer)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
