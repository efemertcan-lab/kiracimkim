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
  X,
  MapPin,
  User,
  AlertTriangle,
  Share2,
  Calendar,
  Trash2,
  FileText,
} from "lucide-react";
import type { ReferansLinki, Oturum } from "@/lib/store";

interface LinkSatiri {
  link: ReferansLinki;
  refSayisi: number;
}

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function kiraDonemi(bas?: string | null, bitis?: string | null): string | null {
  if (!bas && !bitis) return null;
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${AYLAR[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };
  if (bas && bitis) return `${fmt(bas)} – ${fmt(bitis)}`;
  if (bas) return `${fmt(bas)} –`;
  return `– ${fmt(bitis!)}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [satirlar, setSatirlar] = useState<LinkSatiri[]>([]);
  const [kopyalandi, setKopyalandi] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [oturum, setOturum] = useState<Oturum | null>(null);
  const [formAcik, setFormAcik] = useState(false);
  const [ozetModalAcik, setOzetModalAcik] = useState(false);
  const [silinecekId, setSilinecekId] = useState<string | null>(null);
  const [siliniyor, setSiliniyor] = useState(false);
  const [raporKopyalandi, setRaporKopyalandi] = useState<Record<string, boolean>>({});
  const [raporOlusturuluyor, setRaporOlusturuluyor] = useState<string | null>(null);

  const yenile = useCallback(async () => {
    const res = await fetch("/api/linkler");
    if (!res.ok) return;
    const linkler = await res.json();
    setSatirlar(
      linkler.map((link: ReferansLinki & { refSayisi: number }) => ({
        link,
        refSayisi: link.refSayisi ?? 0,
      }))
    );
  }, []);

  useEffect(() => {
    fetch("/api/auth/oturum")
      .then((r) => r.json())
      .then((aktifOturum) => {
        if (!aktifOturum || aktifOturum.rol !== "kiraci") {
          router.replace("/giris");
          return;
        }
        setOturum(aktifOturum);
        setMounted(true);
        yenile();
      });
  }, [yenile, router]);

  async function cikisYap() {
    await fetch("/api/auth/cikis", { method: "POST" });
    router.push("/giris");
  }

  async function sil(linkId: string) {
    setSiliniyor(true);
    await fetch(`/api/linkler?id=${linkId}`, { method: "DELETE" });
    setSilinecekId(null);
    setSiliniyor(false);
    yenile();
  }

  function kopyala(linkId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/referans/${linkId}`);
    setKopyalandi(linkId);
    setTimeout(() => setKopyalandi(null), 2000);
  }

  async function raporLinkKopyala(linkId: string) {
    setRaporOlusturuluyor(linkId);
    const res = await fetch(`/api/rapor-token?linkId=${linkId}`);
    if (!res.ok) { setRaporOlusturuluyor(null); return; }
    const { token } = await res.json();
    const url = `${window.location.origin}/rapor-paylas/${token}`;
    navigator.clipboard.writeText(url);
    setRaporOlusturuluyor(null);
    setRaporKopyalandi((prev) => ({ ...prev, [linkId]: true }));
    setTimeout(() => setRaporKopyalandi((prev) => ({ ...prev, [linkId]: false })), 2500);
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
                  onClick={() => setOzetModalAcik(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Genel Özet Linkini Paylaş
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
                    {/* ── Üst satır: içerik + aksiyonlar ── */}
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
                          <span className={`font-semibold text-xs ${refSayisi > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                            {refSayisi > 0 ? `${refSayisi} referans alındı` : "0 referans"}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs font-mono truncate mb-1.5">
                          {url}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(link.olusturulma).toLocaleDateString("tr-TR")}
                          </div>
                          {(link.kiraBaslangic || link.kiraBitis) && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {kiraDonemi(link.kiraBaslangic, link.kiraBitis)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {silinecekId === link.id ? (
                          <>
                            <span className="text-xs text-slate-300 hidden sm:inline">Emin misiniz?</span>
                            <button
                              onClick={() => sil(link.id)}
                              disabled={siliniyor}
                              className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                              {siliniyor ? "Siliniyor…" : "Evet, Sil"}
                            </button>
                            <button
                              onClick={() => setSilinecekId(null)}
                              disabled={siliniyor}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:text-white transition-all"
                            >
                              İptal
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Referans linki kopyala (eski ev sahibi için) */}
                            <button
                              onClick={() => kopyala(link.id)}
                              title="Form linkini kopyala (eski ev sahibine gönder)"
                              className={`flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 transition-all border ${
                                kopyalandi === link.id
                                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                  : "border-white/10 text-slate-400 hover:border-indigo-500/30 hover:text-indigo-300 hover:bg-indigo-500/10"
                              }`}
                            >
                              {kopyalandi === link.id ? (
                                <><Check className="w-3.5 h-3.5" /><span className="hidden sm:inline">Kopyalandı</span></>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Form Linki</span></>
                              )}
                            </button>
                            <button
                              onClick={() => setSilinecekId(link.id)}
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all"
                              title="Linki sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ── Rapor linki (referans alındıktan sonra) ── */}
                    {refSayisi > 0 && silinecekId !== link.id && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <button
                          onClick={() => raporLinkKopyala(link.id)}
                          disabled={raporOlusturuluyor === link.id}
                          className={`w-full flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl transition-all border-2 ${
                            raporKopyalandi[link.id]
                              ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                              : "bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 hover:border-indigo-400/60 hover:text-indigo-200"
                          } disabled:opacity-60`}
                        >
                          {raporKopyalandi[link.id] ? (
                            <><Check className="w-4 h-4" />Rapor Linki Kopyalandı!</>
                          ) : raporOlusturuluyor === link.id ? (
                            <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Hazırlanıyor…</>
                          ) : (
                            <><FileText className="w-4 h-4" />Rapor Linkini Kopyala<span className="text-xs font-normal opacity-70 ml-1">(Yeni ev sahibine gönder)</span></>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {ozetModalAcik && (
        <OzetSecimModal
          satirlar={satirlar}
          onKapat={() => setOzetModalAcik(false)}
        />
      )}

      {formAcik && (
        <LinkOlusturModal
          onKapat={() => setFormAcik(false)}
          onOlustur={async (bilgi: { evsahibiAdi: string; sehir?: string; kiraBaslangic?: string; kiraBitis?: string }) => {
            await fetch("/api/linkler", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(bilgi),
            });
            yenile();
            setFormAcik(false);
          }}
        />
      )}
    </main>
  );
}

// ── Özet link seçim modalı ────────────────────────────────────────────────────

function OzetSecimModal({
  satirlar,
  onKapat,
}: {
  satirlar: LinkSatiri[];
  onKapat: () => void;
}) {
  const refliIds = new Set(satirlar.filter((s) => s.refSayisi > 0).map((s) => s.link.id));
  const [secili, setSecili] = useState<Set<string>>(new Set(refliIds));
  const [olusturuluyor, setOlusturuluyor] = useState(false);
  const [ozetUrl, setOzetUrl] = useState<string | null>(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onKapat]);

  function toggle(id: string) {
    setSecili((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function olustur() {
    setOlusturuluyor(true);
    const res = await fetch("/api/ozet-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkIdleri: Array.from(secili) }),
    });
    const { token } = await res.json();
    const url = `${window.location.origin}/ozet/${token}`;
    setOzetUrl(url);
    navigator.clipboard.writeText(url);
    setKopyalandi(true);
    setTimeout(() => setKopyalandi(false), 3000);
    setOlusturuluyor(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onKapat}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 p-6 flex flex-col max-h-[85vh]"
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
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Özet Linki Oluştur</h2>
            <p className="text-xs text-gray-400">Dahil edilecek referans linklerini seçin</p>
          </div>
        </div>

        {/* Link listesi */}
        <div className="flex-1 overflow-y-auto space-y-2 mb-5 pr-1">
          {satirlar.map(({ link, refSayisi }) => {
            const aktif = refSayisi > 0;
            const checked = secili.has(link.id);
            return (
              <label
                key={link.id}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  aktif ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                } ${
                  checked && aktif
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => aktif && toggle(link.id)}
                  disabled={!aktif}
                  className="w-4 h-4 accent-indigo-600 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {link.evsahibiAdi ?? "İsimsiz Referans"}
                    {link.sehir && (
                      <span className="text-gray-400 font-normal"> · {link.sehir}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {aktif ? `${refSayisi} referans` : "Henüz referans yok"}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Kopyalanan URL */}
        {ozetUrl && (
          <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
            <span className="text-xs text-emerald-800 font-mono flex-1 truncate">{ozetUrl}</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 flex-shrink-0 whitespace-nowrap">
              <Check className="w-3.5 h-3.5" />
              {kopyalandi ? "Kopyalandı!" : "Hazır"}
            </span>
          </div>
        )}

        {/* Buton */}
        <button
          onClick={olustur}
          disabled={secili.size === 0 || olusturuluyor}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/30"
        >
          <Share2 className="w-4 h-4" />
          {olusturuluyor ? "Oluşturuluyor…" : ozetUrl ? "Linki Güncelle ve Kopyala" : "Özet Linki Oluştur"}
        </button>
      </div>
    </div>
  );
}

// ── Link oluşturma formu ───────────────────────────────────────────────────────

const SECIM_YILLAR = Array.from(
  { length: new Date().getFullYear() - 2000 + 4 },
  (_, i) => 2000 + i
);

function AyYilSecici({
  ayDeger, yilDeger, onAyDegis, onYilDegis,
}: {
  ayDeger: string; yilDeger: string;
  onAyDegis: (v: string) => void; onYilDegis: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={ayDeger}
        onChange={(e) => onAyDegis(e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
      >
        <option value="">Ay</option>
        {AYLAR.map((ay, i) => (
          <option key={i + 1} value={String(i + 1)}>{ay}</option>
        ))}
      </select>
      <select
        value={yilDeger}
        onChange={(e) => onYilDegis(e.target.value)}
        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
      >
        <option value="">Yıl</option>
        {SECIM_YILLAR.map((yil) => (
          <option key={yil} value={String(yil)}>{yil}</option>
        ))}
      </select>
    </div>
  );
}

function LinkOlusturModal({
  onKapat,
  onOlustur,
}: {
  onKapat: () => void;
  onOlustur: (bilgi: { evsahibiAdi: string; sehir?: string; kiraBaslangic?: string; kiraBitis?: string }) => void | Promise<void>;
}) {
  const [evsahibiAdi, setEvsahibiAdi] = useState("");
  const [sehir, setSehir] = useState("");
  const [hata, setHata] = useState("");
  const [basAy, setBasAy] = useState("");
  const [basYil, setBasYil] = useState("");
  const [bitisAy, setBitisAy] = useState("");
  const [bitisYil, setBitisYil] = useState("");

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
    const kiraBaslangic = basAy && basYil ? `${basYil}-${basAy.padStart(2, "0")}` : undefined;
    const kiraBitis = bitisAy && bitisYil ? `${bitisYil}-${bitisAy.padStart(2, "0")}` : undefined;
    onOlustur({ evsahibiAdi: evsahibiAdi.trim(), sehir: sehir.trim() || undefined, kiraBaslangic, kiraBitis });
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

          {/* Kira başlangıç tarihi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kira Başlangıç Tarihi <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
            </label>
            <AyYilSecici
              ayDeger={basAy} yilDeger={basYil}
              onAyDegis={setBasAy} onYilDegis={setBasYil}
            />
          </div>

          {/* Kira bitiş tarihi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Kira Bitiş Tarihi <span className="text-gray-400 font-normal">(isteğe bağlı)</span>
            </label>
            <AyYilSecici
              ayDeger={bitisAy} yilDeger={bitisYil}
              onAyDegis={setBitisAy} onYilDegis={setBitisYil}
            />
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
