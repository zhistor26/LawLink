import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAiSettingsPublic, AI_DEFAULTS } from "@/server/settings/ai-actions";
import { AiSettingsForm } from "./_components/ai-settings-form";

export default async function AiSettingsPage() {
  const session = await getSession();
  if (session?.user.role !== "ADMIN") redirect("/settings/profile");

  const current = await getAiSettingsPublic();
  return <AiSettingsForm initial={current} defaults={AI_DEFAULTS} />;
}
