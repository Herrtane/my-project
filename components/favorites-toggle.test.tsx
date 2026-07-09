import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FavoritesToggle } from "./favorites-toggle";

describe("FavoritesToggle", () => {
  it("shows the favorite count", () => {
    render(<FavoritesToggle count={3} active={false} onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /즐겨찾기/ })).toHaveTextContent("3");
  });

  it("reflects the active state via aria-pressed", () => {
    render(<FavoritesToggle count={0} active onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /즐겨찾기/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onToggle when clicked", async () => {
    const onToggle = vi.fn();
    render(<FavoritesToggle count={0} active={false} onToggle={onToggle} />);

    await userEvent.click(screen.getByRole("button", { name: /즐겨찾기/ }));

    expect(onToggle).toHaveBeenCalled();
  });
});
