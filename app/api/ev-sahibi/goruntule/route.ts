import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const oturum = await oturumGetir();
    if (!oturum) return NextResponse.json({ ok: false }, { status: 401 });

    const { linkId } = await req.json();
    if (!linkId) return NextResponse.json({ ok: false }, { status: 400 });

    const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
    if (!link) return NextResponse.json({ ok: false }, { status: 404 });

    // upsert yerine findFirst + update/create kullan (compound key accessor sorununu önle)
    const mevcut = await prisma.goruntulenenLink.findFirst({
      where: { kullaniciId: oturum.id, linkId },
    });

    if (mevcut) {
      await prisma.goruntulenenLink.update({
        where: { id: mevcut.id },
        data: { goruntulenmeTarihi: new Date() },
      });
    } else {
      await prisma.goruntulenenLink.create({
        data: { kullaniciId: oturum.id, linkId },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[goruntule] DB hatası:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
