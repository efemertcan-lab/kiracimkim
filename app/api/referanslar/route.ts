import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

// GET /api/referanslar?linkId=xxx
export async function GET(req: NextRequest) {
  const linkId = req.nextUrl.searchParams.get("linkId");
  if (!linkId) return NextResponse.json([]);

  // Kimlik doğrulama zorunlu
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json([], { status: 401 });

  // Kiracı yalnızca kendi linkine ait referansları görebilir
  if (oturum.rol === "kiraci") {
    const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
    if (!link || link.kullaniciId !== oturum.id) {
      return NextResponse.json([], { status: 403 });
    }
  }

  const referanslar = await prisma.referansFormu.findMany({
    where: { linkId },
    orderBy: { gonderilenAt: "desc" },
  });

  return NextResponse.json(
    referanslar.map((r) => ({
      linkId: r.linkId,
      kiraOdemesi: r.kiraOdemesi,
      evDurumu: r.evDurumu,
      iletisim: r.iletisim,
      tasinma: r.tasinma,
      dolduranAdi: r.dolduranAdi ?? null,
      yorum: r.yorum ?? null,
      gonderilenAt: r.gonderilenAt.toISOString(),
    }))
  );
}

// POST /api/referanslar
export async function POST(req: NextRequest) {
  const { linkId, kiraOdemesi, evDurumu, iletisim, tasinma, dolduranAdi, yorum } = await req.json();

  // Sayısal alanların geçerli değer aralığını kontrol et (0, 1 veya 2)
  const skorlar = [kiraOdemesi, evDurumu, iletisim, tasinma];
  if (skorlar.some((s) => ![0, 1, 2].includes(Number(s)))) {
    return NextResponse.json({ hata: "Geçersiz değerlendirme değeri" }, { status: 400 });
  }

  const link = await prisma.referansLinki.findUnique({ where: { id: linkId } });
  if (!link) return NextResponse.json({ hata: "Geçersiz link" }, { status: 404 });

  const ref = await prisma.referansFormu.create({
    data: {
      linkId,
      kiraOdemesi: Number(kiraOdemesi),
      evDurumu: Number(evDurumu),
      iletisim: Number(iletisim),
      tasinma: Number(tasinma),
      dolduranAdi: dolduranAdi || null,
      yorum: yorum || null,
    },
  });

  // Eğer kullanıcı giriş yapmışsa, görüntüleme kaydını güncelle
  const oturum = await oturumGetir();
  if (oturum) {
    await prisma.goruntulenenLink.upsert({
      where: { kullaniciId_linkId: { kullaniciId: oturum.id, linkId } },
      update: { referansGonderildi: true },
      create: { kullaniciId: oturum.id, linkId, referansGonderildi: true },
    });
  }

  return NextResponse.json({ ok: true, id: ref.id });
}
