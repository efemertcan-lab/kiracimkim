import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

// GET /api/ozet?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ gecerli: false });

  const kayit = await prisma.ozetToken.findUnique({
    where: { token },
    include: {
      kullanici: {
        include: {
          linkler: {
            include: { referanslar: true },
            orderBy: { olusturulma: "desc" },
          },
        },
      },
    },
  });

  if (!kayit) return NextResponse.json({ gecerli: false });

  const linkIdFiltre: string[] | null = kayit.linkIdleri
    ? (JSON.parse(kayit.linkIdleri) as string[])
    : null;

  const oturum = await oturumGetir();
  if (oturum) {
    await prisma.goruntulenenLink.upsert({
      where: { kullaniciId_linkId: { kullaniciId: oturum.id, linkId: kayit.kullaniciId } },
      update: {},
      create: { kullaniciId: oturum.id, linkId: kayit.kullaniciId, goruntulenmeTarihi: new Date() },
    }).catch(() => {}); // linkId kullaniciId olmayabilir, hata yok sayılır
  }

  return NextResponse.json({
    gecerli: true,
    kullaniciId: kayit.kullaniciId,
    adSoyad: kayit.kullanici.adSoyad,
    linkler: kayit.kullanici.linkler
      .filter((l) => !linkIdFiltre || linkIdFiltre.includes(l.id))
      .map((l) => ({
      id: l.id,
      etiket: l.etiket,
      olusturulma: l.olusturulma.toISOString(),
      evsahibiAdi: l.evsahibiAdi,
      sehir: l.sehir,
      kiraBaslangic: l.kiraBaslangic?.toISOString() ?? null,
      kiraBitis: l.kiraBitis?.toISOString() ?? null,
      referanslar: l.referanslar.map((r) => ({
        linkId: r.linkId,
        kiraOdemesi: r.kiraOdemesi,
        evDurumu: r.evDurumu,
        iletisim: r.iletisim,
        tasinma: r.tasinma,
        gonderilenAt: r.gonderilenAt.toISOString(),
      })),
    })),
  });
}
