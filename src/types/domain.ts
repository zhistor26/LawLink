export type UserRole = "ADMIN" | "PRINCIPAL_LAWYER" | "LAWYER" | "ASSISTANT" | "FINANCE";

export type MatterStatus = "INTAKE" | "PENDING_CONFIRMATION" | "IN_PROGRESS" | "CLOSED" | "ARCHIVED";

export type MatterType = "LITIGATION" | "NON_LITIGATION" | "LEGAL_COUNSEL" | "SPECIAL_PROJECT";

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";

export type IntakeSummary = {
  id: string;
  title: string;
  clientName: string;
  opponentName: string;
  matterType: MatterType;
  causeOfAction: string;
  status: MatterStatus;
  receivedAt: string;
  owner: string;
  conflictSeverity: ConflictSeverity;
};

export type MatterSummary = {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  matterType: MatterType;
  status: MatterStatus;
  causeOfAction: string;
  court?: string;
  owner: string;
  nextAction: string;
  nextActionAt: string;
  receivable: number;
  received: number;
};

export type ConflictHit = {
  id: string;
  query: string;
  matchedMatter: string;
  matchedParty: string;
  role: string;
  severity: ConflictSeverity;
  basis: string;
};
