"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GENRES } from "@/config/genres";

interface GenreFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenreFilter({ value, onChange }: GenreFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next);
      }}
      className="w-full overflow-x-auto @md:flex-wrap @md:overflow-visible"
    >
      {GENRES.map((genre) => (
        <ToggleGroupItem key={genre.label} value={genre.label}>
          {genre.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
