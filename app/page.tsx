"use client";

import { useState } from "react";
import { GameDetailModal } from "@/components/game-detail-modal";
import { GameGrid } from "@/components/game-grid";
import { GenreFilter } from "@/components/genre-filter";
import { RandomPickButton } from "@/components/random-pick-button";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/types/game";

const SEARCH_DEBOUNCE_MS = 400;

export default function Page() {
  const [genre, setGenre] = useState("전체");
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { games, status, refetch } = useGames(genre, debouncedSearch);

  return (
    <div className="@container mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-bold">게임 탐색기</span>
        <ThemeToggle />
      </div>
      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} />
      </div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <GenreFilter value={genre} onChange={setGenre} />
        <RandomPickButton games={games} status={status} onPick={setSelectedGame} />
      </div>
      <GameGrid
        games={games}
        status={status}
        onSelectGame={setSelectedGame}
        onRetry={refetch}
      />
      <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}
