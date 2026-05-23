import { listMatters } from "@/server/matters/actions";
import { listIntakes } from "@/server/intakes/actions";
import { listClients } from "@/server/clients/actions";
import { listActiveColleagues } from "@/server/users/actions";
import { MattersView } from "./_components/matters-view";
import type { MatterCategory } from "@prisma/client";

export type MattersTab = "intake" | "active" | "closed";

function resolveTab(input?: string): MattersTab {
  if (input === "intake" || input === "closed") return input;
  return "active";
}

type Props = {
  searchParams: {
    tab?: string;
    search?: string;
    category?: MatterCategory;
    page?: string;
    new?: string;
  };
};

export default async function MattersPage({ searchParams }: Props) {
  const tab = resolveTab(searchParams.tab);
  const page = searchParams.page ? Number(searchParams.page) : 1;

  // 收案抽屉所需：客户下拉 + 同事列表
  const [clientsResponse, colleagues] = await Promise.all([
    listClients({ pageSize: 100 }),
    listActiveColleagues()
  ]);

  if (tab === "intake") {
    // 待审批：直接看 Intake（status ∈ INTAKE / PENDING_CONFIRMATION）
    const intakes = await listIntakes({
      search: searchParams.search,
      // 不限单一 status，由列表层显示全部未转化/未拒绝
      page,
      pageSize: 30
    });
    return (
      <MattersView
        tab={tab}
        intakeData={{
          items: intakes.items
            .filter((i) => i.status === "INTAKE" || i.status === "PENDING_CONFIRMATION")
            .map((i) => ({
              id: i.id,
              title: i.title,
              category: i.category,
              status: i.status,
              receivedAt: i.receivedAt,
              client: i.client ? { id: i.client.id, name: i.client.name } : null,
              cause: i.cause,
              parties: i.parties,
              conflictChecks: i.conflictChecks,
              matter: i.matter
            })),
          total: intakes.items.filter(
            (i) => i.status === "INTAKE" || i.status === "PENDING_CONFIRMATION"
          ).length
        }}
        clientOptions={clientsResponse.items.map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type
        }))}
        colleagues={colleagues}
        initialFilters={{
          search: searchParams.search ?? "",
          category: searchParams.category ?? "ALL"
        }}
        autoOpenIntake={searchParams.new === "1"}
      />
    );
  }

  // active / closed：查 Matter 表
  const statusGroup =
    tab === "closed"
      ? { statusIn: ["CLOSED" as const, "ARCHIVED" as const] }
      : { statusNotIn: ["CLOSED" as const, "ARCHIVED" as const] };

  const matters = await listMatters({
    search: searchParams.search,
    category: searchParams.category,
    page,
    ...statusGroup
  });

  return (
    <MattersView
      tab={tab}
      matterData={matters}
      clientOptions={clientsResponse.items.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type
      }))}
      colleagues={colleagues}
      initialFilters={{
        search: searchParams.search ?? "",
        category: searchParams.category ?? "ALL"
      }}
      autoOpenIntake={searchParams.new === "1"}
    />
  );
}
