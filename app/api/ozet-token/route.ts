import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

export async function GET() {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  let kayit = await prisma.ozetToken.findUnique({ where: { kullaniciId: oturum.id } });
  if (!kayit) {
    const token = randomBytes(20).toString("hex");
    kayit = await prisma.ozetToken.create({ data: { token, kullaniciId: oturum.id } });
  }

  return NextResponse.json({ token: kayit.token });
}

// POST /api/ozet-token — seçili link ID'leriyle token oluştur / güncelle
export async function POST(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  const { linkIdleri } = await req.json();
  const linkIdleriStr = Array.isArray(linkIdleri) && linkIdleri.length > 0
    ? JSON.stringify(linkIdleri)
    : null;

  const mevcut = await prisma.ozetToken.findUnique({ where: { kullaniciId: oturum.id } });

  let token: string;
  if (mevcut) {
    await prisma.ozetToken.update({
      where: { kullaniciId: oturum.id },
      data: { linkIdleri: linkIdleriStr },
    });
    token = mevcut.token;
  } else {
    token = randomBytes(20).toString("hex");
    await prisma.ozetToken.create({
      data: { token, kullaniciId: oturum.id, linkIdleri: linkIdleriStr },
    });
  }

  return NextResponse.json({ token });
}
