import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const MATTER_ID = "cl9b9xj8k0000qz6l5d8z8x8x";

const { refreshMock, closeMatterMock, holdMatterMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
  closeMatterMock: vi.fn(),
  holdMatterMock: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock })
}));

vi.mock("sonner", () => ({
  toast: {
    warning: vi.fn(),
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock("@/server/matters/lifecycle", () => ({
  closeMatter: closeMatterMock,
  holdMatter: holdMatterMock,
  reopenMatter: vi.fn()
}));

vi.mock("@/app/(app)/matters/[id]/_components/archive-wizard", () => ({
  ArchiveWizardDialog: () => null
}));

vi.mock("@/components/files/archive-export-button", () => ({
  ArchiveExportButton: ({ children }: { children: React.ReactNode }) => <span>{children}</span>
}));

import { LifecycleActions } from "@/app/(app)/matters/[id]/_components/lifecycle-actions";

describe("LifecycleActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.pointerEvents = "";
    closeMatterMock.mockResolvedValue({ ok: true });
  });

  it("从下拉菜单打开结案弹窗后取消，应恢复 body 可点击", async () => {
    const user = userEvent.setup();
    render(<LifecycleActions matterId={MATTER_ID} status="IN_PROGRESS" canArchive={false} />);

    await user.click(screen.getByRole("button", { name: "状态" }));
    await user.click(screen.getByRole("menuitem", { name: "结案" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "结案" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "取消" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "结案" })).not.toBeInTheDocument();
    });

    expect(document.body.style.pointerEvents).toBe("");
  });

  it("确认结案后调用 closeMatter 并刷新", async () => {
    const user = userEvent.setup();
    render(<LifecycleActions matterId={MATTER_ID} status="IN_PROGRESS" canArchive={false} />);

    await user.click(screen.getByRole("button", { name: "状态" }));
    await user.click(screen.getByRole("menuitem", { name: "结案" }));

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "结案" })).toBeInTheDocument();
    });

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "双方和解结案");
    await user.click(screen.getByRole("button", { name: "确认结案" }));

    await waitFor(() => {
      expect(closeMatterMock).toHaveBeenCalledWith({
        id: MATTER_ID,
        summary: "双方和解结案"
      });
    });
    expect(refreshMock).toHaveBeenCalled();
  });
});
