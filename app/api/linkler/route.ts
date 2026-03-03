import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

export async function DELETE(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  const linkId = req.nextUrl.searchParams.get("id");
  if (!linkId) return NextResponse.json({ hata: "ID gerekli" }, { status: 400 });

  const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
  if (!link || link.kullaniciId !== oturum.id)
    return NextResponse.json({ hata: "Yetki yok" }, { status: 403 });

  await prisma.referansFormu.deleteMany({ where: { linkId } });
  await prisma.goruntulenenLink.deleteMany({ where: { linkId } });
  await prisma.evsahibiKarari.deleteMany({ where: { linkId } });
  await prisma.raporToken.deleteMany({ where: { linkId } });
  await prisma.referansLinki.delete({ where: { id: linkId } });

  return NextResponse.json({ basarili: true });
}

function parseAyYil(str: string | null | undefined): Date | null {
  if (!str) return null;
  const [yil, ay] = str.split("-").map(Number);
  if (!yil || !ay) return null;
  return new Date(Date.UTC(yil, ay - 1, 1));
}

export async function GET() {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json([], { status: 401 });

  const linkler = await prisma.referansLinki.findMany({
    where: { kullaniciId: oturum.id },
    orderBy: { olusturulma: "desc" },
    include: { _count: { select: { referanslar: true } } },
  });

  return NextResponse.json(
    linkler.map((l) => ({
      id: l.id,
      etiket: l.etiket,
      olusturulma: l.olusturulma.toISOString(),
      kullaniciId: l.kullaniciId,
      evsahibiAdi: l.evsahibiAdi,
      sehir: l.sehir,
      kiraBaslangic: l.kiraBaslangic?.toISOString() ?? null,
      kiraBitis: l.kiraBitis?.toISOString() ?? null,
      refSayisi: l._count.referanslar,
    }))
  );
}

export async function POST(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  const { evsahibiAdi, sehir, kiraBaslangic, kiraBitis } = await req.json();

  const sayac = await prisma.referansLinki.count({ where: { kullaniciId: oturum.id } });
  const etiket = `Link ${sayac + 1}`;

  const link = await prisma.referansLinki.create({
    data: {
      etiket,
      kullaniciId: oturum.id,
      evsahibiAdi: evsahibiAdi || null,
      sehir: sehir || null,
      kiraBaslangic: parseAyYil(kiraBaslangic),
      kiraBitis: parseAyYil(kiraBitis),
    },
  });

  return NextResponse.json({
    id: link.id,
    etiket: link.etiket,
    olusturulma: link.olusturulma.toISOString(),
    kullaniciId: link.kullaniciId,
    evsahibiAdi: link.evsahibiAdi,
    sehir: link.sehir,
    kiraBaslangic: link.kiraBaslangic?.toISOString() ?? null,
    kiraBitis: link.kiraBitis?.toISOString() ?? null,
  });
}
