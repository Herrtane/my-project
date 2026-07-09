export interface GenreOption {
  label: string;
  steamTagId: number | null;
}

export const GENRES: GenreOption[] = [
  { label: "전체", steamTagId: null },
  { label: "Action", steamTagId: 19 },
  { label: "RPG", steamTagId: 122 },
  { label: "Indie", steamTagId: 492 },
  { label: "Strategy", steamTagId: 9 },
  { label: "Simulation", steamTagId: 599 },
  { label: "Adventure", steamTagId: 21 },
  { label: "Sports", steamTagId: 701 },
  { label: "Racing", steamTagId: 699 },
];

export const GENRE_BY_TAG_ID: Record<number, string> = GENRES.reduce(
  (acc, genre) => {
    if (genre.steamTagId !== null) {
      acc[genre.steamTagId] = genre.label;
    }
    return acc;
  },
  {} as Record<number, string>,
);
