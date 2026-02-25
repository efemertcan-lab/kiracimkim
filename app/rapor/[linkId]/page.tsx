"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ArrowLeft,
  Copy,
  Check,
  Users,
  Share2,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
} from "lucide-react";
import {
  linkReferanslari,
  riskHesapla,
  riskBilgisi,
  linkSahibiKim,
  oturumuGetir,
  raporTokenOlustur,
  type ReferansFormu,
  type RiskSeviyesi,
} from "@/lib/store";

function RiskIkonu({ seviye }: { seviye: RiskSeviyesi | null }) {
  if (seviye === "dusuk")  return <ShieldCheck className="w-8 h-8" />;
  if (seviye === "orta")   return <ShieldAlert className="w-8 h-8" />;
  if (seviye === "yuksek") return <ShieldX     className="w-8 h-8" />;
  return <Shield className="w-8 h-8" />;
}

export default function RaporSayfasi({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = use(params);
  const router = useRouter();

  const [refs, setRefs]             = useState<ReferansFormu[]>([]);
  const [risk, setRisk]             = useState<RiskSeviyesi | null>(null);
  const [paylasLink, setPaylasLink] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [yetkisiz, setYetkisiz]     = useState(false);

  useEffect(() => {
    const oturum = oturumuGetir();
    if (!oturum || oturum.rol !== "kiraci") {
      router.replace("/giris");
      return;
    }
    const sahip = linkSahibiKim(linkId);
    if (sahip && sahip !== oturum.kullaniciId) {
      setYetkisiz(true);
      setMounted(true);
      return;
    }
    const veriler = linkReferanslari(linkId);
    setRefs(veriler);
    setRisk(riskHesapla(veriler));
    setMounted(true);
  }, [linkId, router]);

  function paylasLinkOlustur() {
    const token = raporTokenOlustur(linkId);
    const url = `${window.location.origin}/rapor-paylas/${token}`;
    setPaylasLink(url);
    navigator.clipboard.writeText(url);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2500);
  }

  function kopyala() {
    if (!paylasLink) return;
    navigator.clipboard.writeText(paylasLink);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 2500);
  }

  if (!mounted) return null;

  const bilgi = riskBilgisi(risk);

  if (yetkisiz) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-sm shadow-2xl">
          <p className="text-gray-700 font-semibold">Bu rapora erişim yetkiniz yok.</p>
          <Link href="/dashboard" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
            Panele dön
          </Link>
        </div>
      </main>
    );
  }

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
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Panele Dön
          </Link>
        </header>

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

        {refs.length === 0 && (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center mb-6">
            <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <h3 className="text-white font-bold mb-1">Henüz referans gelmedi</h3>
            <p className="text-slate-400 text-sm">
              Referans linkinizi eski ev sahiplerinizle paylaşın.
            </p>
          </div>
        )}

        {/* Paylaşma Bölümü */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Share2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Yeni Ev Sahibiyle Paylaş</h2>
              <p className="text-xs text-gray-500">Raporu görebileceği özel bir link oluştur</p>
            </div>
          </div>

          {!paylasLink ? (
            <button
              onClick={paylasLinkOlustur}
              disabled={refs.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
            >
              <Share2 className="w-4 h-4" />
              {refs.length === 0 ? "Önce referans toplayın" : "Paylaşılabilir Link Oluştur"}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <span className="text-xs text-gray-600 font-mono flex-1 truncate">{paylasLink}</span>
                <button
                  onClick={kopyala}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all ${
                    kopyalandi
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  }`}
                >
                  {kopyalandi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {kopyalandi ? "Kopyalandı!" : "Kopyala"}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Bu link her zaman geçerlidir — referans geldikçe otomatik güncellenir.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
