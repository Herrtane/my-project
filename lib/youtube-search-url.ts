export function buildYoutubeSearchUrl(gameName: string): string {
  const query = encodeURIComponent(`${gameName} trailer`).replace(/%20/g, "+");
  return `https://www.youtube.com/results?search_query=${query}`;
}
