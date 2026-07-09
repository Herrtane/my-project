"use client";

import { DicesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GamesStatus } from "@/hooks/use-games";
import type { Game } from "@/types/game";

interface RandomPickButtonProps {
  games: Game[];
  status: GamesStatus;
  onPick: (game: Game) => void;
}

export function RandomPickButton({ games, status, onPick }: RandomPickButtonProps) {
  const disabled = status !== "success" || games.length === 0;

  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={() => {
        const index = Math.floor(Math.random() * games.length);
        onPick(games[index]);
      }}
    >
      <DicesIcon data-icon="inline-start" />
      랜덤 추천
    </Button>
  );
}
