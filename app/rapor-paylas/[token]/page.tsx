"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  Users,
} from "lucide-react";
import {
  tokendenLinkId,
  linkReferanslari,
  riskHesapla,
  riskBilgisi,
  type ReferansFormu,
  type RiskSeviyesi,
} from "@/lib/store";

const KATEGORILER = [
  { alan: "kiraOdemesi" as const, emoji: "💰", baslik: "Kira Ödemesi", etiketler: ["Zamanında", "Arada Geç", "Sık Sık Geç"] },
  { alan: "evDurumu"    as const, emoji: "🏠", baslik: "Ev Durumu",    etiketler: ["Hasarsız Teslim", "Küçük Sorunlar", "Hasarlı Teslim"] },
  { alan: "iletisim"   as const, emoji: "📞", baslik: "İletişim",     etiketler: ["Kolay Ulaşılır", "Karışık", "Ulaşmak Zor"] },
  { alan: "tasinma"    as const, emoji: "📦", baslik: "Taşınma",      etiketler: ["Sorunsuz", "Ortalama", "Sorunlu"] },
] as const;

function RiskIkonu({ seviye }: { seviye: RiskSeviyesi | null }) {
  if (seviye === "dusuk")  return <ShieldCheck className="w-8 h-8" />;
  if (seviye === "orta")   return <ShieldAlert className="w-8 h-8" />;
  if (seviye === "yuksek") return <ShieldX     className="w-8 h-8" />;
  return <Shield className="w-8 h-8" />;
}

function KategoriBar({ refs, alan, etiketler }: {
  refs: ReferansFormu[];
  alan: keyof ReferansFormu;
  etiketler: readonly string[];
}) {
  const toplam = refs.length;
  if (toplam === 0) return null;

  const sayilar = [0, 1, 2].map((v) => refs.filter((r) => r[alan] === v).length);
  const ort = refs.reduce((s, r) => s + (r[alan] as number), 0) / toplam;

  const renkler = [
    { bar: "bg-emerald-500" },
    { bar: "bg-amber-400" },
    { bar: "bg-red-500" },
  ];

  return (
    <div className="space-y-1.5">
      {sayilar.map((sayi, i) => {
        const yuzde = Math.round((sayi / toplam) * 100);
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{etiketler[i]}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${renkler[i].bar} rounded-full transition-all duration-700`}
                style={{ width: `${yuzde}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-6 text-right">{sayi}</span>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 pt-0.5">
        Ortalama: <span className="font-semibold text-gray-600">{ort.toFixed(1)}</span>/2.0
      </p>
    </div>
  );
}

export default function RaporPaylasPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [refs, setRefs]     = useState<ReferansFormu[]>([]);
  const [risk, setRisk]     = useState<RiskSeviyesi | null>(null);
  const [gecersiz, setGecersiz] = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    const linkId = tokendenLinkId(token);
    if (!linkId) {
      setGecersiz(true);
      setMounted(true);
      return;
    }
    const veriler = linkReferanslari(linkId);
    setRefs(veriler);
    setRisk(riskHesapla(veriler));
    setMounted(true);
  }, [token]);

  if (!mounted) return null;

  const bilgi = riskBilgisi(risk);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-indigo-500 transition-colors">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Kiracım<span className="text-indigo-400">kim</span>
            </span>
          </Link>
          <div className="text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
            Kiracı Referans Raporu
          </div>
        </header>

        {gecersiz ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-2xl shadow-black/20">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Geçersiz Rapor Linki</h2>
            <p className="text-gray-500 text-sm">Bu rapor linki bulunamadı veya geçerliliğini yitirdi.</p>
          </div>
        ) : (
          <>
            {/* Başlık */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-white mb-1">Kiracı Referans Raporu</h1>
              <p className="text-slate-400 text-sm">
                {refs.length} eski ev sahibinin değerlendirmesine göre hazırlanmıştır.
              </p>
            </div>

            {/* Risk Kartı */}
            <div className={`rounded-2xl border p-6 mb-6 ${bilgi.bg} ${bilgi.border}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bilgi.badge}`}>
                  <RiskIkonu seviye={risk} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl font-extrabold text-gray-900">{bilgi.etiket}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bilgi.badge}`}>
                      {refs.length} referans
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{bilgi.aciklama}</p>
                </div>
              </div>
            </div>

            {refs.length === 0 ? (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center">
                <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Henüz referans bulunmuyor</h3>
                <p className="text-slate-400 text-sm">Bu kiracı henüz referans toplamamış.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl shadow-black/20 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-5">Kategori Dağılımı</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {KATEGORILER.map((kat) => (
                    <div key={kat.alan}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{kat.emoji}</span>
                        <span className="text-sm font-semibold text-gray-800">{kat.baslik}</span>
                      </div>
                      <KategoriBar refs={refs} alan={kat.alan} etiketler={kat.etiketler} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer notu */}
            <p className="text-center text-xs text-slate-500 mt-6">
              Bu rapor Kiracımkim platformu üzerinden paylaşılmıştır.{" "}
              <Link href="/kayit" className="text-indigo-400 hover:underline">
                Siz de hesap oluşturun.
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
