import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { oturumOlustur } from "@/lib/session";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const { adSoyad, email, sifre, telefon, rol } = await req.json();

    // Sunucu taraflı giriş doğrulama
    if (!adSoyad?.trim() || !email?.trim() || !sifre || !telefon?.trim()) {
      return NextResponse.json({ basarili: false, hata: "Tüm alanlar zorunludur." }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ basarili: false, hata: "Geçersiz e-posta adresi." }, { status: 400 });
    }
    if (sifre.length < 6) {
      return NextResponse.json({ basarili: false, hata: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
    }
    if (!["kiraci", "evsahibi"].includes(rol)) {
      return NextResponse.json({ basarili: false, hata: "Geçersiz kullanıcı rolü." }, { status: 400 });
    }

    const mevcut = await prisma.kullanici.findUnique({ where: { email } });
    if (mevcut) {
      return NextResponse.json(
        { basarili: false, hata: "Bu e-posta adresiyle zaten bir hesap var." },
        { status: 400 }
      );
    }

    const sifreHash = await bcrypt.hash(sifre, 10);
    const kullanici = await prisma.kullanici.create({
      data: { adSoyad, email, sifreHash, telefon, rol },
    });

    await oturumOlustur({ id: kullanici.id, adSoyad: kullanici.adSoyad, email: kullanici.email, rol: kullanici.rol as "kiraci" | "evsahibi" });

    return NextResponse.json({ basarili: true });
  } catch (err) {
    console.error("[kayit] hata:", err);
    return NextResponse.json({ basarili: false, hata: "Kayıt sırasında bir hata oluştu." }, { status: 500 });
  }
}
