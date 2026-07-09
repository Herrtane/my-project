"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game } from "@/types/game";

const STORAGE_KEY = "game-explorer:favorites";

function readFavorites(): Game[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface UseFavoritesResult {
  favorites: Game[];
  isFavorite: (appid: number) => boolean;
  toggleFavorite: (game: Game) => void;
}

export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<Game[]>([]);

  useEffect(() => {
    setFavorites(readFavorites());
  }, []);

  const isFavorite = useCallback(
    (appid: number) => favorites.some((g) => g.appid === appid),
    [favorites],
  );

  const toggleFavorite = useCallback((game: Game) => {
    setFavorites((prev) => {
      const next = prev.some((g) => g.appid === game.appid)
        ? prev.filter((g) => g.appid !== game.appid)
        : [...prev, game];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
