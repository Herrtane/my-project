import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme }),
}));

describe("ThemeToggle", () => {
  it("switches to dark when currently light", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: /다크모드/ }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
