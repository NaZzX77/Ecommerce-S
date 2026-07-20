from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.inventory import InventoryAdjustmentRequest, InventoryTransactionResponse
from app.schemas.product import ProductResponse
from app.services.inventory_service import DECREASE, INCREASE, adjust_stock, get_inventory_history, get_low_stock_products
from app.services.product_service import get_product_by_id


router = APIRouter(prefix="/inventory")


@router.post("/products/{product_id}/increase", response_model=InventoryTransactionResponse)
def increase_stock_route(
    product_id: int,
    adjustment: InventoryAdjustmentRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> InventoryTransactionResponse:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    return adjust_stock(db, product, INCREASE, adjustment.quantity_changed, adjustment.notes)


@router.post("/products/{product_id}/decrease", response_model=InventoryTransactionResponse)
def decrease_stock_route(
    product_id: int,
    adjustment: InventoryAdjustmentRequest,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> InventoryTransactionResponse:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    if product.quantity < adjustment.quantity_changed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Stock cannot go below zero.",
        )

    return adjust_stock(db, product, DECREASE, adjustment.quantity_changed, adjustment.notes)


@router.get("/products/{product_id}/history", response_model=list[InventoryTransactionResponse])
def product_inventory_history_route(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> list[InventoryTransactionResponse]:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    return get_inventory_history(db, product_id)


@router.get("/low-stock", response_model=list[ProductResponse])
def low_stock_products_route(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    threshold: Annotated[int, Query(ge=0)] = 10,
) -> list[ProductResponse]:
    return get_low_stock_products(db, threshold)
