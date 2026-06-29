import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const useLazyCatNonModalDialogsMock = vi.fn(() => false);

vi.mock("@/lib/lazycat/use-lazycat-non-modal-dialogs", () => ({
  useLazyCatNonModalDialogs: () => useLazyCatNonModalDialogsMock()
}));

describe("LazyCat Dialog modal mode", () => {
  beforeEach(() => {
    useLazyCatNonModalDialogsMock.mockReturnValue(false);
  });

  it("懒猫环境 DialogContent 仍渲染手动遮罩", async () => {
    useLazyCatNonModalDialogsMock.mockReturnValue(true);
    const { Dialog, DialogContent, DialogHeader, DialogTitle } = await import(
      "@/components/ui/dialog"
    );

    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );

    expect(document.querySelector(".fixed.inset-0.z-50")).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "上传" })).toBeInTheDocument();
  });
});
