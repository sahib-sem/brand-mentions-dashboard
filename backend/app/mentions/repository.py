from __future__ import annotations

from datetime import date, datetime, time, timedelta

from sqlalchemy import Select, case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.mentions.models import Mention
from app.mentions.schemas import GroupBy, MentionFilters, TrendPoint, TrendsRequest


class MentionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @staticmethod
    def _apply_filters(
        statement: Select[tuple[Mention]], filters: MentionFilters | None
    ) -> Select[tuple[Mention]]:
        if filters is None:
            return statement
        if filters.model is not None:
            statement = statement.where(Mention.model == filters.model.value)
        if filters.sentiment is not None:
            statement = statement.where(Mention.sentiment == filters.sentiment.value)
        if filters.date_from is not None:
            statement = statement.where(
                Mention.created_at >= datetime.combine(filters.date_from, time.min)
            )
        if filters.date_to is not None:
            statement = statement.where(
                Mention.created_at < datetime.combine(filters.date_to + timedelta(days=1), time.min)
            )
        return statement

    async def list(
        self, filters: MentionFilters | None, page: int, per_page: int
    ) -> tuple[list[Mention], int]:
        filtered = self._apply_filters(select(Mention), filters)
        count_statement = select(func.count()).select_from(filtered.order_by(None).subquery())
        total = await self._session.scalar(count_statement)
        rows = await self._session.scalars(
            filtered.order_by(Mention.created_at.desc(), Mention.id.asc())
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
        return list(rows), total or 0

    async def trends(self, request: TrendsRequest) -> list[TrendPoint]:
        created_date = func.date(Mention.created_at)
        if request.group_by == GroupBy.WEEK:
            weekday_offset = (func.strftime("%w", Mention.created_at) + 6) % 7
            bucket = func.date(Mention.created_at, func.printf("-%d days", weekday_offset))
        else:
            bucket = created_date

        statement = select(
            bucket.label("date"),
            func.count(Mention.id).label("total"),
            func.sum(case((Mention.mentioned.is_(True), 1), else_=0)).label("mentioned"),
        )
        if request.date_from is not None:
            statement = statement.where(created_date >= request.date_from.isoformat())
        if request.date_to is not None:
            statement = statement.where(created_date <= request.date_to.isoformat())
        statement = statement.group_by(bucket).order_by(bucket)

        rows = (await self._session.execute(statement)).all()
        return [
            TrendPoint(date=date.fromisoformat(row.date), total=row.total, mentioned=row.mentioned)
            for row in rows
        ]
