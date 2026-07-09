"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game } from "@/types/game";

export type GamesStatus = "loading" | "error" | "success";

interface UseGamesResult {
  games: Game[];
  status: GamesStatus;
  refetch: () => void;
}

export function useGames(genre: string): UseGamesResult {
  const [games, setGames] = useState<Game[]>([]);
  const [status, setStatus] = useState<GamesStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    fetch(`/api/games?genre=${encodeURIComponent(genre)}`)
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((data: { games: Game[] }) => {
        if (cancelled) return;
        setGames(data.games);
        setStatus("success");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [genre, attempt]);

  const refetch = useCallback(() => setAttempt((a) => a + 1), []);

  return { games, status, refetch };
}
