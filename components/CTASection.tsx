import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTASection() {
  return (
    <section id="kayit" className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-8">
          <ShieldCheck className="w-4 h-4 text-indigo-200" />
          <span className="text-indigo-100 text-sm font-medium">
            Güvenli ve Ücretsiz
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
          Güvenilir Bir Kiracı Olduğunuzu{" "}
          <span className="text-indigo-200">Kanıtlayın</span>
        </h2>

        <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
          Bugün kayıt olun, referanslarınızı toplayın. Yeni ev arayışınızda bir adım önde olun.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/kayit" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-10 py-4 rounded-xl text-base transition-all shadow-xl hover:-translate-y-0.5">
            Hemen Başla — Ücretsiz
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-indigo-300 text-sm mt-6">
          Kredi kartı gerekmez · Kurulum yok · 2 dakikada hazır
        </p>
      </div>
    </section>
  );
}
