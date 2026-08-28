from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine
from app.mentions.router import router as mentions_router


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncGenerator[None]:
    yield
    await engine.dispose()


async def health() -> dict[str, str]:
    return {"status": "ok"}


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Brand Mentions API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(mentions_router)
    app.add_api_route("/health", health, methods=["GET"])

    return app
