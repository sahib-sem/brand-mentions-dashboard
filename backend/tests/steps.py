from contextlib import AbstractContextManager, nullcontext
from typing import Literal

StepKind = Literal["Given", "When", "Then"]


def step(kind: StepKind, description: str) -> AbstractContextManager[None]:
    """Label behavior phases while preserving normal assertion tracebacks."""
    if not description:
        raise ValueError("a step description is required")
    return nullcontext()
