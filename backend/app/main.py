from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo.errors import OperationFailure, PyMongoError, ServerSelectionTimeoutError

from app.config import settings
from app.database import close_db, connect_db
from app.routers.orders import router as orders_router
from app.routers.uploads import router as uploads_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="Raja Rani Cake Order API",
    version="0.1.0",
    lifespan=lifespan,
)


@app.exception_handler(OperationFailure)
async def mongo_auth_handler(_: Request, exc: OperationFailure):
    message = str(exc)
    if "authentication failed" in message.lower() or exc.code == 8000:
        detail = (
            "MongoDB authentication failed. Check MONGODB_URI username and password in backend/.env"
        )
    else:
        detail = f"MongoDB error: {message}"
    return JSONResponse(status_code=503, content={"detail": detail})


@app.exception_handler(ServerSelectionTimeoutError)
async def mongo_connection_handler(_: Request, exc: ServerSelectionTimeoutError):
    return JSONResponse(
        status_code=503,
        content={
            "detail": "Cannot reach MongoDB. Check your connection string and Atlas Network Access."
        },
    )


@app.exception_handler(PyMongoError)
async def mongo_generic_handler(_: Request, exc: PyMongoError):
    return JSONResponse(status_code=503, content={"detail": f"MongoDB error: {exc}"})

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orders_router)
app.include_router(uploads_router)
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")


@app.get("/health")
async def health():
    return {"status": "ok"}
