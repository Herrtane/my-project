"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/format-price";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  rank: number;
  onSelect: (game: Game) => void;
}

export function GameCard({ game, rank, onSelect }: GameCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      size="sm"
      onClick={() => onSelect(game)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(game);
        }
      }}
      className="relative cursor-pointer gap-2 overflow-hidden px-3"
    >
      <Badge className="absolute top-2 left-2 z-10">{rank}</Badge>
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={game.thumbnailUrl}
          alt={game.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
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
