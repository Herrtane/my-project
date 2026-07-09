"use client";

import { useState } from "react";
import { GameGrid } from "@/components/game-grid";
import { GenreFilter } from "@/components/genre-filter";

export default function Page() {
  const [genre, setGenre] = useState("전체");

  return (
    <div className="@container mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-bold">게임 탐색기</span>
      </div>
      <div className="mb-4">
        <GenreFilter value={genre} onChange={setGenre} />
      </div>
      <GameGrid genre={genre} onSelectGame={() => {}} />
    </div>
  );
}
