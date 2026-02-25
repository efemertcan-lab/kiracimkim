import Link from "next/link";
import { Home, CheckCircle2, Heart } from "lucide-react";

export default function TesekkurlerPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Arka plan */}
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
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10 text-center">
        {/* İkon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="absolute -right-1 -top-1 w-6 h-6 bg-rose-400 rounded-full flex items-center justify-center">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">
          Teşekkürler! 🙏
        </h1>

        <p className="text-gray-500 leading-relaxed mb-6">
          Değerlendirmeniz başarıyla iletildi. Dürüst geri bildiriminiz, güvenilir bir kiracı ekosistemi oluşturmaya katkı sağlıyor.
        </p>

        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-indigo-800 mb-0.5">
                Değerlendirme kaydedildi
              </div>
              <div className="text-xs text-indigo-500 leading-relaxed">
                Cevaplarınız kiracının profil risk değerlendirmesine dahil edildi. Kiracı yalnızca genel risk seviyesini görebilir.
              </div>
            </div>
          </div>
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
        >
          Ana Sayfaya Dön
        </Link>

        <p className="text-xs text-gray-400 mt-5">
          Siz de kiracı referans profilinizi oluşturmak ister misiniz?{" "}
          <Link href="/kayit" className="text-indigo-500 hover:underline">
            Ücretsiz kaydolun
          </Link>
        </p>
      </div>
    </main>
  );
}
