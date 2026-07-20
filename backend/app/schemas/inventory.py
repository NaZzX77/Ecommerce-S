from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class InventoryAdjustmentRequest(BaseModel):
    quantity_changed: int = Field(gt=0)
    notes: str | None = Field(default=None, max_length=1000)


class InventoryTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    transaction_type: str
    quantity_changed: int
    previous_quantity: int
    new_quantity: int
    notes: str | None
    created_at: datetime
