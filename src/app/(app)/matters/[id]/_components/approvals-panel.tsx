"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stamp, FileText, Plus, Loader2, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { listMatterInvoiceRequests } from "@/server/finance/actions";
import { InvoiceRequestSheet } from "./invoice-request-sheet";
import type { SealContractItem } from "./info-extras";

type InvoiceRequestRow = Awaited<ReturnType<typeof listMatterInvoiceRequests>>[number];

export function ApprovalsPanel({
  matterId,
  matterTitle,
  sealContracts
}: {
  matterId: string;
  matterTitle: string;
  sealContracts: SealContractItem[];
}) {
  const [invoiceRequests, setInvoiceRequests] = useState<InvoiceRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  function reload() {
    setLoading(true);
    listMatterInvoiceRequests(matterId)
      .then(setInvoiceRequests)
      .catch(() => setInvoiceRequests([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    reload();
  }, [matterId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Link
          href="/approvals/seals"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm text-foreground transition-colors hover:bg-muted/50"
        >
          <Stamp className="h-3.5 w-3.5" />
          <Plus className="h-3 w-3" />
          发起用印
        </Link>
        <Button size="sm" onClick={() => setInvoiceOpen(true)} className="h-8 gap-1.5">
          <Receipt className="h-3.5 w-3.5" />
          <Plus className="h-3 w-3" />
          申请开票
        </Button>
      </div>

      {/* 用印审批 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-[13px] font-medium">
            <Stamp className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
            用印审批
          </span>
          <span className="font-mono text-[11px] text-muted-foreground tabular">
            {sealContracts.length}
          </span>
        </header>
        {sealContracts.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">暂无用印申请</p>
        ) : (
          <ul className="divide-y divide-border">
            {sealContracts.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 px-4 py-2 text-[12.5px]"
              >
                <span className="font-mono text-[11px] text-muted-foreground">{s.code}</span>
                <span className="min-w-0 flex-1 truncate">{s.documentTitle}</span>
                <SealStatusBadge status={s.status} />
                <Link
                  href={`/approvals/seals?id=${s.id}`}
                  className="text-[11px] text-primary hover:text-primary/80"
                >
                  详情
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 开票审批 */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-2">
          <span className="text-[13px] font-medium">
            <Receipt className="mr-1.5 inline h-3.5 w-3.5 text-primary" />
            开票申请
          </span>
          <span className="font-mono text-[11px] text-muted-foreground tabular">
            {invoiceRequests.length}
          </span>
        </header>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : invoiceRequests.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">暂无开票申请</p>
        ) : (
          <ul className="divide-y divide-border">
            {invoiceRequests.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-3 px-4 py-2 text-[12.5px]"
              >
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">
                  ¥{Number(r.amount).toLocaleString()}
                  {r.title && (
                    <span className="ml-2 text-muted-foreground">{r.title}</span>
                  )}
                </span>
                <InvoiceStatusBadge status={r.status} />
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  {new Date(r.requestedAt).toLocaleDateString("zh-CN")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InvoiceRequestSheet
        open={invoiceOpen}
        onOpenChange={(o) => {
          setInvoiceOpen(o);
          if (!o) reload();
        }}
        matterId={matterId}
      />
    </div>
  );
}

function SealStatusBadge({ status }: { status: string }) {
  const tone =
    status === "APPROVED" || status === "COMPLETED"
      ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
      : status === "REJECTED"
        ? "text-red-700 bg-red-500/10 border-red-500/20"
        : "text-amber-700 bg-amber-500/10 border-amber-500/20";
  return (
    <Badge variant="outline" className={cn("h-5 border px-1.5 text-[10px]", tone)}>
      {status}
    </Badge>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const tone =
    status === "ISSUED"
      ? "text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
      : status === "REJECTED"
        ? "text-red-700 bg-red-500/10 border-red-500/20"
        : status === "APPROVED"
          ? "text-blue-700 bg-blue-500/10 border-blue-500/20"
          : "text-amber-700 bg-amber-500/10 border-amber-500/20";
  return (
    <Badge variant="outline" className={cn("h-5 border px-1.5 text-[10px]", tone)}>
      {status}
    </Badge>
  );
}
