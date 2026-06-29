-- v0.44 保全三层表（补全此前空迁移 20260601_v044_preservation_three_layer）

CREATE TABLE "PreservationCase" (
    "id" TEXT NOT NULL,
    "matterId" TEXT,
    "type" "PreservationType" NOT NULL,
    "status" "PreservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "court" TEXT,
    "rulingNumber" TEXT,
    "guaranteeType" "GuaranteeType",
    "appliedAt" TIMESTAMP(3),
    "note" TEXT,
    "ownerId" TEXT,
    "remindDays" INTEGER[] DEFAULT ARRAY[30, 15, 7, 3, 1]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreservationCase_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PreservationTarget" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreservationTarget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PreservationProperty" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "propertyDetail" TEXT,
    "amount" DECIMAL(18,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "status" "PreservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreservationProperty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PreservationPropertyRenewal" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "renewedAt" TIMESTAMP(3) NOT NULL,
    "oldExpiryDate" TIMESTAMP(3) NOT NULL,
    "newExpiryDate" TIMESTAMP(3) NOT NULL,
    "renewalDuration" INTEGER NOT NULL,
    "note" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreservationPropertyRenewal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PreservationCase_matterId_idx" ON "PreservationCase"("matterId");
CREATE INDEX "PreservationCase_status_idx" ON "PreservationCase"("status");
CREATE INDEX "PreservationTarget_caseId_idx" ON "PreservationTarget"("caseId");
CREATE INDEX "PreservationProperty_targetId_idx" ON "PreservationProperty"("targetId");
CREATE INDEX "PreservationProperty_status_expiryDate_idx" ON "PreservationProperty"("status", "expiryDate");
CREATE INDEX "PreservationPropertyRenewal_propertyId_idx" ON "PreservationPropertyRenewal"("propertyId");

ALTER TABLE "PreservationCase" ADD CONSTRAINT "PreservationCase_matterId_fkey" FOREIGN KEY ("matterId") REFERENCES "Matter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PreservationCase" ADD CONSTRAINT "PreservationCase_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PreservationTarget" ADD CONSTRAINT "PreservationTarget_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "PreservationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreservationProperty" ADD CONSTRAINT "PreservationProperty_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "PreservationTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreservationPropertyRenewal" ADD CONSTRAINT "PreservationPropertyRenewal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "PreservationProperty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PreservationPropertyRenewal" ADD CONSTRAINT "PreservationPropertyRenewal_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 从旧版 Preservation 表迁移数据（若存在）
INSERT INTO "PreservationCase" (
    "id", "matterId", "type", "status", "court", "rulingNumber", "guaranteeType",
    "appliedAt", "note", "ownerId", "remindDays", "createdAt", "updatedAt"
)
SELECT
    p."id", p."matterId", p."type", p."status", p."court", p."rulingNumber", p."guaranteeType",
    p."appliedAt", p."note", p."ownerId", p."remindDays", p."createdAt", p."updatedAt"
FROM "Preservation" p
WHERE NOT EXISTS (SELECT 1 FROM "PreservationCase" c WHERE c."id" = p."id");

INSERT INTO "PreservationTarget" ("id", "caseId", "name", "note", "createdAt", "updatedAt")
SELECT
    p."id" || '-target',
    p."id",
    p."respondent",
    NULL,
    p."createdAt",
    p."updatedAt"
FROM "Preservation" p
WHERE NOT EXISTS (SELECT 1 FROM "PreservationTarget" t WHERE t."id" = p."id" || '-target');

INSERT INTO "PreservationProperty" (
    "id", "targetId", "propertyType", "propertyDetail", "amount",
    "startDate", "duration", "expiryDate", "status", "createdAt", "updatedAt"
)
SELECT
    p."id" || '-property',
    p."id" || '-target',
    p."propertyType",
    p."propertyDetail",
    p."amount",
    p."startDate",
    p."duration",
    p."expiryDate",
    p."status",
    p."createdAt",
    p."updatedAt"
FROM "Preservation" p
WHERE NOT EXISTS (SELECT 1 FROM "PreservationProperty" pp WHERE pp."id" = p."id" || '-property');

INSERT INTO "PreservationPropertyRenewal" (
    "id", "propertyId", "renewedAt", "oldExpiryDate", "newExpiryDate",
    "renewalDuration", "note", "performedById", "createdAt"
)
SELECT
    r."id",
    p."id" || '-property',
    r."renewedAt",
    r."oldExpiryDate",
    r."newExpiryDate",
    r."renewalDuration",
    r."note",
    r."performedById",
    r."createdAt"
FROM "PreservationRenewal" r
JOIN "Preservation" p ON p."id" = r."preservationId"
WHERE NOT EXISTS (SELECT 1 FROM "PreservationPropertyRenewal" pr WHERE pr."id" = r."id");
