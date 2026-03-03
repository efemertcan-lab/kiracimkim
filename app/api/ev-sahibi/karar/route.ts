import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

export async function GET(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json([]);

  const kararlar = await prisma.evsahibiKarari.findMany({
    where: { kullaniciId: oturum.id },
  });

  return NextResponse.json(
    kararlar.map((k) => ({
      linkId: k.linkId,
      karar: k.karar,
      sebep: k.sebep ?? null,
      tarih: k.tarih.toISOString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  const { linkId, karar, sebep } = await req.json();
  if (!linkId || !karar) return NextResponse.json({ hata: "Eksik bilgi" }, { status: 400 });

  try {
    await prisma.evsahibiKarari.upsert({
      where: { kullaniciId_linkId: { kullaniciId: oturum.id, linkId } },
      update: { karar, sebep: sebep || null, tarih: new Date() },
      create: { kullaniciId: oturum.id, linkId, karar, sebep: sebep || null },
    });
  } catch {
    // linkId veritabanında yoksa (ör. özet linki) sessizce geç
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
