from fastapi import APIRouter, status

from app.models.order import OrderCreate, OrderResponse, OrderUpdate
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.get("", response_model=list[OrderResponse])
async def list_orders():
    return await order_service.list_orders()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    return await order_service.get_order(order_id)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    return await order_service.create_order(order)


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: str, order: OrderUpdate):
    return await order_service.update_order(order_id, order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(order_id: str):
    await order_service.delete_order(order_id)
