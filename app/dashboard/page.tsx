"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LogOut,
  Plus,
  Copy,
  Check,
  LinkIcon,
  Clock,
  BarChart2,
  X,
  MapPin,
  User,
  AlertTriangle,
  Share2,
} from "lucide-react";
import {
  linkleriGetir,
  linkEkle,
  linkReferanslari,
  oturumuGetir,
  oturumuSil,
  ozetTokenOlustur,
  type ReferansLinki,
  type Oturum,
} from "@/lib/store";

interface LinkSatiri {
  link: ReferansLinki;
  refSayisi: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [satirlar, setSatirlar] = useState<LinkSatiri[]>([]);
  const [kopyalandi, setKopyalandi] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [oturum, setOturum] = useState<Oturum | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [ozetKopyalandi, setOzetKopyalandi] = useState(false);

  const yenile = useCallback(() => {
    setSatirlar(
      linkleriGetir().map((link) => ({
        link,
        refSayisi: linkReferanslari(link.id).length,
      }))
    );
  }, []);

  useEffect(() => {
    const aktifOturum = oturumuGetir();
    if (!aktifOturum || aktifOturum.rol !== "kiraci") {
      router.replace("/giris");
      return;
    }
    setOturum(aktifOturum);
    setMounted(true);
    yenile();
  }, [yenile, router]);

  function cikisYap() {
    oturumuSil();
    router.push("/giris");
  }

  function ozetLinkKopyala() {
    if (!oturum) return;
    const token = ozetTokenOlustur(oturum.kullaniciId);
    const url = `${window.location.origin}/ozet/${token}`;
    navigator.clipboard.writeText(url);
    setOzetKopyalandi(true);
    setTimeout(() => setOzetKopyalandi(false), 2000);
  }

  function kopyala(linkId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/referans/${linkId}`);
    setKopyalandi(linkId);
    setTimeout(() => setKopyalandi(null), 2000);
  }

  if (!mounted) return null;

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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:bg-indigo-500 transition-colors">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">
              Kiracım<span className="text-indigo-400">kim</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <div className="w-6 h-6 bg-indigo-500/30 rounded-full flex items-center justify-center">
                <span className="text-xs text-indigo-300 font-bold">
                  {oturum?.adSoyad?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
              <span className="text-sm text-slate-300 font-medium">{oturum?.adSoyad ?? ""}</span>
            </div>
            <button
              onClick={cikisYap}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </header>

        {/* ── Hoş geldin ── */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Hoş geldin, {oturum?.adSoyad?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Referans linklerini oluştur ve eski ev sahiplerinle paylaş.
          </p>
        </div>

        {/* ── Uyarı banner ── */}
        {(() => {
          const toplamRef = satirlar.reduce((s, r) => s + r.refSayisi, 0);
          return toplamRef === 1 ? (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm">
                <span className="font-semibold">1 referansınız var</span> — 2 veya daha fazlası daha güvenilir görünür.
              </p>
            </div>
          ) : null;
        })()}

        {/* ── Linkler ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Referans Linklerim</h2>
            <div className="flex items-center gap-2">
              {satirlar.some((s) => s.refSayisi > 0) && (
                <button
                  onClick={ozetLinkKopyala}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all ${
                    ozetKopyalandi
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {ozetKopyalandi ? (
                    <><Check className="w-3.5 h-3.5" />Kopyalandı</>
                  ) : (
                    <><Share2 className="w-3.5 h-3.5" />Genel Özet Linkini Paylaş</>
                  )}
                </button>
              )}
            <button
              onClick={() => setFormAcik(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              Yeni Referans Linki Oluştur
            </button>
            </div>
          </div>

          {satirlar.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LinkIcon className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Henüz link oluşturmadınız</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                İlk referans linkinizi oluşturun ve eski ev sahiplerinizle paylaşın.
              </p>
              <button
                onClick={() => setFormAcik(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                İlk Linki Oluştur
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {satirlar.map(({ link, refSayisi }) => {
                const url = `${window.location.origin}/referans/${link.id}`;
                return (
                  <div
                    key={link.id}
                    className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-4 h-4 text-indigo-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-sm mb-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{link.evsahibiAdi ?? "İsimsiz Referans"}</span>
                          {link.sehir && (
                            <>
                              <span className="text-slate-500">·</span>
                              <span className="text-slate-300 font-normal">{link.sehir}</span>
                            </>
                          )}
                          <span className="text-slate-500">·</span>
                          <span className="text-slate-400 font-normal">{refSayisi} referans</span>
                        </div>
                        <div className="text-slate-500 text-xs font-mono truncate mb-1.5">
                          {url}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {new Date(link.olusturulma).toLocaleDateString("tr-TR")}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {refSayisi > 0 && (
                          <Link
                            href={`/rapor/${link.id}`}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-500/20 rounded-lg px-3 py-2 transition-all"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Raporu Görüntüle</span>
                          </Link>
                        )}
<button
                          onClick={() => kopyala(link.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 transition-all ${
                            kopyalandi === link.id
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/20"
                          }`}
                        >
                          {kopyalandi === link.id ? (
                            <><Check className="w-3.5 h-3.5" /><span className="hidden sm:inline">Kopyalandı</span></>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Kopyala</span></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {formAcik && (
        <LinkOlusturModal
          onKapat={() => setFormAcik(false)}
          onOlustur={(bilgi) => {
            linkEkle(bilgi);
            yenile();
            setFormAcik(false);
          }}
        />
      )}
    </main>
  );
}

// ── Link oluşturma formu ───────────────────────────────────────────────────────

function LinkOlusturModal({
  onKapat,
  onOlustur,
}: {
  onKapat: () => void;
  onOlustur: (bilgi: { evsahibiAdi: string; sehir?: string }) => void;
}) {
  const [evsahibiAdi, setEvsahibiAdi] = useState("");
  const [sehir, setSehir] = useState("");
  const [hata, setHata] = useState("");

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onKapat]);

  function gonder(e: React.FormEvent) {
    e.preventDefault();
    if (!evsahibiAdi.trim()) {
      setHata("Ev sahibinin adını girin.");
      return;
    }
    onOlustur({ evsahibiAdi: evsahibiAdi.trim(), sehir: sehir.trim() || undefined });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onKapat}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat */}
        <button
          type="button"
          onClick={onKapat}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Yeni Referans Linki</h2>
            <p className="text-xs text-gray-400">Bu linki kime göndereceksiniz?</p>
          </div>
        </div>

        <form onSubmit={gonder} noValidate className="space-y-4">
          {/* Ev sahibi adı */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Eski Ev Sahibinin Adı <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={evsahibiAdi}
                onChange={(e) => { setEvsahibiAdi(e.target.value); setHata(""); }}
                placeholder="Ahmet Bey"
                autoFocus
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  hata
                    ? "border-red-400 focus:ring-red-200 bg-red-50"
                    : "border-gray-200 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white"
                }`}
              />
            </div>
            {hata && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">{hata}</p>
            )}
          </div>

          {/* Şehir / İlçe */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Şehir / İlçe <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={sehir}
                onChange={(e) => setSehir(e.target.value)}
                placeholder="Kadıköy"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-gray-50 hover:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 mt-2"
          >
            <Plus className="w-4 h-4" />
            Linki Oluştur
          </button>
        </form>
      </div>
    </div>
  );
}
