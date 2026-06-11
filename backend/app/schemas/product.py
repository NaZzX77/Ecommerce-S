from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    sku: str = Field(min_length=2, max_length=80)
    price: Decimal = Field(ge=0, max_digits=10, decimal_places=2)
    quantity: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=2000)
    sku: str | None = Field(default=None, min_length=2, max_length=80)
    price: Decimal | None = Field(default=None, ge=0, max_digits=10, decimal_places=2)
    quantity: int | None = Field(default=None, ge=0)


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime

