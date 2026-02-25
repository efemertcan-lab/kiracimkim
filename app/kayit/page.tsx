"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { kullaniciKaydet } from "@/lib/store";
import {
  Home,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  UserRound,
} from "lucide-react";

type Role = "kiraci" | "evsahibi" | null;

interface FormData {
  adSoyad: string;
  email: string;
  sifre: string;
  telefon: string;
}

interface FormErrors {
  adSoyad?: string;
  email?: string;
  sifre?: string;
  telefon?: string;
  rol?: string;
}

export default function KayitPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    adSoyad: "",
    email: "",
    sifre: "",
    telefon: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rol, setRol] = useState<Role>(null);
  const [sifreGorunu, setSifreGorunu] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [genelHata, setGenelHata] = useState<string | null>(null);

  function degistir(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function dogrula(): boolean {
    const yeniHatalar: FormErrors = {};

    if (!form.adSoyad.trim()) {
      yeniHatalar.adSoyad = "Ad Soyad zorunludur.";
    } else if (form.adSoyad.trim().split(" ").length < 2) {
      yeniHatalar.adSoyad = "Lütfen hem adınızı hem soyadınızı girin.";
    }

    if (!form.email.trim()) {
      yeniHatalar.email = "E-posta adresi zorunludur.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      yeniHatalar.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!form.sifre) {
      yeniHatalar.sifre = "Şifre zorunludur.";
    } else if (form.sifre.length < 8) {
      yeniHatalar.sifre = "Şifre en az 8 karakter olmalıdır.";
    }

    if (!form.telefon.trim()) {
      yeniHatalar.telefon = "Telefon numarası zorunludur.";
    } else if (!/^[0-9\s\+\-\(\)]{10,15}$/.test(form.telefon.replace(/\s/g, ""))) {
      yeniHatalar.telefon = "Geçerli bir telefon numarası girin.";
    }

    if (!rol) {
      yeniHatalar.rol = "Lütfen rolünüzü seçin.";
    }

    setErrors(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!dogrula()) return;
    setGenelHata(null);
    setYukleniyor(true);
    await new Promise((r) => setTimeout(r, 800));
    const sonuc = kullaniciKaydet({
      adSoyad: form.adSoyad,
      email: form.email,
      sifre: form.sifre,
      telefon: form.telefon,
      rol: rol!,
    });
    if (!sonuc.basarili) {
      setGenelHata(sonuc.hata ?? "Kayıt sırasında bir hata oluştu.");
      setYukleniyor(false);
      return;
    }
    router.push("/giris");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 group">
        <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
          <Home className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">
          Kiracım<span className="text-indigo-400">kim</span>
        </span>
      </Link>

      {/* Card */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Hesap Oluşturun
          </h1>
          <p className="text-gray-500">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
              Giriş yapın
            </Link>
          </p>
        </div>

        <form onSubmit={gonder} noValidate className="space-y-5">
          {genelHata && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {genelHata}
            </div>
          )}
          {/* Ben kimim? */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Ben kimim?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <RolKarti
                aktif={rol === "kiraci"}
                onClick={() => {
                  setRol("kiraci");
                  setErrors((p) => ({ ...p, rol: undefined }));
                }}
                icon={<UserRound className="w-6 h-6" />}
                baslik="Kiracı"
                aciklama="Referans topluyorum"
              />
              <RolKarti
                aktif={rol === "evsahibi"}
                onClick={() => {
                  setRol("evsahibi");
                  setErrors((p) => ({ ...p, rol: undefined }));
                }}
                icon={<Building2 className="w-6 h-6" />}
                baslik="Ev Sahibi"
                aciklama="Kiracı arıyorum"
              />
            </div>
            {errors.rol && <HataMetni mesaj={errors.rol} />}
          </div>

          {/* Ad Soyad */}
          <Alan
            etiket="Ad Soyad"
            name="adSoyad"
            type="text"
            placeholder="Ahmet Yılmaz"
            deger={form.adSoyad}
            onChange={degistir}
            hata={errors.adSoyad}
            icon={<User className="w-4 h-4 text-gray-400" />}
          />

          {/* Email */}
          <Alan
            etiket="E-posta Adresi"
            name="email"
            type="email"
            placeholder="ahmet@example.com"
            deger={form.email}
            onChange={degistir}
            hata={errors.email}
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />

          {/* Telefon */}
          <Alan
            etiket="Telefon Numarası"
            name="telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            deger={form.telefon}
            onChange={degistir}
            hata={errors.telefon}
            icon={
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          {/* Şifre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                name="sifre"
                type={sifreGorunu ? "text" : "password"}
                placeholder="En az 8 karakter"
                value={form.sifre}
                onChange={degistir}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.sifre
                    ? "border-red-400 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setSifreGorunu((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-0.5"
                tabIndex={-1}
                aria-label={sifreGorunu ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {sifreGorunu ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.sifre && <HataMetni mesaj={errors.sifre} />}
            {form.sifre && !errors.sifre && (
              <SifreGucGostergesi sifre={form.sifre} />
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-not-allowed mt-2"
          >
            {yukleniyor ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Hesap oluşturuluyor...
              </>
            ) : (
              <>
                Kayıt Ol
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pt-1">
            Kayıt olarak{" "}
            <Link href="#" className="text-indigo-500 hover:underline">Kullanım Koşulları</Link>
            {" "}ve{" "}
            <Link href="#" className="text-indigo-500 hover:underline">Gizlilik Politikası</Link>
            &apos;nı kabul etmiş olursunuz.
          </p>
        </form>
      </div>
    </main>
  );
}

/* ── Alt bileşenler ── */

function RolKarti({
  aktif,
  onClick,
  icon,
  baslik,
  aciklama,
}: {
  aktif: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  baslik: string;
  aciklama: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${
        aktif
          ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100"
          : "border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
          aktif ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <div className={`font-bold text-sm ${aktif ? "text-indigo-700" : "text-gray-700"}`}>
          {baslik}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{aciklama}</div>
      </div>
      {aktif && (
        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
      )}
    </button>
  );
}

function Alan({
  etiket,
  name,
  type,
  placeholder,
  deger,
  onChange,
  hata,
  icon,
}: {
  etiket: string;
  name: string;
  type: string;
  placeholder: string;
  deger: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hata?: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {etiket}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          {icon}
        </div>
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={deger}
          onChange={onChange}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
            hata
              ? "border-red-400 focus:ring-red-200 bg-red-50"
              : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white"
          }`}
        />
      </div>
      {hata && <HataMetni mesaj={hata} />}
    </div>
  );
}

function HataMetni({ mesaj }: { mesaj: string }) {
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 font-medium">
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {mesaj}
    </p>
  );
}

function SifreGucGostergesi({ sifre }: { sifre: string }) {
  const guc = hesaplaGuc(sifre);
  const renkler = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const etiketler = ["Çok zayıf", "Zayıf", "Orta", "Güçlü"];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < guc ? renkler[guc - 1] : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${["text-red-400", "text-orange-400", "text-yellow-500", "text-emerald-600"][guc - 1]}`}>
        {etiketler[guc - 1]}
      </p>
    </div>
  );
}

function hesaplaGuc(sifre: string): number {
  let puan = 0;
  if (sifre.length >= 8) puan++;
  if (/[A-Z]/.test(sifre)) puan++;
  if (/[0-9]/.test(sifre)) puan++;
  if (/[^A-Za-z0-9]/.test(sifre)) puan++;
  return Math.max(1, puan);
}
