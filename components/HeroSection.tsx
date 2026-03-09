import Link from "next/link";
import { ArrowRight, Star, CheckCircle, ShieldCheck } from "lucide-react";

const mockKategoriler = [
  { emoji: "💰", baslik: "Kira Ödemesi", sayilar: [3, 1, 0] },
  { emoji: "🏠", baslik: "Ev Durumu",    sayilar: [4, 0, 0] },
  { emoji: "📞", baslik: "İletişim",     sayilar: [3, 1, 0] },
  { emoji: "📦", baslik: "Taşınma",      sayilar: [4, 0, 0] },
];
const barRenkler = ["bg-emerald-500", "bg-amber-400", "bg-red-500"];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 pt-32 pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-8">
          <Star className="w-3.5 h-3.5 text-indigo-400" fill="currentColor" />
          <span className="text-indigo-300 text-xs font-medium tracking-wide">
            Türkiye&apos;nin İlk Kiracı Referans Platformu
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Kiracı Geçmişinizi{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            Kolayca Paylaşın
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Eski ev sahiplerinizden referans toplayın, yeni ev sahiplerine
          <strong className="text-white"> tek bir linkle </strong>
          gönderin. Güvenilir olduğunuzu kanıtlayın, hayalinizdeki evi
          kolayca kiralayın.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link href="/kayit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5">
            Ücretsiz Kayıt Ol
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#nasil-calisir"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all"
          >
            Nasıl Çalışır?
          </a>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-slate-400 text-sm">
          {[
            "Kurulum gerektirmez",
            "Tamamen ücretsiz",
            "Güvenli ve şifreli",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Hero card mockup */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-left shadow-2xl">

            {/* Kiracı başlığı */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-500/30 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                AY
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold leading-tight">Ahmet Yılmaz</div>
                <div className="text-slate-400 text-xs truncate">kiracimkim.com/ahmet-y</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3 py-1 flex-shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold">Düşük Risk</span>
              </div>
            </div>

            {/* Risk özeti */}
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-emerald-300 text-sm font-semibold leading-tight">Düşük Risk · 4 Referans</div>
                <div className="text-emerald-400/70 text-xs mt-0.5">Ödemeleri zamanında yapmış, evi iyi durumda teslim etmiş.</div>
              </div>
            </div>

            {/* Kategori dağılımı */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wide">Kategori Dağılımı</div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                {mockKategoriler.map((kat) => {
                  const toplam = kat.sayilar.reduce((a, b) => a + b, 0);
                  return (
                    <div key={kat.baslik}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm leading-none">{kat.emoji}</span>
                        <span className="text-xs font-medium text-slate-300">{kat.baslik}</span>
                      </div>
                      <div className="space-y-1">
                        {kat.sayilar.map((sayi, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barRenkler[i]} rounded-full`}
                                style={{ width: toplam > 0 ? `${Math.round((sayi / toplam) * 100)}%` : "0%" }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 w-2.5 text-right">{sayi}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
