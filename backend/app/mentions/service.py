from app.mentions.repository import MentionRepository
from app.mentions.schemas import (
    MentionResponse,
    MentionsRequest,
    MentionsResponse,
    TrendsRequest,
    TrendsResponse,
)


class MentionService:
    def __init__(self, repository: MentionRepository) -> None:
        self._repository = repository

    async def list(self, request: MentionsRequest) -> MentionsResponse:
        mentions, total = await self._repository.list(
            request.filters, request.page, request.per_page
        )
        return MentionsResponse(
            data=[MentionResponse.model_validate(mention) for mention in mentions],
            total=total,
            page=request.page,
            per_page=request.per_page,
        )

    async def trends(self, request: TrendsRequest) -> TrendsResponse:
        return TrendsResponse(data=await self._repository.trends(request))
