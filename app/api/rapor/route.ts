import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/rapor?token=xxx
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ gecerli: false });

  const kayit = await prisma.raporToken.findUnique({
    where: { token },
    include: {
      link: {
        include: { referanslar: true },
      },
    },
  });

  if (!kayit) return NextResponse.json({ gecerli: false });

  return NextResponse.json({
    gecerli: true,
    linkId: kayit.linkId,
    linkMeta: {
      evsahibiAdi: kayit.link.evsahibiAdi,
      sehir: kayit.link.sehir,
      kiraBaslangic: kayit.link.kiraBaslangic?.toISOString() ?? null,
      kiraBitis: kayit.link.kiraBitis?.toISOString() ?? null,
    },
    referanslar: kayit.link.referanslar.map((r) => ({
      linkId: r.linkId,
      kiraOdemesi: r.kiraOdemesi,
      evDurumu: r.evDurumu,
      iletisim: r.iletisim,
      tasinma: r.tasinma,
      gonderilenAt: r.gonderilenAt.toISOString(),
    })),
  });
}
