import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get("id");
  if (!linkId) return NextResponse.json({ gecerli: false });

  const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
  if (!link) return NextResponse.json({ gecerli: false, kullaniciId: null });

  return NextResponse.json({
    gecerli: true,
    kullaniciId: link.kullaniciId,
    evsahibiAdi: link.evsahibiAdi,
    sehir: link.sehir,
    kiraBaslangic: link.kiraBaslangic?.toISOString() ?? null,
    kiraBitis: link.kiraBitis?.toISOString() ?? null,
  });
}
