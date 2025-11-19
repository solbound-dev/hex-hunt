/*
  Warnings:

  - A unique constraint covering the columns `[gamePlayerId,turnId]` on the table `GamePlayerTurn` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."GamePlayerTurn" ALTER COLUMN "pendingQ" DROP NOT NULL,
ALTER COLUMN "pendingR" DROP NOT NULL,
ALTER COLUMN "isShooting" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayerTurn_gamePlayerId_turnId_key" ON "public"."GamePlayerTurn"("gamePlayerId", "turnId");
