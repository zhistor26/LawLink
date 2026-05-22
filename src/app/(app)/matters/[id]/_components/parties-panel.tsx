"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { clientTypeLabel } from "@/lib/enums";
import type { MatterPayload } from "./matter-detail-tabs";

export function PartiesPanel({ matter }: { matter: MatterPayload }) {
  const ourSide = matter.parties.filter((p) => p.role === "CLIENT_PARTY");
  const opposing = matter.parties.filter((p) => p.role === "OPPOSING_PARTY");
  const thirdParty = matter.parties.filter((p) => p.role === "THIRD_PARTY");

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      <Column title="委托方" color="#5B8DEF">
        {matter.clientLinks.map((cl) => (
          <Card
            key={cl.clientId}
            name={cl.client.name}
            sub={clientTypeLabel[cl.client.type]}
            href={`/clients/${cl.client.id}`}
            primary={cl.isPrimary}
          />
        ))}
        {ourSide.map((p) => (
          <Card key={p.id} name={p.name} sub={p.idNumber ?? undefined} />
        ))}
        {matter.clientLinks.length + ourSide.length === 0 && <Empty />}
      </Column>

      <Column title="对方" color="#FB923C">
        {opposing.length === 0 ? (
          <Empty />
        ) : (
          opposing.map((p) => (
            <Card
              key={p.id}
              name={p.name}
              sub={p.idNumber ?? undefined}
              extra={p.phone ?? p.address ?? undefined}
            />
          ))
        )}
      </Column>

      <Column title="第三人" color="#9B7BF7">
        {thirdParty.length === 0 ? (
          <Empty />
        ) : (
          thirdParty.map((p) => (
            <Card key={p.id} name={p.name} sub={p.idNumber ?? undefined} />
          ))
        )}
      </Column>
    </div>
  );
}

function Column({
  title,
  color,
  children
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Card({
  name,
  sub,
  extra,
  primary,
  href
}: {
  name: string;
  sub?: string;
  extra?: string;
  primary?: boolean;
  href?: string;
}) {
  const inner = (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2 transition-colors hover:bg-popover/40">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">{name}</span>
        {primary && (
          <Badge variant="secondary" className="text-[10px]">
            主
          </Badge>
        )}
      </div>
      {sub && (
        <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
      {extra && (
        <div className="mt-0.5 text-[11px] text-muted-foreground">{extra}</div>
      )}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="flex items-center gap-1">
        <div className="flex-1">{inner}</div>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
      </Link>
    );
  }
  return inner;
}

function Empty() {
  return (
    <div className="rounded-md border border-dashed border-border py-2 text-center text-[11px] text-muted-foreground">
      —
    </div>
  );
}
