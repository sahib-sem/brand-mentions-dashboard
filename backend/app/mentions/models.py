from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Mention(Base):
    __tablename__ = "mentions"
    __table_args__ = (
        CheckConstraint(
            "model IN ('chatgpt', 'claude', 'gemini', 'perplexity')",
            name="ck_mentions_model",
        ),
        CheckConstraint(
            "sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')",
            name="ck_mentions_sentiment",
        ),
        Index("idx_mentions_model", "model"),
        Index("idx_mentions_sentiment", "sentiment"),
        Index("idx_mentions_created_at", "created_at"),
        Index("idx_mentions_mentioned", "mentioned"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True)
    query_text: Mapped[str] = mapped_column(Text, nullable=False)
    model: Mapped[str] = mapped_column(String, nullable=False)
    mentioned: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    position: Mapped[int | None] = mapped_column(Integer)
    sentiment: Mapped[str | None] = mapped_column(String)
    citation_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
