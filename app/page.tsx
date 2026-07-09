"use client";

import { useState } from "react";
import { FavoritesToggle } from "@/components/favorites-toggle";
import { GameDetailModal } from "@/components/game-detail-modal";
import { GameGrid } from "@/components/game-grid";
import { GenreFilter } from "@/components/genre-filter";
import { RandomPickButton } from "@/components/random-pick-button";
import { SearchInput } from "@/components/search-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useFavorites } from "@/hooks/use-favorites";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/types/game";

const SEARCH_DEBOUNCE_MS = 400;

export default function Page() {
  const [genre, setGenre] = useState("전체");
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [viewMode, setViewMode] = useState<"browse" | "favorites">("browse");
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const { games, status, refetch } = useGames(genre, debouncedSearch);
  const { favorites, isFavorite, toggleFavorite } = useFavorites();

  const isFavoritesView = viewMode === "favorites";

  return (
    <div className="@container mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-bold">자~ 오늘 해볼 게임은?</span>
        <div className="flex items-center gap-2">
          <FavoritesToggle
            count={favorites.length}
            active={isFavoritesView}
            onToggle={() => setViewMode(isFavoritesView ? "browse" : "favorites")}
          />
          <ThemeToggle />
        </div>
      </div>
      {!isFavoritesView && (
        <>
          <div className="mb-4">
            <SearchInput value={search} onChange={setSearch} />
          </div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <GenreFilter value={genre} onChange={setGenre} />
            <RandomPickButton games={games} status={status} onPick={setSelectedGame} />
          </div>
        </>
      )}
      {isFavoritesView ? (
        <GameGrid
          games={favorites}
          status="success"
          onSelectGame={setSelectedGame}
          onRetry={() => {}}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
          emptyTitle="즐겨찾기한 게임이 없습니다."
          emptyDescription="카드의 하트 아이콘을 눌러 추가해보세요."
        />
      ) : (
        <GameGrid
          games={games}
          status={status}
          onSelectGame={setSelectedGame}
          onRetry={refetch}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
      )}
      <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}
