"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CheckCircle2,
  Archive,
  Pause,
  Play,
  Loader2,
  MoreHorizontal,
  Lock
} from "lucide-react";
import type { MatterStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { ArchiveExportButton } from "@/components/files/archive-export-button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  closeMatter,
  reopenMatter,
  holdMatter
} from "@/server/matters/lifecycle";
import { ArchiveWizardDialog } from "./archive-wizard";
import { clearBodyPointerEvents } from "@/lib/ui/clear-body-pointer-events";

export function LifecycleActions({
  matterId,
  status,
  canArchive
}: {
  matterId: string;
  status: MatterStatus;
  canArchive: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<"close" | "hold" | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [text, setText] = useState("");

  const isArchived = status === "ARCHIVED";

  function afterMenuClose(action: () => void) {
    setMenuOpen(false);
    // 等 DropdownMenu 卸载后再开 Dialog，避免 Radix 焦点/指针事件冲突
    window.setTimeout(action, 0);
  }

  function open(d: "close" | "hold") {
    afterMenuClose(() => {
      setText("");
      setDialog(d);
    });
  }

  function openArchive() {
    afterMenuClose(() => setArchiveOpen(true));
  }

  function closeDialog() {
    setDialog(null);
    clearBodyPointerEvents();
  }

  function handleSubmit() {
    if (dialog === "close" && !text.trim()) {
      toast.warning("请填写结案小结");
      return;
    }
    startTransition(async () => {
      try {
        if (dialog === "close") {
          await closeMatter({ id: matterId, summary: text });
          toast.success("案件已结案");
        } else if (dialog === "hold") {
          await holdMatter({ id: matterId, reason: text });
          toast.success("案件已暂停");
        }
        setDialog(null);
        clearBodyPointerEvents();
        router.refresh();
      } catch (err) {
        toast.error("操作失败", { description: err instanceof Error ? err.message : "" });
      }
    });
  }

  function handleReopen() {
    if (!confirm("将案件重新开放为'办理中'？")) return;
    startTransition(async () => {
      try {
        await reopenMatter(matterId);
        toast.success("案件已重新开放");
        router.refresh();
      } catch (err) {
        toast.error("操作失败", { description: err instanceof Error ? err.message : "" });
      }
    });
  }

  if (isArchived) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#9B7BF7]/30 bg-[#9B7BF7]/10 px-3 py-1.5 text-xs text-[#9B7BF7]">
          <Lock className="h-3.5 w-3.5" />
          已归档（只读）
        </span>
        <ArchiveExportButton
          matterId={matterId}
          className="h-auto gap-1.5 rounded-md border border-border/60 px-3 py-1.5 text-xs hover:bg-muted/30"
        >
          导出 ZIP
        </ArchiveExportButton>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending} className="gap-1.5">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MoreHorizontal className="h-3.5 w-3.5" />}
            状态
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {(status === "ON_HOLD" || status === "CLOSED") && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                afterMenuClose(handleReopen);
              }}
            >
              <Play className="mr-2 h-4 w-4" />
              重新开放
            </DropdownMenuItem>
          )}
          {status === "IN_PROGRESS" && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                open("hold");
              }}
            >
              <Pause className="mr-2 h-4 w-4" />
              暂停办理
            </DropdownMenuItem>
          )}
          {status !== "CLOSED" && (
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                open("close");
              }}
            >
              <CheckCircle2 className="mr-2 h-4 w-4 text-[#4ADE80]" />
              结案
            </DropdownMenuItem>
          )}
          {canArchive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  openArchive();
                }}
                className="text-[#9B7BF7] focus:text-[#9B7BF7]"
              >
                <Archive className="mr-2 h-4 w-4" />
                归档（不可逆）
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog
        open={dialog !== null}
        onOpenChange={(o) => {
          if (!o) closeDialog();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "close" ? "结案" : "暂停案件"}</DialogTitle>
            <DialogDescription>
              {dialog === "close" &&
                "结案后案件状态为'已结案'，仍可编辑。结案小结会进入时间线。"}
              {dialog === "hold" && "暂停后案件不再显示在'办理中'筛选。"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label className="text-xs">
              {dialog === "close" ? "结案小结" : "暂停原因"}
              {dialog === "close" && <span className="ml-1 text-destructive">*</span>}
            </Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                dialog === "close"
                  ? "如：经一审判决支持原告诉请，对方未上诉，判决已生效"
                  : "如：等待客户补充证据材料"
              }
              rows={5}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isPending}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {dialog === "close" ? "确认结案" : "确认暂停"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ArchiveWizardDialog
        matterId={matterId}
        open={archiveOpen}
        onOpenChange={(open) => {
          setArchiveOpen(open);
          if (!open) clearBodyPointerEvents();
        }}
      />
    </>
  );
}
