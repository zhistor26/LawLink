import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

describe("Dialog pointer-events cleanup", () => {
  it("关闭弹窗后清除 body 上的 pointer-events:none", async () => {
    const user = userEvent.setup();
    document.body.style.pointerEvents = "none";

    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>测试弹窗</DialogTitle>
          </DialogHeader>
          <p>内容</p>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(document.body.style.pointerEvents).toBe("");
  });
});
