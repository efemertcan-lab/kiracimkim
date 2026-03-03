import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

export async function DELETE(req: NextRequest) {
  try {
    const oturum = await oturumGetir();
    if (!oturum) return NextResponse.json({ ok: false }, { status: 401 });

    const linkId = req.nextUrl.searchParams.get("linkId");
    if (!linkId) return NextResponse.json({ ok: false }, { status: 400 });

    await prisma.goruntulenenLink.deleteMany({
      where: { kullaniciId: oturum.id, linkId },
    });

    await prisma.evsahibiKarari.deleteMany({
      where: { kullaniciId: oturum.id, linkId },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[goruntulenenler DELETE] DB hatası:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const oturum = await oturumGetir();
    if (!oturum) return NextResponse.json([]);

    const goruntulenenler = await prisma.goruntulenenLink.findMany({
      where: { kullaniciId: oturum.id },
      orderBy: { goruntulenmeTarihi: "desc" },
    });

    if (goruntulenenler.length === 0) return NextResponse.json([]);

    const linkIds = goruntulenenler.map((g) => g.linkId);

    const linkler = await prisma.referansLinki.findMany({
      where: { id: { in: linkIds } },
      include: {
        kullanici: { select: { id: true, adSoyad: true } },
        referanslar: true,
      },
    });

    const linkMap = new Map(linkler.map((l) => [l.id, l]));

    return NextResponse.json(
      goruntulenenler.map((g) => {
        const link = linkMap.get(g.linkId);
        return {
          linkId: g.linkId,
          goruntulenmeTarihi: g.goruntulenmeTarihi.toISOString(),
          kiraciId: link?.kullanici?.id ?? null,
          kiraciAdSoyad: link?.kullanici?.adSoyad ?? "Bilinmeyen Kiracı",
          evsahibiAdi: link?.evsahibiAdi ?? null,
          kiraBaslangic: link?.kiraBaslangic?.toISOString() ?? null,
          kiraBitis: link?.kiraBitis?.toISOString() ?? null,
          refs: link?.referanslar?.map((r) => ({
            linkId: r.linkId,
            kiraOdemesi: r.kiraOdemesi,
            evDurumu: r.evDurumu,
            iletisim: r.iletisim,
            tasinma: r.tasinma,
            dolduranAdi: r.dolduranAdi ?? null,
            yorum: r.yorum ?? null,
            gonderilenAt: r.gonderilenAt.toISOString(),
          })) ?? [],
        };
      })
    );
  } catch (e) {
    console.error("[goruntulenenler] DB hatası:", e);
    return NextResponse.json([]);
  }
}
