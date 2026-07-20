from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.supplier import SupplierCreate, SupplierResponse, SupplierUpdate
from app.services.supplier_service import (
    create_supplier,
    delete_supplier,
    get_supplier_by_email,
    get_supplier_by_id,
    get_supplier_by_phone,
    get_suppliers,
    normalize_email,
    normalize_optional_text,
    update_supplier,
)


router = APIRouter(prefix="/suppliers")


@router.post("", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_supplier_route(
    supplier_data: SupplierCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SupplierResponse:
    if get_supplier_by_email(db, supplier_data.email) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A supplier with this email already exists.",
        )

    if get_supplier_by_phone(db, supplier_data.phone) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A supplier with this phone already exists.",
        )

    return create_supplier(db, supplier_data)


@router.get("", response_model=list[SupplierResponse])
def list_suppliers_route(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    search: Annotated[str | None, Query(max_length=160)] = None,
) -> list[SupplierResponse]:
    return get_suppliers(db, search)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier_route(
    supplier_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SupplierResponse:
    supplier = get_supplier_by_id(db, supplier_id)
    if supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    return supplier


@router.patch("/{supplier_id}", response_model=SupplierResponse)
def update_supplier_route(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SupplierResponse:
    supplier = get_supplier_by_id(db, supplier_id)
    if supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    if supplier_data.email is not None and normalize_email(supplier_data.email) != supplier.email:
        existing_supplier = get_supplier_by_email(db, supplier_data.email)
        if existing_supplier is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A supplier with this email already exists.",
            )

    normalized_phone = normalize_optional_text(supplier_data.phone)
    if supplier_data.phone is not None and normalized_phone != supplier.phone:
        existing_supplier = get_supplier_by_phone(db, normalized_phone)
        if existing_supplier is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A supplier with this phone already exists.",
            )

    return update_supplier(db, supplier, supplier_data)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier_route(
    supplier_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Response:
    supplier = get_supplier_by_id(db, supplier_id)
    if supplier is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Supplier not found.")

    delete_supplier(db, supplier)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
