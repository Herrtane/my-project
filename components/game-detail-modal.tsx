"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRecommendationBadge } from "@/lib/recommendation-badge";
import type { Game } from "@/types/game";

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
}

const BADGE_VARIANT = {
  적극추천: "default",
  신중히고려: "secondary",
  비추천: "destructive",
  정보부족: "outline",
} as const;

function formatPrice(value: number): string {
  if (value === 0) return "무료";
  return `₩${value.toLocaleString()}`;
}

export function GameDetailModal({ game, onClose }: GameDetailModalProps) {
  if (!game) return null;

  const badge = getRecommendationBadge(game.reviewPercent, game.reviewCount);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{game.name}</DialogTitle>
        </DialogHeader>
        <Badge variant={BADGE_VARIANT[badge]}>{badge}</Badge>
        <div className="text-sm">
          {game.discountPercent > 0 ? (
            <>
              <s>{formatPrice(game.priceInitial)}</s> {formatPrice(game.priceFinal)} (
              {game.discountPercent}%)
            </>
          ) : (
            formatPrice(game.priceFinal)
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {game.reviewPercent !== null
            ? `리뷰 긍정률 ${game.reviewPercent}%`
            : "리뷰 정보 부족"}
        </div>
        <a
          href={`https://store.steampowered.com/app/${game.appid}`}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline underline-offset-4"
        >
          Steam에서 보기
        </a>
      </DialogContent>
    </Dialog>
  );
}
