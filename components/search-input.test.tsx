import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("calls onChange with the new value when the user types", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);

    const input = screen.getByRole("searchbox", { name: /게임 이름 검색/ });
    fireEvent.change(input, { target: { value: "elden" } });

    expect(onChange).toHaveBeenCalledWith("elden");
  });

  it("reflects the value prop", () => {
    render(<SearchInput value="diablo" onChange={vi.fn()} />);

    expect(screen.getByRole("searchbox")).toHaveValue("diablo");
  });
});
