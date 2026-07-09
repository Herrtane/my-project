"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  rank: number;
  onSelect: (game: Game) => void;
}

function formatPrice(value: number): string {
  if (value === 0) return "무료";
  return `₩${value.toLocaleString()}`;
}

export function GameCard({ game, rank, onSelect }: GameCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(game)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect(game);
      }}
      className="relative cursor-pointer gap-2 overflow-hidden p-3"
    >
      <Badge className="absolute top-2 left-2">{rank}</Badge>
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={game.thumbnailUrl}
          alt={game.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="truncate text-sm font-semibold">{game.name}</div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {game.discountPercent > 0 ? (
            <>
              <s>{formatPrice(game.priceInitial)}</s> {formatPrice(game.priceFinal)} (
              {game.discountPercent}%)
            </>
          ) : (
            formatPrice(game.priceFinal)
          )}
        </span>
        <span>
          {game.reviewPercent !== null ? `긍정 ${game.reviewPercent}%` : "정보 부족"}
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {game.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
