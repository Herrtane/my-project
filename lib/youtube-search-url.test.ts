import { describe, expect, it } from "vitest";
import { buildYoutubeSearchUrl } from "./youtube-search-url";

describe("buildYoutubeSearchUrl", () => {
  it("builds a YouTube search URL appending 'trailer' to the game name", () => {
    expect(buildYoutubeSearchUrl("Elden Ring")).toBe(
      "https://www.youtube.com/results?search_query=Elden+Ring+trailer",
    );
  });

  it("encodes special characters in the game name", () => {
    const url = buildYoutubeSearchUrl("Baldur's Gate 3");
    expect(url).toContain("https://www.youtube.com/results?search_query=");
    expect(decodeURIComponent(url.split("=")[1].replace(/\+/g, "%20"))).toBe(
      "Baldur's Gate 3 trailer",
    );
  });
});
