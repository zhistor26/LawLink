"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  billingCreateSchema,
  feeEntryCreateSchema,
  type BillingCreateInput,
  type FeeEntryCreateInput
} from "@/server/finance/schemas";
import {
  createBilling,
  createFeeEntry,
  setCommissionPlan
} from "@/server/finance/actions";
import { userRoleLabel } from "@/lib/enums";

// ============ AddBillingSheet ============

export function AddBillingSheet({
  open,
  onOpenChange,
  matterId
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  matterId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<BillingCreateInput>({
    resolver: zodResolver(billingCreateSchema),
    defaultValues: {
      matterId,
      title: "",
      contractAmount: 0,
      schedule: "",
      status: "ACTIVE"
    }
  });

  function onSubmit(values: BillingCreateInput) {
    startTransition(async () => {
      try {
        await createBilling(values);
        toast.success("合同已创建");
        reset();
        onOpenChange(false);
      } catch (err) {
        toast.error("失败", { description: err instanceof Error ? err.message : "" });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border bg-background/60 px-6 py-4 backdrop-blur">
          <SheetTitle>新增合同</SheetTitle>
          <SheetDescription className="text-xs">
            一个案件可以有多份合同（如分阶段委托）
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
            <Field label="合同名称" required error={errors.title?.message}>
              <Input
                placeholder="如：委托代理合同 - 一审阶段"
                {...register("title")}
              />
            </Field>

            <Field label="合同金额（元）" required>
              <Input
                type="number"
                step="0.01"
                className="font-mono tabular"
                {...register("contractAmount", { valueAsNumber: true })}
              />
            </Field>

            <Field label="状态">
              <Select
                value={watch("status")}
                onValueChange={(v) =>
                  setValue("status", v as BillingCreateInput["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="ACTIVE">生效中</SelectItem>
                  <SelectItem value="CLOSED">已结清</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="签订日期">
              <Input type="date" {...register("signedAt", { valueAsDate: true })} />
            </Field>

            <Field label="阶段付款约定">
              <Textarea
                rows={4}
                placeholder="如：签约时收 30%，立案时收 30%，判决生效后收 40%"
                {...register("schedule")}
              />
            </Field>
          </div>

          <SheetFooter className="border-t border-border bg-background/60 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              创建
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ============ AddFeeEntrySheet ============

export function AddFeeEntrySheet({
  open,
  onOpenChange,
  matterId,
  billings
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  matterId: string;
  billings: { id: string; title: string }[];
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FeeEntryCreateInput>({
    resolver: zodResolver(feeEntryCreateSchema),
    defaultValues: {
      matterId,
      billingId: "",
      type: "RECEIVED",
      amount: 0,
      occurredAt: new Date(),
      invoiceNo: "",
      payerOrPayee: "",
      method: "",
      note: ""
    }
  });

  const type = watch("type");

  function onSubmit(values: FeeEntryCreateInput) {
    startTransition(async () => {
      try {
        await createFeeEntry(values);
        toast.success(
          values.type === "RECEIVED" ? "实收已录入，分成已自动计算" : "记录已创建"
        );
        reset();
        onOpenChange(false);
      } catch (err) {
        toast.error("失败", { description: err instanceof Error ? err.message : "" });
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col gap-0 p-0">
        <SheetHeader className="border-b border-border bg-background/60 px-6 py-4 backdrop-blur">
          <SheetTitle>新增收付记录</SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
            <Field label="类型" required>
              <div className="grid grid-cols-4 gap-1.5">
                {(["RECEIVABLE", "RECEIVED", "REFUND", "COST"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue("type", t)}
                    className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                      type === t
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-background/40 text-muted-foreground hover:border-input"
                    }`}
                  >
                    {t === "RECEIVABLE"
                      ? "应收"
                      : t === "RECEIVED"
                        ? "实收"
                        : t === "REFUND"
                          ? "退款"
                          : "成本"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="金额（元）" required error={errors.amount?.message}>
              <Input
                type="number"
                step="0.01"
                className="font-mono tabular"
                {...register("amount", { valueAsNumber: true })}
              />
            </Field>

            <Field label="发生日期" required>
              <Input
                type="date"
                {...register("occurredAt", { valueAsDate: true })}
              />
            </Field>

            {billings.length > 0 && (
              <Field label="关联合同">
                <Select
                  value={watch("billingId") || "none"}
                  onValueChange={(v) =>
                    setValue("billingId", v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不关联</SelectItem>
                    {billings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field label="付款方 / 收款方">
              <Input placeholder="如 上海青石建设有限公司" {...register("payerOrPayee")} />
            </Field>

            <Field label="方式">
              <Input placeholder="转账 / 现金 / 支付宝" {...register("method")} />
            </Field>

            <Field label="发票号">
              <Input className="font-mono" {...register("invoiceNo")} />
            </Field>

            <Field label="备注">
              <Textarea rows={2} {...register("note")} />
            </Field>
          </div>

          <SheetFooter className="border-t border-border bg-background/60 px-6 py-4 backdrop-blur">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {type === "RECEIVED" ? "记录实收（自动分成）" : "保存"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ============ EditCommissionPlanDialog ============

type PlanRow = { userId: string; percent: number; label: string };

export function EditCommissionPlanDialog({
  open,
  onOpenChange,
  matterId,
  userOptions,
  initialPlans
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  matterId: string;
  userOptions: { id: string; name: string; role: string }[];
  initialPlans: PlanRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [plans, setPlans] = useState<PlanRow[]>(initialPlans);

  function addRow() {
    const available = userOptions.find((u) => !plans.some((p) => p.userId === u.id));
    if (available) {
      setPlans([...plans, { userId: available.id, percent: 0, label: "" }]);
    } else {
      toast.warning("已为所有用户添加分成");
    }
  }

  function removeRow(idx: number) {
    setPlans(plans.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, patch: Partial<PlanRow>) {
    setPlans(plans.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }

  const total = plans.reduce((acc, p) => acc + p.percent, 0);

  function handleSave() {
    if (total > 100) {
      toast.error("分成总和不能超过 100%");
      return;
    }
    startTransition(async () => {
      try {
        await setCommissionPlan({ matterId, items: plans });
        toast.success("分成方案已保存");
        onOpenChange(false);
      } catch (err) {
        toast.error("保存失败", {
          description: err instanceof Error ? err.message : ""
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>分成方案</DialogTitle>
          <p className="text-xs text-muted-foreground">
            未列入的比例归律所留存。实收时按此方案自动派生分成条目。
          </p>
        </DialogHeader>

        <div className="space-y-2">
          {plans.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-background/40 py-6 text-center text-xs text-muted-foreground">
              未配置分成
            </p>
          ) : (
            plans.map((p, idx) => {
              const user = userOptions.find((u) => u.id === p.userId);
              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 rounded-lg border border-border bg-background/40 p-3"
                >
                  <div className="col-span-4">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      用户
                    </Label>
                    <Select
                      value={p.userId}
                      onValueChange={(v) => updateRow(idx, { userId: v })}
                    >
                      <SelectTrigger className="mt-1 h-9 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {userOptions.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name} · {userRoleLabel[u.role as keyof typeof userRoleLabel] ?? u.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      百分比
                    </Label>
                    <Input
                      type="number"
                      step="0.5"
                      min={0}
                      max={100}
                      value={p.percent}
                      onChange={(e) =>
                        updateRow(idx, { percent: Number(e.target.value) || 0 })
                      }
                      className="mt-1 h-9 bg-background font-mono tabular"
                    />
                  </div>
                  <div className="col-span-4">
                    <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      标签
                    </Label>
                    <Input
                      value={p.label}
                      onChange={(e) => updateRow(idx, { label: e.target.value })}
                      placeholder="主办律师 / 推荐人 / 合伙人"
                      className="mt-1 h-9 bg-background"
                    />
                  </div>
                  <div className="col-span-1 flex items-end justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(idx)}
                      className="h-9 w-9 p-0 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-background/40 px-3 py-2">
          <Button variant="outline" size="sm" onClick={addRow} className="h-7 gap-1">
            <Plus className="h-3.5 w-3.5" />
            添加
          </Button>
          <div className="flex items-center gap-4 text-xs">
            <div>
              受益人合计：
              <span className="ml-1 font-mono tabular text-foreground">{total.toFixed(1)}%</span>
            </div>
            <div>
              律所留存：
              <span className="ml-1 font-mono tabular text-muted-foreground">
                {Math.max(0, 100 - total).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            取消
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="gap-1.5">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            保存方案
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Shared Field ============

function Field({
  label,
  required,
  error,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1 text-xs">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
