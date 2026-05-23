"use client";

import Link from "next/link";
import type { Matter } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  matterCategoryLabel,
  matterCategoryColor,
  matterStatusLabel,
  procedureTypeLabel
} from "@/lib/enums";

export type MatterRow = Matter & {
  primaryClient: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  cause: { id: string; name: string } | null;
  procedures: { id: string; type: string; caseNumber: string | null; status: string }[];
  _count: { procedures: number };
};

export function MattersTable({ items }: { items: MatterRow[] }) {
  if (items.length === 0) {
    return (
      <div className="ll-surface-quiet flex flex-col items-center gap-2 py-20 text-center">
        <div className="font-display text-base text-muted-foreground">
          没有匹配的案件
        </div>
        <div className="text-xs text-muted-subtle">
          点击右上角{" "}
          <span className="text-foreground/80">新建收案</span> 开始
        </div>
      </div>
    );
  }

  return (
    <div className="ll-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr
            className="border-b text-left font-eyebrow text-[0.6rem] text-muted-foreground/80"
            style={{ borderColor: "hsl(var(--hairline))" }}
          >
            <th className="px-5 py-2.5 font-semibold">案件</th>
            <th className="px-4 py-2.5 font-semibold">类别</th>
            <th className="px-4 py-2.5 font-semibold">委托方</th>
            <th className="px-4 py-2.5 font-semibold">当前程序</th>
            <th className="px-4 py-2.5 font-semibold">主办</th>
            <th className="px-4 py-2.5 font-semibold">状态</th>
            <th className="px-5 py-2.5 text-right font-semibold">更新</th>
          </tr>
        </thead>
        <tbody>
          {items.map((m, idx) => {
            const current = m.procedures[0];
            return (
              <tr
                key={m.id}
                className="group transition-colors hover:bg-muted/30"
                style={
                  idx > 0
                    ? { borderTop: "1px solid hsl(var(--hairline))" }
                    : undefined
                }
              >
                <td className="px-5 py-2.5">
                  <Link href={`/matters/${m.id}`} className="block">
                    <div className="font-mono text-[10.5px] tracking-wider text-muted-foreground tabular">
                      {m.internalCode}
                    </div>
                    <div className="mt-1 font-display text-[1.05rem] font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
                      {m.title}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px]"
                    style={{
                      borderColor: `${matterCategoryColor[m.category]}50`,
                      color: matterCategoryColor[m.category],
                      background: `${matterCategoryColor[m.category]}10`
                    }}
                  >
                    <span
                      className="h-1 w-1 rounded-full"
                      style={{ backgroundColor: matterCategoryColor[m.category] }}
                    />
                    {matterCategoryLabel[m.category]}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {m.primaryClient ? (
                    <Link
                      href={`/clients/${m.primaryClient.id}`}
                      className="text-[0.875rem] text-foreground/90 hover:text-primary"
                    >
                      {m.primaryClient.name}
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {current ? (
                    <div>
                      <div className="font-display text-[0.92rem] italic text-foreground/80">
                        {procedureTypeLabel[current.type as keyof typeof procedureTypeLabel]}
                      </div>
                      {current.caseNumber && (
                        <div className="font-mono text-[10.5px] text-muted-foreground tabular">
                          {current.caseNumber}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-[0.875rem] text-foreground/80">
                  {m.owner?.name ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-2.5">
                  <Badge
                    variant="outline"
                    className="border-hairline bg-muted/30 text-[10px] font-normal"
                    style={{ borderColor: "hsl(var(--hairline))" }}
                  >
                    {matterStatusLabel[m.status]}
                  </Badge>
                </td>
                <td className="px-5 py-2.5 text-right font-mono text-[11px] text-muted-foreground tabular">
                  {new Date(m.updatedAt).toLocaleDateString("zh-CN")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
