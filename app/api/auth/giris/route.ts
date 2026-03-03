import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { oturumOlustur } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { email, sifre } = await req.json();

    if (!email?.trim() || !sifre) {
      return NextResponse.json({ hata: "E-posta ve şifre zorunludur." }, { status: 400 });
    }

    const kullanici = await prisma.kullanici.findUnique({ where: { email } });
    if (!kullanici) {
      return NextResponse.json({ hata: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    const gecerli = await bcrypt.compare(sifre, kullanici.sifreHash);
    if (!gecerli) {
      return NextResponse.json({ hata: "E-posta veya şifre hatalı." }, { status: 401 });
    }

    await oturumOlustur({ id: kullanici.id, adSoyad: kullanici.adSoyad, email: kullanici.email, rol: kullanici.rol as "kiraci" | "evsahibi" });

    return NextResponse.json({
      id: kullanici.id,
      adSoyad: kullanici.adSoyad,
      email: kullanici.email,
      rol: kullanici.rol,
    });
  } catch {
    return NextResponse.json({ hata: "Giriş sırasında bir hata oluştu." }, { status: 500 });
  }
}
