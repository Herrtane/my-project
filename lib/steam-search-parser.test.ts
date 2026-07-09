import { describe, expect, it } from "vitest";
import { parseSteamSearchHtml } from "./steam-search-parser";

function itemHtml({
  appid,
  name,
  tagIds,
  priceBlock,
  reviewSpan,
}: {
  appid: number;
  name: string;
  tagIds: number[];
  priceBlock: string;
  reviewSpan: string;
}) {
  return `
    <a href="https://store.steampowered.com/app/${appid}/${name}/?snr=1"
       data-ds-appid="${appid}" data-ds-itemkey="App_${appid}" data-ds-tagids="[${tagIds.join(",")}]">
      <div class="search_capsule"><img src="https://example.com/${appid}/capsule.jpg"></div>
      <div class="responsive_search_name_combined">
        <div class="search_name ellipsis"><span class="title">${name}</span></div>
        <div class="search_released responsive_secondrow">1 Jan, 2024</div>
        <div class="search_reviewscore responsive_secondrow">${reviewSpan}</div>
        <div class="search_price_discount_combined responsive_secondrow" data-price-final="0">
          <div class="search_discount_and_price responsive_secondrow">${priceBlock}</div>
        </div>
      </div>
    </a>
  `;
}

const FREE_PRICE_BLOCK = `<div class="discount_block search_discount_block no_discount" data-discount="0"><div class="discount_prices"><div class="discount_final_price free">Free</div></div></div>`;

const NO_DISCOUNT_PRICE_BLOCK = `<div class="discount_block search_discount_block no_discount" data-discount="0"><div class="discount_prices"><div class="discount_final_price">₩ 27,000</div></div></div>`;

const DISCOUNTED_PRICE_BLOCK = `<div class="discount_block search_discount_block" data-discount="25"><div class="discount_pct">-25%</div><div class="discount_prices"><div class="discount_original_price">₩ 66,000</div><div class="discount_final_price">₩ 49,500</div></div></div>`;

const POSITIVE_REVIEW_SPAN = `<span class="search_review_summary positive" data-tooltip-html="Overwhelmingly Positive&lt;br&gt;96% of the 444,334 user reviews for this game are positive.&lt;br&gt;"></span>`;

const MIXED_REVIEW_SPAN = `<span class="search_review_summary mixed" data-tooltip-html="Mixed&lt;br&gt;41% of the 1,200 user reviews for this game are positive.&lt;br&gt;"></span>`;

const NO_REVIEW_SPAN = ``;

describe("parseSteamSearchHtml", () => {
  it("parses a free game with no discount block price text", () => {
    const html = itemHtml({
      appid: 730,
      name: "Counter-Strike 2",
      tagIds: [19],
      priceBlock: FREE_PRICE_BLOCK,
      reviewSpan: POSITIVE_REVIEW_SPAN,
    });

    const [game] = parseSteamSearchHtml(html);

    expect(game.appid).toBe(730);
    expect(game.name).toBe("Counter-Strike 2");
    expect(game.priceInitial).toBe(0);
    expect(game.priceFinal).toBe(0);
    expect(game.discountPercent).toBe(0);
  });

  it("parses a discounted paid game", () => {
    const html = itemHtml({
      appid: 1086940,
      name: "Baldurs Gate 3",
      tagIds: [122],
      priceBlock: DISCOUNTED_PRICE_BLOCK,
      reviewSpan: POSITIVE_REVIEW_SPAN,
    });

    const [game] = parseSteamSearchHtml(html);

    expect(game.priceInitial).toBe(66000);
    expect(game.priceFinal).toBe(49500);
    expect(game.discountPercent).toBe(25);
    expect(game.reviewPercent).toBe(96);
    expect(game.reviewCount).toBe(444334);
  });

  it("parses a full-price game with no discount as priceInitial === priceFinal", () => {
    const html = itemHtml({
      appid: 1142710,
      name: "Total War Warhammer III",
      tagIds: [9],
      priceBlock: NO_DISCOUNT_PRICE_BLOCK,
      reviewSpan: MIXED_REVIEW_SPAN,
    });

    const [game] = parseSteamSearchHtml(html);

    expect(game.priceInitial).toBe(27000);
    expect(game.priceFinal).toBe(27000);
    expect(game.discountPercent).toBe(0);
  });

  it("returns null reviewPercent when review data is missing (too few reviews)", () => {
    const html = itemHtml({
      appid: 999,
      name: "Brand New Game",
      tagIds: [19],
      priceBlock: NO_DISCOUNT_PRICE_BLOCK,
      reviewSpan: NO_REVIEW_SPAN,
    });

    const [game] = parseSteamSearchHtml(html);

    expect(game.reviewPercent).toBeNull();
    expect(game.reviewCount).toBe(0);
  });

  it("cross-references tag ids against curated genres to produce readable tags", () => {
    const html = itemHtml({
      appid: 1623730,
      name: "Palworld",
      tagIds: [19, 21, 999999],
      priceBlock: NO_DISCOUNT_PRICE_BLOCK,
      reviewSpan: POSITIVE_REVIEW_SPAN,
    });

    const [game] = parseSteamSearchHtml(html);

    expect(game.tags).toEqual(["Action", "Adventure"]);
  });

  it("parses multiple items from a combined results_html blob", () => {
    const html =
      itemHtml({
        appid: 1,
        name: "Game One",
        tagIds: [19],
        priceBlock: FREE_PRICE_BLOCK,
        reviewSpan: POSITIVE_REVIEW_SPAN,
      }) +
      itemHtml({
        appid: 2,
        name: "Game Two",
        tagIds: [122],
        priceBlock: NO_DISCOUNT_PRICE_BLOCK,
        reviewSpan: MIXED_REVIEW_SPAN,
      });

    const games = parseSteamSearchHtml(html);

    expect(games).toHaveLength(2);
    expect(games.map((g) => g.appid)).toEqual([1, 2]);
  });

  it("degrades a malformed tag id list to an empty tags array instead of failing the whole batch", () => {
    const malformed = itemHtml({
      appid: 1,
      name: "Malformed Game",
      tagIds: [19],
      priceBlock: FREE_PRICE_BLOCK,
      reviewSpan: POSITIVE_REVIEW_SPAN,
    }).replace('data-ds-tagids="[19]"', 'data-ds-tagids="[19,]"');

    const valid = itemHtml({
      appid: 2,
      name: "Valid Game",
      tagIds: [122],
      priceBlock: NO_DISCOUNT_PRICE_BLOCK,
      reviewSpan: MIXED_REVIEW_SPAN,
    });

    const games = parseSteamSearchHtml(malformed + valid);

    expect(games).toHaveLength(2);
    expect(games[0]).toMatchObject({ appid: 1, tags: [] });
    expect(games[1]).toMatchObject({ appid: 2, tags: ["RPG"] });
  });
});
