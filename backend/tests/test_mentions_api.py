from typing import Any

import pytest
from httpx import AsyncClient

from tests.steps import step


@pytest.mark.asyncio
async def test_lists_mentions_in_stable_newest_first_order(
    client: AsyncClient, mention_payload: dict[str, Any]
) -> None:
    with step("Given", "mentions with equal and different timestamps exist"):
        expected_ids = ["d", "c", "a", "b"]
    with step("When", "the first page is requested"):
        response = await client.post("/mentions", json=mention_payload)
    with step("Then", "the API returns the documented shape and deterministic ordering"):
        assert response.status_code == 200
        body = response.json()
        assert [item["id"] for item in body["data"]] == expected_ids
        assert body["total"] == 4
        assert body["page"] == 1
        assert body["per_page"] == 25
        assert body["data"][0]["created_at"].endswith("Z")


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("filters", "expected_ids"),
    [
        ({"model": "chatgpt"}, ["c", "b"]),
        ({"sentiment": "positive"}, ["b"]),
        ({"date_from": "2025-01-05", "date_to": "2025-01-05"}, ["c"]),
        ({"model": "chatgpt", "sentiment": "neutral"}, ["c"]),
    ],
)
async def test_filters_mentions(
    client: AsyncClient, filters: dict[str, str], expected_ids: list[str]
) -> None:
    with step("Given", "a valid model, sentiment, or inclusive date filter"):
        payload = {"page": 1, "per_page": 25, "filters": filters}
    with step("When", "filtered mentions are requested"):
        response = await client.post("/mentions", json=payload)
    with step("Then", "only matching mentions and their SQL count are returned"):
        assert response.status_code == 200
        assert [item["id"] for item in response.json()["data"]] == expected_ids
        assert response.json()["total"] == len(expected_ids)


@pytest.mark.asyncio
async def test_paginates_without_changing_total(client: AsyncClient) -> None:
    with step("Given", "a page size smaller than the result set"):
        payload = {"page": 2, "per_page": 2}
    with step("When", "the second page is requested"):
        response = await client.post("/mentions", json=payload)
    with step("Then", "the page slice and full SQL count are returned"):
        assert [item["id"] for item in response.json()["data"]] == ["a", "b"]
        assert response.json()["total"] == 4


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {"page": 0},
        {"per_page": 101},
        {"filters": {"model": "gpt"}},
        {"filters": {"sentiment": "happy"}},
        {"filters": {"date_from": "not-a-date"}},
        {"filters": {"date_from": "2025-02-01", "date_to": "2025-01-01"}},
    ],
)
async def test_rejects_invalid_mentions_input(client: AsyncClient, payload: dict[str, Any]) -> None:
    with step("When", "an invalid mentions request is submitted"):
        response = await client.post("/mentions", json=payload)
    with step("Then", "FastAPI reports a validation error"):
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_returns_empty_mentions_page(client: AsyncClient) -> None:
    with step("When", "a filter has no matches"):
        response = await client.post("/mentions", json={"filters": {"date_from": "2030-01-01"}})
    with step("Then", "an empty page is returned"):
        assert response.json()["data"] == []
        assert response.json()["total"] == 0


@pytest.mark.asyncio
async def test_aggregates_daily_trends_in_sql(client: AsyncClient) -> None:
    with step("When", "daily trends over a bounded date range are requested"):
        response = await client.post(
            "/mentions/trends",
            json={"date_from": "2025-01-01", "date_to": "2025-01-05", "group_by": "day"},
        )
    with step("Then", "one ordered aggregate is returned per populated day"):
        assert response.status_code == 200
        assert response.json() == {
            "data": [
                {"date": "2025-01-01", "total": 2, "mentioned": 1},
                {"date": "2025-01-05", "total": 1, "mentioned": 1},
            ]
        }


@pytest.mark.asyncio
async def test_aggregates_monday_start_weekly_trends_in_sql(client: AsyncClient) -> None:
    with step("When", "weekly trends are requested"):
        response = await client.post("/mentions/trends", json={"group_by": "week"})
    with step("Then", "records are grouped under their Monday start dates"):
        assert response.status_code == 200
        assert response.json() == {
            "data": [
                {"date": "2024-12-30", "total": 3, "mentioned": 2},
                {"date": "2025-01-06", "total": 1, "mentioned": 0},
            ]
        }


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "payload",
    [
        {"group_by": "month"},
        {"date_from": "invalid"},
        {"date_from": "2025-02-01", "date_to": "2025-01-01"},
    ],
)
async def test_rejects_invalid_trends_input(client: AsyncClient, payload: dict[str, str]) -> None:
    with step("When", "an invalid trends request is submitted"):
        response = await client.post("/mentions/trends", json=payload)
    with step("Then", "FastAPI reports a validation error"):
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_returns_empty_trends(client: AsyncClient) -> None:
    with step("When", "a trend range has no records"):
        response = await client.post("/mentions/trends", json={"date_from": "2030-01-01"})
    with step("Then", "an empty trend is returned"):
        assert response.json() == {"data": []}
