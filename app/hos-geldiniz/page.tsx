import Link from "next/link";
import { Home, CheckCircle2, ArrowRight, Star, Share2, UserPlus } from "lucide-react";

interface Props {
  searchParams: Promise<{ ad?: string; rol?: string }>;
}

export default async function HosGeldinizPage({ searchParams }: Props) {
  const params = await searchParams;
  const ad = params.ad ?? "Hoş geldiniz";
  const rolKiraci = params.rol === "kiraci";

  const adimlar = rolKiraci
    ? [
        { icon: UserPlus, baslik: "Profilinizi tamamlayın", aciklama: "Kısa bir biyografi ve tercihlerinizi ekleyin." },
        { icon: Star, baslik: "Referans isteyin", aciklama: "Eski ev sahiplerinize referans isteği gönderin." },
        { icon: Share2, baslik: "Linkinizi paylaşın", aciklama: "Benzersiz profilinizi yeni ev sahiplerinizle paylaşın." },
      ]
    : [
        { icon: Home, baslik: "İlanınızı oluşturun", aciklama: "Kiralık evinizi platforma ekleyin." },
        { icon: Star, baslik: "Kiracıları inceleyin", aciklama: "Referanslı kiracı profillerini görüntüleyin." },
        { icon: CheckCircle2, baslik: "Güvenle kiralayın", aciklama: "Doğrulanmış kiracılarla güvenli sözleşme yapın." },
      ];

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
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-black/30 p-8 sm:p-10 text-center">
        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <div className="absolute -right-1 -top-1 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-white" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
          Hoş geldiniz, {ad}! 🎉
        </h1>
        <p className="text-gray-500 mb-8">
          Hesabınız başarıyla oluşturuldu.{" "}
          {rolKiraci
            ? "Artık referans toplayabilir ve profilinizi paylaşabilirsiniz."
            : "Artık doğrulanmış kiracıları keşfedebilirsiniz."}
        </p>

        {/* Sonraki adımlar */}
        <div className="bg-gray-50 rounded-xl p-5 mb-7 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Sonraki Adımlar
          </p>
          <div className="space-y-4">
            {adimlar.map((adim, i) => {
              const Icon = adim.icon;
              return (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{adim.baslik}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{adim.aciklama}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
        >
          Panele Git
          <ArrowRight className="w-4 h-4" />
        </Link>

        <p className="text-xs text-gray-400 mt-4">
          Yardım için{" "}
          <Link href="#" className="text-indigo-500 hover:underline">
            destek ekibimizle
          </Link>{" "}
          iletişime geçebilirsiniz.
        </p>
      </div>
    </main>
  );
}
