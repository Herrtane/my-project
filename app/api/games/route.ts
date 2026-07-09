import { GENRES } from "@/config/genres";
import { parseSteamSearchHtml } from "@/lib/steam-search-parser";

export const revalidate = 60;

const STEAM_SEARCH_URL = "https://store.steampowered.com/search/results/";
const STEAM_FETCH_TIMEOUT_MS = 8000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genreLabel = searchParams.get("genre") ?? "전체";
  const genre = GENRES.find((g) => g.label === genreLabel);

  if (!genre) {
    return Response.json({ error: "Unknown genre" }, { status: 400 });
  }

  const search = searchParams.get("search")?.trim();

  const url = new URL(STEAM_SEARCH_URL);
  if (genre.steamTagId !== null) {
    url.searchParams.set("tags", String(genre.steamTagId));
  }
  if (search) {
    url.searchParams.set("term", search);
  }
  url.searchParams.set("category1", "998");
  url.searchParams.set("cc", "kr");
  url.searchParams.set("supportedlang", "english");
  url.searchParams.set("json", "1");
  url.searchParams.set("infinite", "1");
  url.searchParams.set("count", "50");

  try {
    const steamResponse = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(STEAM_FETCH_TIMEOUT_MS),
      next: { revalidate: 60 },
    });

    if (!steamResponse.ok) {
      console.error(`Steam search request failed with status ${steamResponse.status}`);
      return Response.json({ error: "Steam request failed" }, { status: 502 });
    }

    const data: { results_html: string } = await steamResponse.json();
    const games = parseSteamSearchHtml(data.results_html).slice(0, 50);

    return Response.json({ games });
  } catch (error) {
    console.error("Steam search request failed", error);
    return Response.json({ error: "Steam request failed" }, { status: 502 });
  }
}
