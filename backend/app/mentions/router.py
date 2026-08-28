from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.mentions.repository import MentionRepository
from app.mentions.schemas import MentionsRequest, MentionsResponse, TrendsRequest, TrendsResponse
from app.mentions.service import MentionService

router = APIRouter(prefix="/mentions", tags=["mentions"])

Session = Annotated[AsyncSession, Depends(get_session)]


def get_mention_service(session: Session) -> MentionService:
    return MentionService(MentionRepository(session))


Service = Annotated[MentionService, Depends(get_mention_service)]


@router.post("", response_model=MentionsResponse)
async def list_mentions(request: MentionsRequest, service: Service) -> MentionsResponse:
    return await service.list(request)


@router.post("/trends", response_model=TrendsResponse)
async def trends(request: TrendsRequest, service: Service) -> TrendsResponse:
    return await service.trends(request)
