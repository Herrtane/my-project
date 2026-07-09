"use client";

import { SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/game-card";
import type { GamesStatus } from "@/hooks/use-games";
import type { Game } from "@/types/game";

interface GameGridProps {
  games: Game[];
  status: GamesStatus;
  onSelectGame: (game: Game) => void;
  onRetry: () => void;
}

function GameCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-3" data-testid="game-card-skeleton">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

export function GameGrid({ games, status, onSelectGame, onRetry }: GameGridProps) {
  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-3 @md:grid-cols-2 @lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <GameCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>게임 정보를 불러오지 못했습니다</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            다시 시도
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  if (games.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>해당 장르의 게임을 찾지 못했습니다.</EmptyTitle>
          <EmptyDescription>다른 장르를 선택해보세요.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
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
