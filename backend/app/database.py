from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings

client: AsyncIOMotorClient | None = None
db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]
    await client.admin.command("ping")


async def close_db() -> None:
    global client, db
    if client is not None:
        client.close()
    client = None
    db = None


def get_orders_collection():
    if db is None:
        raise RuntimeError("Database is not connected")
    return db["orders"]
