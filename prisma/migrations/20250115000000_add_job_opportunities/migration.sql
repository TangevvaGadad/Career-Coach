-- CreateTable
CREATE TABLE "JobOpportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "skills" TEXT[],
    "salary" TEXT,
    "experience" TEXT,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "postedDate" TIMESTAMP(3) NOT NULL,
    "deadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobOpportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobOpportunity_industry_idx" ON "JobOpportunity"("industry");

-- CreateIndex
CREATE INDEX "JobOpportunity_type_idx" ON "JobOpportunity"("type");

-- CreateIndex
CREATE INDEX "JobOpportunity_platform_idx" ON "JobOpportunity"("platform");

-- CreateIndex
CREATE INDEX "JobOpportunity_isActive_idx" ON "JobOpportunity"("isActive");
