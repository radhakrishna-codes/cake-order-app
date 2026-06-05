from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

OrderType = Literal["pickup", "delivery"]


class OrderBase(BaseModel):
    customer_name: str = Field(..., min_length=1)
    flavor: str = Field(..., min_length=1)
    size: str = Field(..., min_length=1)
    order_type: OrderType = "pickup"
    pickup_date: str | None = None
    pickup_time: str | None = None
    delivery_date: str | None = None
    delivery_time: str | None = None
    delivery_address: str | None = None
    total: float = Field(..., ge=0)
    advance_paid: float = Field(..., ge=0)
    pending: float = Field(..., ge=0)
    greetings: str = ""
    modifications: str = ""
    reference_image_name: str | None = None
    reference_images: list[str] = Field(default_factory=list)

    @field_validator("customer_name", "flavor", "size", "greetings", "modifications", mode="before")
    @classmethod
    def strip_strings(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("delivery_address", mode="before")
    @classmethod
    def strip_delivery_address(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @model_validator(mode="after")
    def validate_order_type_fields(self):
        if self.order_type == "pickup":
            if not self.pickup_date or not self.pickup_time:
                raise ValueError("pickup_date and pickup_time are required for pickup orders")
            self.delivery_date = None
            self.delivery_time = None
            self.delivery_address = None
        else:
            if not self.delivery_date or not self.delivery_time or not self.delivery_address:
                raise ValueError(
                    "delivery_date, delivery_time, and delivery_address are required for delivery orders"
                )
            self.pickup_date = None
            self.pickup_time = None
        return self


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    customer_name: str | None = Field(default=None, min_length=1)
    flavor: str | None = Field(default=None, min_length=1)
    size: str | None = Field(default=None, min_length=1)
    order_type: OrderType | None = None
    pickup_date: str | None = None
    pickup_time: str | None = None
    delivery_date: str | None = None
    delivery_time: str | None = None
    delivery_address: str | None = None
    total: float | None = Field(default=None, ge=0)
    advance_paid: float | None = Field(default=None, ge=0)
    pending: float | None = Field(default=None, ge=0)
    greetings: str | None = None
    modifications: str | None = None
    reference_image_name: str | None = None
    reference_images: list[str] | None = None

    @model_validator(mode="after")
    def validate_order_type_fields(self):
        if self.order_type == "pickup":
            if self.pickup_date is None or self.pickup_time is None:
                raise ValueError("pickup_date and pickup_time are required for pickup orders")
            self.delivery_date = None
            self.delivery_time = None
            self.delivery_address = None
        elif self.order_type == "delivery":
            if (
                self.delivery_date is None
                or self.delivery_time is None
                or not self.delivery_address
            ):
                raise ValueError(
                    "delivery_date, delivery_time, and delivery_address are required for delivery orders"
                )
            self.pickup_date = None
            self.pickup_time = None
        return self


class OrderResponse(OrderBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"populate_by_name": True}
