from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import (
    create_product,
    delete_product,
    get_product_by_id,
    get_product_by_sku,
    get_products,
    normalize_sku,
    update_product,
)


router = APIRouter(prefix="/products")


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product_route(
    product_data: ProductCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> ProductResponse:
    existing_product = get_product_by_sku(db, product_data.sku)
    if existing_product is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists.",
        )

    return create_product(db, product_data)


@router.get("", response_model=list[ProductResponse])
def list_products_route(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> list[ProductResponse]:
    return get_products(db)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product_route(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> ProductResponse:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    return product


@router.patch("/{product_id}", response_model=ProductResponse)
def update_product_route(
    product_id: int,
    product_data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> ProductResponse:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    if product_data.sku is not None and normalize_sku(product_data.sku) != product.sku:
        existing_product = get_product_by_sku(db, product_data.sku)
        if existing_product is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A product with this SKU already exists.",
            )

    return update_product(db, product, product_data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product_route(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
) -> Response:
    product = get_product_by_id(db, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    delete_product(db, product)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

