"use client";

import { HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoritesToggleProps {
  count: number;
  active: boolean;
  onToggle: () => void;
}

export function FavoritesToggle({ count, active, onToggle }: FavoritesToggleProps) {
  return (
    <Button
      variant={active ? "default" : "outline"}
      aria-pressed={active}
      onClick={onToggle}
    >
      <HeartIcon data-icon="inline-start" />
      즐겨찾기 보기{count > 0 && ` (${count})`}
    </Button>
  );
}
