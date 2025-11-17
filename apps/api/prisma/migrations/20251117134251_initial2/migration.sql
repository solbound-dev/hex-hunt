-- CreateEnum
CREATE TYPE "public"."PlayerType" AS ENUM ('Astronaut', 'Alien', 'Robot', 'Wizard');

-- CreateTable
CREATE TABLE "public"."Wallet" (
    "id" TEXT NOT NULL,
    "loginNonce" TEXT,
    "gameId" UUID,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Game" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GamePlayer" (
    "id" SERIAL NOT NULL,
    "playerType" "public"."PlayerType" NOT NULL,
    "initialQ" INTEGER NOT NULL,
    "initialR" INTEGER NOT NULL,
    "playerId" TEXT NOT NULL,
    "gameId" UUID NOT NULL,

    CONSTRAINT "GamePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Turn" (
    "id" SERIAL NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "cardPosQ" INTEGER NOT NULL,
    "cardPosR" INTEGER NOT NULL,
    "gameId" UUID NOT NULL,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GamePlayerTurn" (
    "id" SERIAL NOT NULL,
    "pendingQ" INTEGER NOT NULL,
    "pendingR" INTEGER NOT NULL,
    "isShooting" BOOLEAN NOT NULL DEFAULT false,
    "gamePlayerId" INTEGER NOT NULL,
    "turnId" INTEGER NOT NULL,

    CONSTRAINT "GamePlayerTurn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GamePlayer_gameId_playerId_key" ON "public"."GamePlayer"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "public"."Wallet" ADD CONSTRAINT "Wallet_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayer" ADD CONSTRAINT "GamePlayer_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayer" ADD CONSTRAINT "GamePlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Turn" ADD CONSTRAINT "Turn_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTurn" ADD CONSTRAINT "GamePlayerTurn_gamePlayerId_fkey" FOREIGN KEY ("gamePlayerId") REFERENCES "public"."GamePlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTurn" ADD CONSTRAINT "GamePlayerTurn_turnId_fkey" FOREIGN KEY ("turnId") REFERENCES "public"."Turn"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
