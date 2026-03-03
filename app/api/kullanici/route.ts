import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { oturumGetir } from "@/lib/session";

// GET /api/kullanici?id=xxx
export async function GET(req: NextRequest) {
  const oturum = await oturumGetir();
  if (!oturum) return NextResponse.json(null, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json(null);

  const kullanici = await prisma.kullanici.findUnique({
    where: { id },
    select: { id: true, adSoyad: true, email: true, telefon: true, rol: true },
  });

  return NextResponse.json(kullanici);
}
