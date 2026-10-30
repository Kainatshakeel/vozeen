-- Homepage photos chosen from the admin panel (one row per slot).
-- CreateTable
CREATE TABLE "SiteImage" (
    "slot" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("slot")
);
