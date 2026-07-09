import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GenreFilter } from "./genre-filter";

describe("GenreFilter", () => {
  it("renders all genre chips with the selected one pressed", () => {
    render(<GenreFilter value="전체" onChange={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "전체" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "RPG" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange with the clicked genre label", async () => {
    const onChange = vi.fn();
    render(<GenreFilter value="전체" onChange={onChange} />);

    await userEvent.click(screen.getByRole("radio", { name: "RPG" }));

    expect(onChange).toHaveBeenCalledWith("RPG");
  });
});
