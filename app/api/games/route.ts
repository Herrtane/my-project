import { GENRES } from "@/config/genres";
import { parseSteamSearchHtml } from "@/lib/steam-search-parser";

export const revalidate = 60;

const STEAM_SEARCH_URL = "https://store.steampowered.com/search/results/";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genreLabel = searchParams.get("genre") ?? "전체";
  const genre = GENRES.find((g) => g.label === genreLabel);

  if (!genre) {
    return Response.json({ error: "Unknown genre" }, { status: 400 });
  }

  const url = new URL(STEAM_SEARCH_URL);
  if (genre.steamTagId !== null) {
    url.searchParams.set("tags", String(genre.steamTagId));
  }
  url.searchParams.set("category1", "998");
  url.searchParams.set("cc", "kr");
  url.searchParams.set("supportedlang", "english");
  url.searchParams.set("json", "1");
  url.searchParams.set("infinite", "1");
  url.searchParams.set("count", "20");

  try {
    const steamResponse = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!steamResponse.ok) {
      return Response.json({ error: "Steam request failed" }, { status: 502 });
    }

    const data: { results_html: string } = await steamResponse.json();
    const games = parseSteamSearchHtml(data.results_html).slice(0, 20);

    return Response.json({ games });
  } catch {
    return Response.json({ error: "Steam request failed" }, { status: 502 });
  }
}
