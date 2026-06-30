-- CreateTable
CREATE TABLE "PayoffScenario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategy" TEXT NOT NULL,
    "extraPayment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "includedDebtTypes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoffScenario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayoffScenario_userId_idx" ON "PayoffScenario"("userId");

-- AddForeignKey
ALTER TABLE "PayoffScenario" ADD CONSTRAINT "PayoffScenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
