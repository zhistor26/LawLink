"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

// 注：完整实现在批 D（新建表单 + 关联收案 + 多附件 + 普专 + 名目）
export function InvoiceRequestSheet({
  open,
  onOpenChange,
  matterId
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  matterId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>申请开具发票</DialogTitle>
          <DialogDescription>
            完整开票申请表单将在下一批次提供，包含关联收案 / 开票依据上传 / 普票或专票 / 开票名目等。
            <br />
            <span className="font-mono text-[11px] text-muted-foreground">
              matterId: {matterId}
            </span>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
