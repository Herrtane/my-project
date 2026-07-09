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
  { label: "Puzzle", steamTagId: 1664 },
  { label: "Horror", steamTagId: 1667 },
  { label: "Fighting", steamTagId: 1743 },
  { label: "Platformer", steamTagId: 1625 },
  { label: "Roguelike", steamTagId: 1716 },
  { label: "Anime", steamTagId: 4085 },
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
