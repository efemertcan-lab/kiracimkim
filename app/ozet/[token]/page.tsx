"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import {
  ozetTokendenKullaniciId,
  kullaniciGetir,
  kullanicininTumLinkleri,
  linkReferanslari,
  riskHesapla,
  riskBilgisi,
  type ReferansLinki,
  type ReferansFormu,
  type RiskSeviyesi,
} from "@/lib/store";

const KATEGORILER = [
  { alan: "kiraOdemesi" as const, emoji: "💰", baslik: "Kira Ödemesi", etiketler: ["Zamanında", "Arada Geç", "Sık Sık Geç"] },
  { alan: "evDurumu"    as const, emoji: "🏠", baslik: "Ev Durumu",    etiketler: ["Hasarsız Teslim", "Küçük Sorunlar", "Hasarlı Teslim"] },
  { alan: "iletisim"   as const, emoji: "📞", baslik: "İletişim",     etiketler: ["Kolay Ulaşılır", "Karışık", "Ulaşmak Zor"] },
  { alan: "tasinma"    as const, emoji: "📦", baslik: "Taşınma",      etiketler: ["Sorunsuz", "Ortalama", "Sorunlu"] },
] as const;

type SoruAlani = "kiraOdemesi" | "evDurumu" | "iletisim" | "tasinma";

interface LinkVeri {
  link: ReferansLinki;
  refs: ReferansFormu[];
  risk: RiskSeviyesi | null;
}

function RiskIkonu({ seviye, cls }: { seviye: RiskSeviyesi | null; cls: string }) {
  if (seviye === "dusuk")  return <ShieldCheck className={cls} />;
  if (seviye === "orta")   return <ShieldAlert className={cls} />;
  if (seviye === "yuksek") return <ShieldX     className={cls} />;
  return <Shield className={cls} />;
}

function KategoriBarlar({ refs, alan, etiketler }: {
  refs: ReferansFormu[];
  alan: SoruAlani;
  etiketler: readonly string[];
}) {
  const toplam = refs.length;
  if (toplam === 0) return null;
  const sayilar = [0, 1, 2].map((v) => refs.filter((r) => r[alan] === v).length);
  const renkler = ["bg-emerald-500", "bg-amber-400", "bg-red-500"];
  return (
    <div className="space-y-1.5">
      {sayilar.map((sayi, i) => {
        const yuzde = Math.round((sayi / toplam) * 100);
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-28 flex-shrink-0 truncate">{etiketler[i]}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${renkler[i]} rounded-full transition-all duration-700`} style={{ width: `${yuzde}%` }} />
            </div>
            <span className="text-xs text-gray-400 w-4 text-right">{sayi}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function OzetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [linkler, setLinkler]       = useState<LinkVeri[]>([]);
  const [kiraciAdi, setKiraciAdi]   = useState("");
  const [genelRisk, setGenelRisk]   = useState<RiskSeviyesi | null>(null);
  const [toplamRef, setToplamRef]   = useState(0);
  const [acikId, setAcikId]         = useState<string | null>(null);
  const [gecersiz, setGecersiz]     = useState(false);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    const kullaniciId = ozetTokendenKullaniciId(token);
    if (!kullaniciId) {
      setGecersiz(true);
      setMounted(true);
      return;
    }
    const kullanici = kullaniciGetir(kullaniciId);
    setKiraciAdi(kullanici?.adSoyad ?? "Kiracı");

    const veri: LinkVeri[] = kullanicininTumLinkleri(kullaniciId)
      .map((link) => {
        const refs = linkReferanslari(link.id);
        return { link, refs, risk: riskHesapla(refs) };
      })
      .filter((v) => v.refs.length > 0);

    setLinkler(veri);
    const hepsi = veri.flatMap((v) => v.refs);
    setToplamRef(hepsi.length);
    setGenelRisk(riskHesapla(hepsi));
    setMounted(true);
  }, [token]);

  if (!mounted) return null;

  const bilgi = riskBilgisi(genelRisk);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
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
            Genel Referans Özeti
          </div>
        </header>

        {gecersiz ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-2xl shadow-black/20">
            <Shield className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Geçersiz Özet Linki</h2>
            <p className="text-gray-500 text-sm">Bu özet linki bulunamadı veya geçerliliğini yitirdi.</p>
          </div>
        ) : (
          <>
            {/* Başlık */}
            <div className="mb-6">
              <h1 className="text-2xl font-extrabold text-white mb-1">
                {kiraciAdi}&apos;nın Referans Özeti
              </h1>
              <p className="text-slate-400 text-sm">
                {toplamRef} değerlendirme · {linkler.length} referans linki
              </p>
            </div>

            {/* Genel risk kartı */}
            <div className={`rounded-2xl border p-6 mb-6 ${bilgi.bg} ${bilgi.border}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${bilgi.badge}`}>
                  <RiskIkonu seviye={genelRisk} cls="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xl font-extrabold text-gray-900">{bilgi.etiket}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bilgi.badge}`}>
                      {toplamRef} referans
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{bilgi.aciklama}</p>
                </div>
              </div>
            </div>

            {/* Referans linkleri */}
            {linkler.length === 0 ? (
              <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center">
                <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-1">Henüz referans bulunmuyor</h3>
                <p className="text-slate-400 text-sm">Bu kiracı henüz referans toplamamış.</p>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Referans Linkleri
                </h2>
                <div className="space-y-3">
                  {linkler.map(({ link, refs, risk: linkRisk }) => {
                    const lBilgi = riskBilgisi(linkRisk);
                    const acik = acikId === link.id;
                    return (
                      <div key={link.id} className="bg-white rounded-2xl shadow-lg shadow-black/10 overflow-hidden">
                        <button
                          onClick={() => setAcikId(acik ? null : link.id)}
                          className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${lBilgi.badge}`}>
                            <RiskIkonu seviye={linkRisk} cls="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-gray-900 text-sm">
                                {link.evsahibiAdi ?? "İsimsiz Referans"}
                              </span>
                              {link.sehir && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-500 text-sm">{link.sehir}</span>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {refs.length} referans
                              <span className="mx-1">·</span>
                              <span className={`font-semibold`} style={{ color: linkRisk === "dusuk" ? "#10b981" : linkRisk === "orta" ? "#f59e0b" : linkRisk === "yuksek" ? "#ef4444" : "#9ca3af" }}>
                                {lBilgi.etiket}
                              </span>
                            </div>
                          </div>
                          {acik
                            ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          }
                        </button>

                        {acik && (
                          <div className="px-5 pb-5 border-t border-gray-100">
                            <div className="grid sm:grid-cols-2 gap-5 pt-4">
                              {KATEGORILER.map((kat) => (
                                <div key={kat.alan}>
                                  <div className="flex items-center gap-1.5 mb-2.5">
                                    <span className="text-base">{kat.emoji}</span>
                                    <span className="text-sm font-semibold text-gray-800">{kat.baslik}</span>
                                  </div>
                                  <KategoriBarlar refs={refs} alan={kat.alan} etiketler={kat.etiketler} />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <p className="text-center text-xs text-slate-500 mt-8">
              Bu özet Kiracımkim platformu üzerinden paylaşılmıştır.{" "}
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
