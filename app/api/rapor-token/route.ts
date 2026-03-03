import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

// GET /api/rapor-token?linkId=xxx
export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get("linkId");
  if (!linkId) return NextResponse.json({ hata: "linkId gerekli" }, { status: 400 });

  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json({ hata: "Oturum gerekli" }, { status: 401 });

  const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
  if (!link || link.kullaniciId !== oturum.id) {
    return NextResponse.json({ hata: "Yetkisiz" }, { status: 403 });
  }

  let kayit = await prisma.raporToken.findUnique({ where: { linkId } });
  if (!kayit) {
    const token = randomBytes(20).toString("hex");
    kayit = await prisma.raporToken.create({ data: { token, linkId } });
  }

  return NextResponse.json({ token: kayit.token });
}
