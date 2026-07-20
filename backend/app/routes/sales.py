from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import create_sale, get_sale_by_id, get_sales


router = APIRouter(prefix="/sales")


@router.post("", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def create_sale_route(
    sale_data: SaleCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SaleResponse:
    return create_sale(db, sale_data)


@router.get("", response_model=list[SaleResponse])
def list_sales_route(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    search: Annotated[str | None, Query(max_length=160)] = None,
) -> list[SaleResponse]:
    return get_sales(db, search)


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale_route(
    sale_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SaleResponse:
    sale = get_sale_by_id(db, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")

    return sale


@router.get("/{sale_id}/details", response_model=SaleResponse)
def get_sale_details_route(
    sale_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> SaleResponse:
    sale = get_sale_by_id(db, sale_id)
    if sale is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")

    return sale
