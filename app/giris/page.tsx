"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, Eye, EyeOff, ArrowRight } from "lucide-react";
import { kullaniciGiris, oturumuKaydet } from "@/lib/store";

interface FormData {
  email: string;
  sifre: string;
}

interface FormErrors {
  email?: string;
  sifre?: string;
}

export default function GirisPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({ email: "", sifre: "" });
  const [errors, setErrors] = useState<FormErrors>({});
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

    if (!form.email.trim()) {
      yeniHatalar.email = "E-posta adresi zorunludur.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      yeniHatalar.email = "Geçerli bir e-posta adresi girin.";
    }

    if (!form.sifre) {
      yeniHatalar.sifre = "Şifre zorunludur.";
    } else if (form.sifre.length < 6) {
      yeniHatalar.sifre = "Şifre en az 6 karakter olmalıdır.";
    }

    setErrors(yeniHatalar);
    return Object.keys(yeniHatalar).length === 0;
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!dogrula()) return;
    setGenelHata(null);
    setYukleniyor(true);
    await new Promise((r) => setTimeout(r, 700));
    const kullanici = kullaniciGiris(form.email, form.sifre);
    if (!kullanici) {
      setGenelHata("E-posta veya şifre hatalı.");
      setYukleniyor(false);
      return;
    }
    oturumuKaydet(kullanici);
    if (kullanici.rol === "evsahibi") {
      router.push("/ev-sahibi-dashboard");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Arka plan süsü */}
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

      {/* Kart */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10">
        {/* Başlık */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Tekrar hoş geldiniz
          </h1>
          <p className="text-gray-500">
            Hesabınız yok mu?{" "}
            <Link
              href="/kayit"
              className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
            >
              Ücretsiz kayıt olun
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
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              E-posta Adresi
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                name="email"
                type="email"
                placeholder="ahmet@example.com"
                value={form.email}
                onChange={degistir}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email
                    ? "border-red-400 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white"
                }`}
              />
            </div>
            {errors.email && <HataMetni mesaj={errors.email} />}
          </div>

          {/* Şifre */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Şifre
              </label>
              <Link href="#" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors">
                Şifremi unuttum
              </Link>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                name="sifre"
                type={sifreGorunu ? "text" : "password"}
                placeholder="Şifrenizi girin"
                value={form.sifre}
                onChange={degistir}
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.sifre
                    ? "border-red-400 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setSifreGorunu((v) => !v)}
                tabIndex={-1}
                aria-label={sifreGorunu ? "Şifreyi gizle" : "Şifreyi göster"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors p-0.5"
              >
                {sifreGorunu ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.sifre && <HataMetni mesaj={errors.sifre} />}
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
                Giriş yapılıyor…
              </>
            ) : (
              <>
                Giriş Yap
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </main>
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
