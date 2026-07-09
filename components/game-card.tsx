"use client";

import { HeartIcon } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format-price";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
  rank: number;
  onSelect: (game: Game) => void;
  isFavorite: boolean;
  onToggleFavorite: (game: Game) => void;
}

export function GameCard({
  game,
  rank,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: GameCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      size="sm"
      aria-label={game.name}
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
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="즐겨찾기 토글"
        aria-pressed={isFavorite}
        className="absolute top-2 right-2 z-10"
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(game);
        }}
      >
        <HeartIcon className={cn(isFavorite && "fill-current")} />
      </Button>
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
        <Image
          src={game.thumbnailUrl}
          alt={game.name}
          fill
          unoptimized
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
