export type Model = "chatgpt" | "claude" | "gemini" | "perplexity";
export type Sentiment = "positive" | "neutral" | "negative";
export type GroupBy = "day" | "week";

export interface MentionFilters {
  model?: Model;
  sentiment?: Sentiment;
  date_from?: string;
  date_to?: string;
}

export interface MentionsRequest {
  page: number;
  per_page: number;
  filters?: MentionFilters;
}

export interface Mention {
  id: string;
  query_text: string;
  model: string;
  mentioned: boolean;
  position: number | null;
  sentiment: string | null;
  citation_url: string | null;
  created_at: string;
}

export interface MentionsResponse {
  data: Mention[];
  total: number;
  page: number;
  per_page: number;
}

export interface TrendsRequest {
  date_from?: string;
  date_to?: string;
  group_by: GroupBy;
}

export interface TrendPoint { date: string; total: number; mentioned: number; }
export interface TrendsResponse { data: TrendPoint[]; }
