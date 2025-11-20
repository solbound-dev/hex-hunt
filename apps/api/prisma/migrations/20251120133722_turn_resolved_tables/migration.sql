-- CreateTable
CREATE TABLE "public"."TurnResolved" (
    "id" SERIAL NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "cardPosQ" INTEGER NOT NULL,
    "cardPosR" INTEGER NOT NULL,
    "gameId" UUID NOT NULL,

    CONSTRAINT "TurnResolved_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GamePlayerTurnResolved" (
    "id" SERIAL NOT NULL,
    "posQ" INTEGER NOT NULL,
    "posR" INTEGER NOT NULL,
    "lastSeenPosQ" INTEGER NOT NULL,
    "lastSeenPosR" INTEGER NOT NULL,
    "previousPosQ" INTEGER,
    "previousPosR" INTEGER,
    "won" BOOLEAN NOT NULL DEFAULT false,
    "cards" INTEGER NOT NULL DEFAULT 0,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "isImmune" BOOLEAN NOT NULL DEFAULT false,
    "diedAtMove" INTEGER,
    "lastBulletQ" INTEGER,
    "lastBulletR" INTEGER,
    "gamePlayerId" INTEGER NOT NULL,
    "turnResolvedId" INTEGER NOT NULL,

    CONSTRAINT "GamePlayerTurnResolved_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."TurnResolved" ADD CONSTRAINT "TurnResolved_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTurnResolved" ADD CONSTRAINT "GamePlayerTurnResolved_gamePlayerId_fkey" FOREIGN KEY ("gamePlayerId") REFERENCES "public"."GamePlayer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GamePlayerTurnResolved" ADD CONSTRAINT "GamePlayerTurnResolved_turnResolvedId_fkey" FOREIGN KEY ("turnResolvedId") REFERENCES "public"."TurnResolved"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
