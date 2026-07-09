"use client";

import { useState } from "react";
import { GameDetailModal } from "@/components/game-detail-modal";
import { GameGrid } from "@/components/game-grid";
import { GenreFilter } from "@/components/genre-filter";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Game } from "@/types/game";

export default function Page() {
  const [genre, setGenre] = useState("전체");
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className="@container mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-bold">게임 탐색기</span>
        <ThemeToggle />
      </div>
      <div className="mb-4">
        <GenreFilter value={genre} onChange={setGenre} />
      </div>
      <GameGrid genre={genre} onSelectGame={setSelectedGame} />
      <GameDetailModal game={selectedGame} onClose={() => setSelectedGame(null)} />
    </div>
  );
}
