import { GENRE_BY_TAG_ID } from "@/config/genres";
import type { Game } from "@/types/game";

function parsePriceText(text: string | null): number {
  if (!text) return 0;
  if (/free/i.test(text)) return 0;
  const digits = text.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function extractTags(tagIds: number[]): string[] {
  return tagIds
    .map((id) => GENRE_BY_TAG_ID[id])
    .filter((label): label is string => Boolean(label));
}

function parseItem(chunk: string): Game | null {
  const appidMatch = chunk.match(/data-ds-appid="(\d+)"/);
  if (!appidMatch) return null;

  const tagIdsMatch = chunk.match(/data-ds-tagids="(\[[^\]]*\])"/);
  let tagIds: number[] = [];
  if (tagIdsMatch) {
    try {
      tagIds = JSON.parse(tagIdsMatch[1]);
    } catch {
      tagIds = [];
    }
  }

  const nameMatch = chunk.match(/class="title">([^<]*)</);
  const thumbnailMatch = chunk.match(/<img src="([^"]+)"/);

  const discountMatch = chunk.match(/data-discount="(\d+)"/);
  const discountPercent = discountMatch ? parseInt(discountMatch[1], 10) : 0;

  const finalPriceMatch = chunk.match(/discount_final_price[^>]*>([^<]*)</);
  const originalPriceMatch = chunk.match(/discount_original_price[^>]*>([^<]*)</);

  const priceFinal = parsePriceText(finalPriceMatch?.[1] ?? null);
  const priceInitial = originalPriceMatch
    ? parsePriceText(originalPriceMatch[1])
    : priceFinal;

  const reviewMatch = chunk.match(/(\d+)% of the ([\d,]+) user reviews/);
  const reviewPercent = reviewMatch ? parseInt(reviewMatch[1], 10) : null;
  const reviewCount = reviewMatch
    ? parseInt(reviewMatch[2].replace(/,/g, ""), 10)
    : 0;

  return {
    appid: parseInt(appidMatch[1], 10),
    name: nameMatch?.[1] ?? "",
    thumbnailUrl: thumbnailMatch?.[1] ?? "",
    priceInitial,
    priceFinal,
    discountPercent,
    reviewPercent,
    reviewCount,
    tags: extractTags(tagIds),
  };
}

export function parseSteamSearchHtml(resultsHtml: string): Game[] {
  const chunks = resultsHtml.split(/(?=<a href="https:\/\/store\.steampowered\.com\/app\/)/);
  const games = chunks
    .map((chunk) => {
      try {
        return parseItem(chunk);
      } catch {
        return null;
      }
    })
    .filter((game): game is Game => game !== null);

  const seenAppids = new Set<number>();
  return games.filter((game) => {
    if (seenAppids.has(game.appid)) return false;
    seenAppids.add(game.appid);
    return true;
  });
}
