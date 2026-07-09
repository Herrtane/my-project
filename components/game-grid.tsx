"use client";

import { GameCard } from "@/components/game-card";
import { useGames } from "@/hooks/use-games";
import type { Game } from "@/types/game";

interface GameGridProps {
  genre: string;
  onSelectGame: (game: Game) => void;
}

export function GameGrid({ genre, onSelectGame }: GameGridProps) {
  const { games, status } = useGames(genre);

  if (status === "loading") {
    return null;
  }

  if (status === "error") {
    return null;
  }

  if (games.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @lg:grid-cols-3">
      {games.map((game, index) => (
        <GameCard
          key={game.appid}
          game={game}
          rank={index + 1}
          onSelect={onSelectGame}
        />
      ))}
    </div>
  );
}
