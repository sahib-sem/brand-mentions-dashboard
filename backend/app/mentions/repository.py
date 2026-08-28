from __future__ import annotations

from datetime import date, datetime, time, timedelta

from sqlalchemy import ColumnElement, Select, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mentions.models import Mention
from app.mentions.schemas import GroupBy, MentionFilters, TrendPoint, TrendsRequest


def _predicates(filters: MentionFilters | None) -> list[ColumnElement[bool]]:
    """Translate the shared filter shape into SQL predicates."""
    if filters is None:
        return []
    clauses: list[ColumnElement[bool]] = []
    if filters.model is not None:
        clauses.append(Mention.model == filters.model.value)
    if filters.sentiment is not None:
        clauses.append(Mention.sentiment == filters.sentiment.value)
    if filters.date_from is not None:
        clauses.append(Mention.created_at >= datetime.combine(filters.date_from, time.min))
    if filters.date_to is not None:
        end = datetime.combine(filters.date_to + timedelta(days=1), time.min)
        clauses.append(Mention.created_at < end)
    return clauses


class MentionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list(
        self, filters: MentionFilters | None, page: int, per_page: int
    ) -> tuple[list[Mention], int]:
        filtered: Select[tuple[Mention]] = select(Mention).where(*_predicates(filters))
        count_statement = select(func.count()).select_from(filtered.order_by(None).subquery())
        total = await self._session.scalar(count_statement)
        rows = await self._session.scalars(
            filtered.order_by(Mention.created_at.desc(), Mention.id.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(rows), total or 0

    async def trends(self, request: TrendsRequest) -> list[TrendPoint]:
        if request.group_by == GroupBy.WEEK:
            # SQLite %w is 0=Sunday; shift so buckets start on Monday.
            weekday_offset = (func.strftime("%w", Mention.created_at) + 6) % 7
            bucket = func.date(Mention.created_at, func.printf("-%d days", weekday_offset))
        else:
            bucket = func.date(Mention.created_at)

        statement = (
            select(
                bucket.label("date"),
                func.count(Mention.id).label("total"),
                func.sum(case((Mention.mentioned.is_(True), 1), else_=0)).label("mentioned"),
            )
            .where(*_predicates(request))
            .group_by(bucket)
            .order_by(bucket)
        )

        rows = (await self._session.execute(statement)).all()
        return [
            TrendPoint(date=date.fromisoformat(row.date), total=row.total, mentioned=row.mentioned)
            for row in rows
        ]
