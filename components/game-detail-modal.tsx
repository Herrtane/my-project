"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/format-price";
import {
  getRecommendationBadge,
  type RecommendationBadge,
} from "@/lib/recommendation-badge";
import { buildYoutubeSearchUrl } from "@/lib/youtube-search-url";
import type { Game } from "@/types/game";

interface GameDetailModalProps {
  game: Game | null;
  onClose: () => void;
}

const BADGE_VARIANT: Record<
  RecommendationBadge,
  "default" | "secondary" | "destructive" | "outline"
> = {
  "적극 추천": "default",
  "신중히 고려": "secondary",
  비추천: "destructive",
  "정보 부족": "outline",
};

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
        <a
          href={buildYoutubeSearchUrl(game.name)}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary underline underline-offset-4"
        >
          YouTube에서 트레일러 찾기
        </a>
      </DialogContent>
    </Dialog>
  );
}
