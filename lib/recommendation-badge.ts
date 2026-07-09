export type RecommendationBadge = "적극 추천" | "신중히 고려" | "비추천" | "정보 부족";

const MIN_REVIEW_COUNT = 10;
const STRONG_RECOMMEND_THRESHOLD = 80;
const CONSIDER_THRESHOLD = 50;

export function getRecommendationBadge(
  reviewPercent: number | null,
  reviewCount: number,
): RecommendationBadge {
  if (reviewCount < MIN_REVIEW_COUNT || reviewPercent === null) {
    return "정보 부족";
  }

  if (reviewPercent >= STRONG_RECOMMEND_THRESHOLD) {
    return "적극 추천";
  }

  if (reviewPercent >= CONSIDER_THRESHOLD) {
    return "신중히 고려";
  }

  return "비추천";
}
