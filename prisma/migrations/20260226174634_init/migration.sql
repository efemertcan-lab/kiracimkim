-- CreateTable
CREATE TABLE "kullanicilar" (
    "id" TEXT NOT NULL,
    "ad_soyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "sifre_hash" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kullanicilar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referans_linkleri" (
    "id" TEXT NOT NULL,
    "etiket" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "evsahibi_adi" TEXT,
    "sehir" TEXT,
    "olusturulma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referans_linkleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referans_formlari" (
    "id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "kira_odemesi" INTEGER NOT NULL,
    "ev_durumu" INTEGER NOT NULL,
    "iletisim" INTEGER NOT NULL,
    "tasinma" INTEGER NOT NULL,
    "gonderilen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referans_formlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ozet_tokenlar" (
    "token" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "olusturulma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ozet_tokenlar_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "rapor_tokenlar" (
    "token" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "olusturulma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rapor_tokenlar_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "evsahibi_kararlari" (
    "id" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "karar" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evsahibi_kararlari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goruntulenen_linkler" (
    "id" TEXT NOT NULL,
    "kullanici_id" TEXT NOT NULL,
    "link_id" TEXT NOT NULL,
    "goruntulme_tarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referans_gonderildi" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "goruntulenen_linkler_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kullanicilar_email_key" ON "kullanicilar"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ozet_tokenlar_kullanici_id_key" ON "ozet_tokenlar"("kullanici_id");

-- CreateIndex
CREATE UNIQUE INDEX "rapor_tokenlar_link_id_key" ON "rapor_tokenlar"("link_id");

-- CreateIndex
CREATE UNIQUE INDEX "evsahibi_kararlari_kullanici_id_link_id_key" ON "evsahibi_kararlari"("kullanici_id", "link_id");

-- CreateIndex
CREATE UNIQUE INDEX "goruntulenen_linkler_kullanici_id_link_id_key" ON "goruntulenen_linkler"("kullanici_id", "link_id");

-- AddForeignKey
ALTER TABLE "referans_linkleri" ADD CONSTRAINT "referans_linkleri_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referans_formlari" ADD CONSTRAINT "referans_formlari_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "referans_linkleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ozet_tokenlar" ADD CONSTRAINT "ozet_tokenlar_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rapor_tokenlar" ADD CONSTRAINT "rapor_tokenlar_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "referans_linkleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evsahibi_kararlari" ADD CONSTRAINT "evsahibi_kararlari_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evsahibi_kararlari" ADD CONSTRAINT "evsahibi_kararlari_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "referans_linkleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goruntulenen_linkler" ADD CONSTRAINT "goruntulenen_linkler_kullanici_id_fkey" FOREIGN KEY ("kullanici_id") REFERENCES "kullanicilar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goruntulenen_linkler" ADD CONSTRAINT "goruntulenen_linkler_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "referans_linkleri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
