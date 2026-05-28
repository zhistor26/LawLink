"use client";

/**
 * v0.27: 案件当事人卡片（matter-sheet / intake-sheet 共用）
 *
 * - partyType 切换：自然人 / 公司
 * - 自然人必填：身份证号
 * - 公司必填：统一社会信用代码（提供 AI 自动填，调元典 enterpriseSearch + Detail）
 * - 其他字段（法定代表人 / 注册地址 / 联系人 / 联系电话）非强制
 *
 * 校验落在 zod superRefine（partyInputSchema）；本组件只负责 UI + 字段联动。
 */
import { useState, useTransition, type ReactNode } from "react";
import { useFormContext, type FieldErrors } from "react-hook-form";
import { Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  searchEnterpriseCandidates,
  getEnterpriseDetail,
  type EnterpriseSearchItem
} from "@/server/yuandian/enterprise";

type Props = {
  index: number;
  fieldPrefix: string; // e.g. "parties"
  label: string;       // 显示头："对方 1" / "第三人 2"
  onRemove: () => void;
  errors?: FieldErrors<Record<string, unknown>>;
  /** 头部右侧额外 slot，常用于 intake 流程的诉讼地位下拉 */
  headerExtra?: ReactNode;
};

export function PartyCard({ index, fieldPrefix, label, onRemove, errors, headerExtra }: Props) {
  const { register, watch, setValue } = useFormContext();
  const p = `${fieldPrefix}.${index}`;
  const partyType = (watch(`${p}.partyType`) as "NATURAL_PERSON" | "ORGANIZATION") ?? "NATURAL_PERSON";

  const [candidates, setCandidates] = useState<EnterpriseSearchItem[] | null>(null);
  const [searching, startSearch] = useTransition();
  const [filling, startFill] = useTransition();

  function changeType(next: "NATURAL_PERSON" | "ORGANIZATION") {
    setValue(`${p}.partyType`, next, { shouldDirty: true, shouldValidate: true });
    // 切换类型时清空对侧的必填字段，避免提示串台
    if (next === "NATURAL_PERSON") {
      setValue(`${p}.enterpriseSocialCode`, "");
      setValue(`${p}.enterpriseName`, "");
    } else {
      setValue(`${p}.idNumber`, "");
    }
  }

  function handleAILookup() {
    const name = (watch(`${p}.name`) as string | undefined)?.trim();
    if (!name) {
      toast.warning("请先填写公司名称再点击 AI 查找");
      return;
    }
    startSearch(async () => {
      try {
        const r = await searchEnterpriseCandidates(name);
        if (!r.configured) {
          toast.error("元典 API 未配置，无法 AI 查找", {
            description: "请在 设置 → AI 与元典 中配置 API Key"
          });
          return;
        }
        if (r.items.length === 0) {
          toast.info("未找到候选企业", { description: "试试更完整的名称或简称" });
          return;
        }
        setCandidates(r.items);
      } catch (err) {
        toast.error("查找失败", {
          description: err instanceof Error ? err.message : ""
        });
      }
    });
  }

  function handlePickCandidate(item: EnterpriseSearchItem) {
    startFill(async () => {
      // 先回填 social code + 企业名称（搜索结果已有）
      setValue(`${p}.enterpriseSocialCode`, item.creditCode, { shouldDirty: true, shouldValidate: true });
      setValue(`${p}.enterpriseName`, item.name, { shouldDirty: true });
      setValue(`${p}.name`, item.name, { shouldDirty: true });
      setCandidates(null);

      // 再调详情接口拿法代 + 地址（10 POINT/次）
      try {
        const r = await getEnterpriseDetail(item.id);
        if (r.configured && r.info) {
          if (r.info.legalRep) setValue(`${p}.legalRep`, r.info.legalRep, { shouldDirty: true });
          if (r.info.address) setValue(`${p}.address`, r.info.address, { shouldDirty: true });
          toast.success(`已回填：${item.name}`);
        }
      } catch (err) {
        // 详情失败不阻塞，已填的 social code 仍有效
        toast.warning("法代 / 地址自动填充失败，可手动补充", {
          description: err instanceof Error ? err.message : ""
        });
      }
    });
  }

  const fieldErr = (errors as any)?.[fieldPrefix]?.[index] ?? {};

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {headerExtra}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => changeType("NATURAL_PERSON")}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
              partyType === "NATURAL_PERSON"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-input"
            )}
          >
            自然人
          </button>
          <button
            type="button"
            onClick={() => changeType("ORGANIZATION")}
            className={cn(
              "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
              partyType === "ORGANIZATION"
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-input"
            )}
          >
            公司 / 组织
          </button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="ml-1 h-6 w-6 p-0 text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="col-span-2">
          <Input
            placeholder={partyType === "ORGANIZATION" ? "公司 / 组织名称" : "姓名"}
            {...register(`${p}.name`)}
          />
        </div>

        {partyType === "NATURAL_PERSON" ? (
          <>
            <Input
              placeholder="身份证号（必填）"
              className={cn("font-mono", fieldErr.idNumber && "border-destructive")}
              {...register(`${p}.idNumber`)}
            />
            <Input placeholder="联系电话" {...register(`${p}.phone`)} />
            <div className="col-span-2">
              <Input placeholder="住址（可选）" {...register(`${p}.address`)} />
            </div>
            <div className="col-span-2">
              <Input placeholder="代理 / 协助联系人（可选）" {...register(`${p}.contactName`)} />
            </div>
            {fieldErr.idNumber && (
              <p className="col-span-2 text-[10px] text-destructive">
                {fieldErr.idNumber.message as string}
              </p>
            )}
          </>
        ) : (
          <>
            <div className="col-span-2 flex gap-1">
              <Input
                placeholder="统一社会信用代码（必填）"
                className={cn(
                  "flex-1 font-mono",
                  fieldErr.enterpriseSocialCode && "border-destructive"
                )}
                {...register(`${p}.enterpriseSocialCode`)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAILookup}
                disabled={searching || filling}
                className="h-9 shrink-0 gap-1"
                title="按公司名称在元典搜索 → 自动回填信用代码 + 法代 + 地址"
              >
                {searching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                AI 查找
              </Button>
            </div>

            {candidates && candidates.length > 0 && (
              <div className="col-span-2 rounded-md border border-border bg-muted/30 p-1.5">
                <div className="mb-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Search className="h-3 w-3" />
                  共 {candidates.length} 条候选，点击回填
                </div>
                <ul className="space-y-1">
                  {candidates.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handlePickCandidate(c)}
                        disabled={filling}
                        className="w-full rounded border border-border bg-background px-2 py-1.5 text-left text-xs hover:border-primary disabled:opacity-50"
                      >
                        <div className="font-medium">{c.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          {c.creditCode}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => setCandidates(null)}
                  className="mt-1 w-full text-[10px] text-muted-foreground hover:text-foreground"
                >
                  关闭
                </button>
              </div>
            )}

            <Input placeholder="法定代表人 / 负责人（可选）" {...register(`${p}.legalRep`)} />
            <Input placeholder="经办联系人（可选）" {...register(`${p}.contactName`)} />
            <div className="col-span-2">
              <Input placeholder="注册地址（可选）" {...register(`${p}.address`)} />
            </div>
            <Input placeholder="联系电话（可选）" {...register(`${p}.phone`)} />
            {fieldErr.enterpriseSocialCode && (
              <p className="col-span-2 text-[10px] text-destructive">
                {fieldErr.enterpriseSocialCode.message as string}
              </p>
            )}
          </>
        )}

        <div className="col-span-2">
          <Input placeholder="备注（可选）" {...register(`${p}.notes`)} />
        </div>
      </div>
    </div>
  );
}
