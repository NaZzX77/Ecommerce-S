from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.customer import CustomerResponse
from app.schemas.product import ProductResponse


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class SaleCreate(BaseModel):
    customer_id: int
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sale_id: int
    product_id: int
    quantity: int
    selling_price: Decimal
    subtotal: Decimal
    product: ProductResponse | None = None


class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_id: int
    subtotal: Decimal
    grand_total: Decimal
    created_at: datetime
    customer: CustomerResponse | None = None
    items: list[SaleItemResponse] = Field(default_factory=list)
