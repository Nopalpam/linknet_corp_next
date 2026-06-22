-- CreateTable: cookie_consents
-- Cookie consent tracking for privacy compliance

CREATE TABLE IF NOT EXISTS "cookie_consents" (
    "id" TEXT NOT NULL,
    "ip_address" TEXT NOT NULL,
    "os" TEXT,
    "browser" TEXT,
    "device" TEXT,
    "user_agent" TEXT,
    "fingerprint" TEXT,
    "consented_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cookie_consents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cookie_consents_ip_address_idx" ON "cookie_consents"("ip_address");
CREATE INDEX "cookie_consents_consented_at_idx" ON "cookie_consents"("consented_at");
