import { describe, expect, it, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import {
  LazyCatFileTrigger,
  LAZYCAT_FILE_INPUT_UPDATED
} from "@/components/files/lazy-cat-file-trigger";

describe("LazyCatFileTrigger", () => {
  it("自定义事件名与 inject 一致", () => {
    expect(LAZYCAT_FILE_INPUT_UPDATED).toBe("lzc:file-input-updated");
  });

  it("原生 change 触发 onFiles", () => {
    const onFiles = vi.fn();
    const { container } = render(
      <LazyCatFileTrigger onFiles={onFiles} showHint={false}>
        <button type="button">选择</button>
      </LazyCatFileTrigger>
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "a.pdf", { type: "application/pdf" });
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it("inject 自定义事件 lzc:file-input-updated 触发 onFiles", () => {
    const onFiles = vi.fn();
    const { container } = render(<LazyCatFileTrigger onFiles={onFiles} showHint={false} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "b.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });
    Object.defineProperty(input, "files", {
      value: [file],
      configurable: true
    });
    input.dispatchEvent(new CustomEvent(LAZYCAT_FILE_INPUT_UPDATED, { bubbles: true }));
    expect(onFiles).toHaveBeenCalledWith([file]);
  });
});
