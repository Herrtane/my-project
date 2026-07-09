import { describe, expect, it } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("returns 무료 for zero", () => {
    expect(formatPrice(0)).toBe("무료");
  });

  it("formats a positive amount with a won sign and locale-fixed grouping", () => {
    expect(formatPrice(66000)).toBe("₩66,000");
  });
});
