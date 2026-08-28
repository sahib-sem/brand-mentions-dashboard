from collections.abc import AsyncIterator
from datetime import datetime
from pathlib import Path
from typing import Any

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_session
from app.main import create_app
from app.mentions.models import Mention


@pytest.fixture
async def client(tmp_path: Path) -> AsyncIterator[AsyncClient]:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'test.db'}")
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with sessions() as session:
        session.add_all(
            [
                Mention(id="b", query_text="second", model="chatgpt", mentioned=True,
                        position=2, sentiment="positive", citation_url="https://example.com/b",
                        created_at=datetime(2025, 1, 1, 12)),
                Mention(id="a", query_text="first", model="claude", mentioned=False,
                        position=None, sentiment="negative", citation_url=None,
                        created_at=datetime(2025, 1, 1, 12)),
                Mention(id="c", query_text="third", model="chatgpt", mentioned=True,
                        position=1, sentiment="neutral", citation_url=None,
                        created_at=datetime(2025, 1, 5, 9)),
                Mention(id="d", query_text="fourth", model="gemini", mentioned=False,
                        position=None, sentiment=None, citation_url=None,
                        created_at=datetime(2025, 1, 6, 10)),
            ]
        )
        await session.commit()

    async def test_session() -> AsyncIterator[AsyncSession]:
        async with sessions() as session:
            yield session

    app = create_app()
    app.dependency_overrides[get_session] = test_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as value:
        yield value
    await engine.dispose()


@pytest.fixture
def mention_payload() -> dict[str, Any]:
    return {"page": 1, "per_page": 25, "filters": {}}
