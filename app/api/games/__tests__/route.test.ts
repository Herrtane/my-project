import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

function steamResponse(resultsHtml: string) {
  return new Response(JSON.stringify({ success: 1, results_html: resultsHtml }), {
    status: 200,
  });
}

const RPG_ITEM = `
  <a href="https://store.steampowered.com/app/1086940/Baldurs_Gate_3/?snr=1"
     data-ds-appid="1086940" data-ds-tagids="[122]">
    <div class="search_capsule"><img src="https://example.com/capsule.jpg"></div>
    <div class="search_name ellipsis"><span class="title">Baldur's Gate 3</span></div>
    <div class="search_reviewscore"><span data-tooltip-html="96% of the 444,334 user reviews for this game are positive."></span></div>
    <div class="search_price_discount_combined">
      <div class="discount_block search_discount_block" data-discount="25">
        <div class="discount_prices">
          <div class="discount_original_price">₩ 66,000</div>
          <div class="discount_final_price">₩ 49,500</div>
        </div>
      </div>
    </div>
  </a>
`;

describe("GET /api/games", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 with a parsed game array for genre=전체", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(steamResponse(RPG_ITEM));

    const request = new Request("http://localhost/api/games?genre=전체");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.games).toHaveLength(1);
    expect(body.games[0].appid).toBe(1086940);
  });

  it("requests the tag id for genre=RPG and does not filter results further", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(steamResponse(RPG_ITEM));

    const request = new Request("http://localhost/api/games?genre=RPG");
    const response = await GET(request);
    await response.json();

    const calledUrl = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain("tags=122");
    expect(calledUrl).toContain("cc=kr");
  });

  it("returns an error status when the Steam fetch fails", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("network down"));

    const request = new Request("http://localhost/api/games?genre=전체");
    const response = await GET(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
