import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMentions, getTrends } from "./api";
import type { MentionFilters, MentionsRequest, TrendsRequest } from "./types";

export function useMentionsQuery(page: number, filters: MentionFilters) {
  const request: MentionsRequest = { page, per_page: 25, filters };
  return useQuery({
    queryKey: ["mentions", request],
    queryFn: () => getMentions(request),
    placeholderData: keepPreviousData,
  });
}

export function useTrendsQuery(request: TrendsRequest) {
  return useQuery({ queryKey: ["mention-trends", request], queryFn: () => getTrends(request) });
}
