from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import init_db
from app.routes import auth, customers, health, inventory, products, protected, suppliers


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        debug=settings.debug,
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router, prefix=settings.api_v1_prefix, tags=["health"])
    app.include_router(auth.router, prefix=settings.api_v1_prefix, tags=["auth"])
    app.include_router(protected.router, prefix=settings.api_v1_prefix, tags=["protected"])
    app.include_router(products.router, prefix=settings.api_v1_prefix, tags=["products"])
    app.include_router(inventory.router, prefix=settings.api_v1_prefix, tags=["inventory"])
    app.include_router(customers.router, prefix=settings.api_v1_prefix, tags=["customers"])
    app.include_router(suppliers.router, prefix=settings.api_v1_prefix, tags=["suppliers"])

    return app


app = create_app()
