import { describe, expect, it } from "vitest";
import { getRecommendationBadge } from "./recommendation-badge";

describe("getRecommendationBadge", () => {
  it("returns 적극 추천 for review percent 80 or above", () => {
    expect(getRecommendationBadge(80, 1000)).toBe("적극 추천");
    expect(getRecommendationBadge(96, 444334)).toBe("적극 추천");
  });

  it("returns 신중히 고려 for review percent between 50 and 79", () => {
    expect(getRecommendationBadge(50, 1000)).toBe("신중히 고려");
    expect(getRecommendationBadge(79, 1000)).toBe("신중히 고려");
  });

  it("returns 비추천 for review percent below 50", () => {
    expect(getRecommendationBadge(49, 1000)).toBe("비추천");
    expect(getRecommendationBadge(0, 1000)).toBe("비추천");
  });

  it("returns 정보 부족 when review count is below 10 regardless of percent", () => {
    expect(getRecommendationBadge(100, 9)).toBe("정보 부족");
    expect(getRecommendationBadge(null, 0)).toBe("정보 부족");
  });

  it("treats review count of exactly 10 as sufficient", () => {
    expect(getRecommendationBadge(85, 10)).toBe("적극 추천");
  });
});
