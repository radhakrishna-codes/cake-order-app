from datetime import UTC, datetime

from bson import ObjectId
from fastapi import HTTPException, status

from app.database import get_orders_collection
from app.models.order import OrderCreate, OrderResponse, OrderUpdate


def _schedule_date(doc: dict) -> str:
    if doc.get("order_type") == "delivery":
        return doc.get("delivery_date") or ""
    return doc.get("pickup_date") or ""


def _schedule_time(doc: dict) -> str:
    if doc.get("order_type") == "delivery":
        return doc.get("delivery_time") or ""
    return doc.get("pickup_time") or ""


def _doc_to_response(doc: dict) -> OrderResponse:
    return OrderResponse(
        id=str(doc["_id"]),
        customer_name=doc["customer_name"],
        flavor=doc["flavor"],
        size=doc["size"],
        order_type=doc.get("order_type", "pickup"),
        pickup_date=doc.get("pickup_date"),
        pickup_time=doc.get("pickup_time"),
        delivery_date=doc.get("delivery_date"),
        delivery_time=doc.get("delivery_time"),
        delivery_address=doc.get("delivery_address"),
        total=doc["total"],
        advance_paid=doc["advance_paid"],
        pending=doc["pending"],
        greetings=doc.get("greetings", ""),
        modifications=doc.get("modifications", ""),
        reference_image_name=doc.get("reference_image_name"),
        reference_images=doc.get("reference_images", []),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


def _create_payload(order: OrderCreate) -> dict:
    now = datetime.now(UTC)
    return {
        **order.model_dump(),
        "created_at": now,
        "updated_at": now,
    }


async def list_orders() -> list[OrderResponse]:
    collection = get_orders_collection()
    cursor = collection.find()
    docs = await cursor.to_list(length=None)
    docs.sort(key=lambda doc: (_schedule_date(doc), _schedule_time(doc)))
    return [_doc_to_response(doc) for doc in docs]


async def get_order(order_id: str) -> OrderResponse:
    collection = get_orders_collection()
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    doc = await collection.find_one({"_id": ObjectId(order_id)})
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    return _doc_to_response(doc)


async def create_order(order: OrderCreate) -> OrderResponse:
    collection = get_orders_collection()
    result = await collection.insert_one(_create_payload(order))
    doc = await collection.find_one({"_id": result.inserted_id})
    return _doc_to_response(doc)


async def update_order(order_id: str, order: OrderUpdate) -> OrderResponse:
    collection = get_orders_collection()
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    updates = order.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update",
        )

    updates["updated_at"] = datetime.now(UTC)
    result = await collection.update_one({"_id": ObjectId(order_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    doc = await collection.find_one({"_id": ObjectId(order_id)})
    return _doc_to_response(doc)


async def delete_order(order_id: str) -> None:
    collection = get_orders_collection()
    if not ObjectId.is_valid(order_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    result = await collection.delete_one({"_id": ObjectId(order_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
