from datetime import UTC, date, datetime
from enum import StrEnum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class ModelName(StrEnum):
    CHATGPT = "chatgpt"
    CLAUDE = "claude"
    GEMINI = "gemini"
    PERPLEXITY = "perplexity"


class Sentiment(StrEnum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class GroupBy(StrEnum):
    DAY = "day"
    WEEK = "week"


class DateRange(BaseModel):
    model_config = ConfigDict(extra="forbid")

    date_from: date | None = None
    date_to: date | None = None

    @model_validator(mode="after")
    def dates_are_ordered(self) -> Self:
        if self.date_from is not None and self.date_to is not None:
            if self.date_from > self.date_to:
                raise ValueError("date_from must be on or before date_to")
        return self


class MentionFilters(DateRange):
    model: ModelName | None = None
    sentiment: Sentiment | None = None


class MentionsRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=25, ge=1, le=100)
    filters: MentionFilters | None = None


class TrendsRequest(MentionFilters):
    """Trend buckets.

    `model` and `sentiment` are optional additions to the documented contract so
    the chart can reflect the same filters as the table.
    """

    group_by: GroupBy = GroupBy.DAY


class MentionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    query_text: str
    model: ModelName
    mentioned: bool
    position: int | None
    sentiment: Sentiment | None
    citation_url: str | None
    created_at: datetime

    @field_validator("created_at", mode="after")
    @classmethod
    def created_at_is_utc(cls, value: datetime) -> datetime:
        return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


class MentionsResponse(BaseModel):
    data: list[MentionResponse]
    total: int
    page: int
    per_page: int


class TrendPoint(BaseModel):
    date: date
    total: int
    mentioned: int


class TrendsResponse(BaseModel):
    data: list[TrendPoint]
