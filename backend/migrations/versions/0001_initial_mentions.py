"""Create mentions table.

Revision ID: 0001
Revises:
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "mentions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("query_text", sa.Text(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("mentioned", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("sentiment", sa.String(), nullable=True),
        sa.Column("citation_url", sa.Text(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.text("CURRENT_TIMESTAMP")
        ),
        sa.CheckConstraint(
            "model IN ('chatgpt', 'claude', 'gemini', 'perplexity')",
            name="ck_mentions_model",
        ),
        sa.CheckConstraint(
            "sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')",
            name="ck_mentions_sentiment",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_mentions_created_at", "mentions", ["created_at"])
    op.create_index("idx_mentions_mentioned", "mentions", ["mentioned"])
    op.create_index("idx_mentions_model", "mentions", ["model"])
    op.create_index("idx_mentions_sentiment", "mentions", ["sentiment"])


def downgrade() -> None:
    op.drop_table("mentions")
