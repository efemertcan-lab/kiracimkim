"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  LogOut,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Shield,
  History,
  AlertCircle,
  Copy,
  Check,
  X,
  User,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  linkReferanslari,
  riskHesapla,
  riskBilgisi,
  linkGoruntule,
  goruntulenenLinkleri,
  kararEkle,
  linkKarari,
  tokendenLinkId,
  oturumuGetir,
  oturumuSil,
  linkSahibiKim,
  kullaniciGetir,
  ozetTokendenKullaniciId,
  kullanicininTumLinkleri,
  goruntulenenOzetleri,
  ozetGoruntule,
  type ReferansFormu,
  type ReferansLinki,
  type GoruntulenenLink,
  type GoruntulenenOzet,
  type EvsahibiKarari,
  type RiskSeviyesi,
  type Oturum,
  type Kullanici,
} from "@/lib/store";

// ── Soru tanımları ────────────────────────────────────────────────────────────

const SORULAR = [
  {
    alan: "kiraOdemesi" as const,
    emoji: "💰",
    baslik: "Kira Ödemesi",
    secenekler: ["Zamanında", "Arada Geç", "Sık Sık Geç"],
  },
  {
    alan: "evDurumu" as const,
    emoji: "🏠",
    baslik: "Ev Durumu",
    secenekler: ["Hasarsız Teslim", "Küçük Sorunlar", "Hasarlı Teslim"],
  },
  {
    alan: "iletisim" as const,
    emoji: "📞",
    baslik: "İletişim",
    secenekler: ["Kolay Ulaşılır", "Karışık", "Ulaşmak Zor"],
  },
  {
    alan: "tasinma" as const,
    emoji: "📦",
    baslik: "Taşınma",
    secenekler: ["Sorunsuz", "Ortalama", "Sorunlu"],
  },
] as const;

type SoruAlani = (typeof SORULAR)[number]["alan"];

// ── Link ID çıkarıcı ──────────────────────────────────────────────────────────

function linkIdCikar(input: string): string {
  // rapor-paylas linki → token'dan linkId'yi çöz
  const raporMatch = input.trim().match(/\/rapor-paylas\/([a-z0-9]+)/i);
  if (raporMatch) return tokendenLinkId(raporMatch[1]) ?? "";
  // referans linki veya düz ID
  const refMatch = input.trim().match(/\/referans\/([a-z0-9]+)/i);
  return refMatch ? refMatch[1] : input.trim();
}

// ── Sonuç tipi ────────────────────────────────────────────────────────────────

interface Sonuc {
  linkId: string;
  refs: ReferansFormu[];
  risk: RiskSeviyesi | null;
  kiraci: Kullanici | null;
  goruntulenmeTarihi: string;
}

interface OzetSonuc {
  kullaniciId: string;
  kiraci: Kullanici | null;
  linkler: { link: ReferansLinki; refs: ReferansFormu[] }[];
  tumRefs: ReferansFormu[];
  risk: RiskSeviyesi | null;
  goruntulenmeTarihi: string;
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function EvsahibiDashboard() {
  const router = useRouter();
  const [girdi, setGirdi] = useState("");
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [ozetSonuc, setOzetSonuc] = useState<OzetSonuc | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [goruntulenenler, setGoruntulenenler] = useState<GoruntulenenLink[]>([]);
  const [goruntulenenOzetler, setGoruntulenenOzetler] = useState<GoruntulenenOzet[]>([]);
  const [mounted, setMounted] = useState(false);
  const [oturum, setOturum] = useState<Oturum | null>(null);

  const yenile = useCallback(() => {
    setGoruntulenenler(goruntulenenLinkleri());
    setGoruntulenenOzetler(goruntulenenOzetleri());
  }, []);

  useEffect(() => {
    const aktifOturum = oturumuGetir();
    if (!aktifOturum || aktifOturum.rol !== "evsahibi") {
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

  function goruntule() {
    // Özet link kontrolü
    const ozetMatch = girdi.trim().match(/\/ozet\/([a-z0-9]+)/i);
    if (ozetMatch) {
      const kullaniciId = ozetTokendenKullaniciId(ozetMatch[1]);
      if (!kullaniciId) {
        setHata("Özet linki geçersiz veya bu tarayıcıda oluşturulmamış.");
        return;
      }
      const kiraci = kullaniciGetir(kullaniciId);
      const linkler = kullanicininTumLinkleri(kullaniciId).map((link) => ({
        link,
        refs: linkReferanslari(link.id),
      }));
      const tumRefs = linkler.flatMap((l) => l.refs);
      ozetGoruntule(kullaniciId);
      setSonuc(null);
      setOzetSonuc({ kullaniciId, kiraci, linkler, tumRefs, risk: riskHesapla(tumRefs), goruntulenmeTarihi: new Date().toISOString() });
      yenile();
      setHata(null);
      return;
    }

    const linkId = linkIdCikar(girdi);
    if (!linkId) {
      if (girdi.includes("rapor-paylas")) {
        setHata("Rapor linki geçersiz veya bu tarayıcıda oluşturulmamış.");
      } else {
        setHata("Lütfen geçerli bir link veya link ID'si girin.");
      }
      return;
    }
    const refs = linkReferanslari(linkId);
    linkGoruntule(linkId);
    const kullaniciId = linkSahibiKim(linkId);
    const kiraci = kullaniciId ? kullaniciGetir(kullaniciId) : null;
    setOzetSonuc(null);
    setSonuc({ linkId, refs, risk: riskHesapla(refs), kiraci, goruntulenmeTarihi: new Date().toISOString() });
    setHata(null);
    yenile();
  }

  function karar(linkId: string, k: "verir" | "vermez") {
    kararEkle(linkId, k);
    yenile();
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
              <div className="w-6 h-6 bg-violet-500/30 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-violet-300" />
              </div>
              <span className="text-sm text-slate-300 font-medium">{oturum?.adSoyad ?? "Ev Sahibi"}</span>
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
            Ev Sahibi Paneli 🏠
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kiracı referans linkini yapıştırın ve risk değerlendirmesini görün.
          </p>
        </div>

        {/* ── Link görüntüleme alanı ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Referans Linki Yapıştır
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={girdi}
              onChange={(e) => { setGirdi(e.target.value); setHata(null); }}
              onKeyDown={(e) => e.key === "Enter" && goruntule()}
              placeholder="https://…/referans/abc123 veya sadece link ID'si"
              className="flex-1 bg-white/5 border border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            <button
              onClick={goruntule}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              Görüntüle
            </button>
          </div>
          {hata && (
            <p className="flex items-center gap-1.5 mt-2.5 text-xs text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {hata}
            </p>
          )}
        </div>

        {/* ── Sonuç paneli ── */}
        {sonuc && (
          <div className="mb-8">
            {/* Başlık + Kapat */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">
                  {sonuc.kiraci?.adSoyad ?? "Bilinmeyen Kiracı"}
                </h2>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(sonuc.goruntulenmeTarihi).toLocaleString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => { setSonuc(null); setGirdi(""); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
                Kapat
              </button>
            </div>

            {sonuc.refs.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-slate-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-white font-semibold mb-1">Referans bulunamadı</p>
                <p className="text-slate-400 text-sm">
                  Bu link için henüz hiç referans girilmemiş.
                </p>
              </div>
            ) : (
              <ReferansSonuclari sonuc={sonuc} />
            )}
          </div>
        )}

        {/* ── Özet sonuç paneli ── */}
        {ozetSonuc && (
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white font-bold text-xl">
                  {ozetSonuc.kiraci?.adSoyad ?? "Bilinmeyen Kiracı"}
                  <span className="ml-2 text-xs font-normal text-slate-400 align-middle">Genel Özet</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(ozetSonuc.goruntulenmeTarihi).toLocaleString("tr-TR", {
                    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => { setOzetSonuc(null); setGirdi(""); }}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
                Kapat
              </button>
            </div>
            <OzetSonuclari ozetSonuc={ozetSonuc} />

            {/* Karar bölümü */}
            <OzetKararBolumu
              ozetSonuc={ozetSonuc}
              onKarar={(k) => {
                kararEkle("ozet_" + ozetSonuc.kullaniciId, k);
                yenile();
              }}
            />
          </div>
        )}

        {/* ── Geçmiş ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-bold text-white">Görüntüleme Geçmişi</h2>
          </div>

          {goruntulenenler.length === 0 && goruntulenenOzetler.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Henüz link görüntülemediniz</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Yukarıya bir referans linki yapıştırıp &ldquo;Görüntüle&rdquo; butonuna bastığınızda burada listelenir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                ...goruntulenenler.map((g) => ({ tip: "link" as const, tarih: g.goruntulenmeTarihi, veri: g })),
                ...goruntulenenOzetler.map((o) => ({ tip: "ozet" as const, tarih: o.goruntulenmeTarihi, veri: o })),
              ]
                .sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime())
                .map((item) =>
                  item.tip === "link" ? (
                    <GecmisKarti
                      key={"link_" + item.veri.linkId}
                      goruntulenen={item.veri}
                      mevcutKarar={linkKarari(item.veri.linkId)}
                      onKarar={(k) => karar(item.veri.linkId, k)}
                      onGoruntule={() => {
                        const refs = linkReferanslari(item.veri.linkId);
                        const uid = linkSahibiKim(item.veri.linkId);
                        const kiraci = uid ? kullaniciGetir(uid) : null;
                        setOzetSonuc(null);
                        setSonuc({ linkId: item.veri.linkId, refs, risk: riskHesapla(refs), kiraci, goruntulenmeTarihi: item.veri.goruntulenmeTarihi });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ) : (
                    <GecmisOzetKarti
                      key={"ozet_" + item.veri.kullaniciId}
                      goruntulenenOzet={item.veri}
                      mevcutKarar={linkKarari("ozet_" + item.veri.kullaniciId)}
                      onKarar={(k) => { kararEkle("ozet_" + item.veri.kullaniciId, k); yenile(); }}
                      onGoruntule={() => {
                        const uid = item.veri.kullaniciId;
                        const kiraci = kullaniciGetir(uid);
                        const linkler = kullanicininTumLinkleri(uid).map((link) => ({ link, refs: linkReferanslari(link.id) }));
                        const tumRefs = linkler.flatMap((l) => l.refs);
                        setSonuc(null);
                        setOzetSonuc({ kullaniciId: uid, kiraci, linkler, tumRefs, risk: riskHesapla(tumRefs), goruntulenmeTarihi: item.veri.goruntulenmeTarihi });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

// ── Referans sonuçları paneli ─────────────────────────────────────────────────

function ReferansSonuclari({ sonuc }: { sonuc: Sonuc }) {
  const { linkId, refs, risk } = sonuc;
  const riskInfo = riskBilgisi(risk);

  return (
    <div className="space-y-4">
      {/* Risk kartı */}
      <div className={`rounded-2xl border p-6 ${riskInfo.bg} ${riskInfo.border}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <RiskIkonu seviye={risk} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${riskInfo.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dot}`} />
                {riskInfo.etiket}
              </span>
              <span className="text-xs text-gray-400">{refs.length} değerlendirme · …{linkId.slice(-8)}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{riskInfo.aciklama}</p>
          </div>
        </div>
      </div>

      {/* Soru dağılımları */}
      <div className="grid sm:grid-cols-2 gap-3">
        {SORULAR.map((soru) => {
          const dagilim: [number, number, number] = [0, 0, 0];
          refs.forEach((r) => { dagilim[r[soru.alan]]++; });
          const toplam = refs.length;

          return (
            <div key={soru.alan} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{soru.emoji}</span>
                <span className="text-white font-semibold text-sm">{soru.baslik}</span>
              </div>
              <div className="space-y-2.5">
                {soru.secenekler.map((secenek, i) => {
                  const adet = dagilim[i];
                  const yuzde = toplam > 0 ? Math.round((adet / toplam) * 100) : 0;
                  const barCls =
                    i === 0
                      ? "bg-emerald-500"
                      : i === 1
                      ? "bg-amber-500"
                      : "bg-red-500";
                  const textCls =
                    i === 0
                      ? "text-emerald-400"
                      : i === 1
                      ? "text-amber-400"
                      : "text-red-400";

                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-300">{secenek}</span>
                        <span className={`text-xs font-bold ${adet > 0 ? textCls : "text-slate-600"}`}>
                          {adet > 0 ? `${adet} kişi (%${yuzde})` : "–"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                          style={{ width: `${yuzde}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Geçmiş kartı ──────────────────────────────────────────────────────────────

function GecmisKarti({
  goruntulenen,
  mevcutKarar,
  onKarar,
  onGoruntule,
}: {
  goruntulenen: GoruntulenenLink;
  mevcutKarar: EvsahibiKarari | null;
  onKarar: (k: "verir" | "vermez") => void;
  onGoruntule: () => void;
}) {
  const { linkId, goruntulenmeTarihi } = goruntulenen;
  const [modalAcik, setModalAcik] = useState(false);
  const [kiraci, setKiraci] = useState<Kullanici | null>(null);

  const kiraciAdi = (() => {
    const uid = linkSahibiKim(linkId);
    return uid ? (kullaniciGetir(uid)?.adSoyad ?? "Bilinmeyen Kiracı") : "Bilinmeyen Kiracı";
  })();

  const gecmisRisk = riskHesapla(linkReferanslari(linkId));
  const gecmisRiskInfo = riskBilgisi(gecmisRisk);

  function kiriyaVer() {
    onKarar("verir");
    const kullaniciId = linkSahibiKim(linkId);
    const kullanici = kullaniciId ? kullaniciGetir(kullaniciId) : null;
    setKiraci(kullanici);
    setModalAcik(true);
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <button
                onClick={onGoruntule}
                className="text-white hover:text-indigo-300 font-semibold text-sm transition-colors"
              >
                {kiraciAdi}
              </button>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${gecmisRiskInfo.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gecmisRiskInfo.dot}`} />
                {gecmisRisk ? gecmisRiskInfo.etiket : "Değerlendirme Yok"}
              </span>
              {mevcutKarar && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    mevcutKarar.karar === "verir"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {mevcutKarar.karar === "verir" ? "✓ Kirayı Veririm" : "✕ Vermem"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {new Date(goruntulenmeTarihi).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={kiriyaVer}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${
                mevcutKarar?.karar === "verir"
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Kirayı Veririm
            </button>
            <button
              onClick={() => onKarar("vermez")}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${
                mevcutKarar?.karar === "vermez"
                  ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                  : "border-white/10 text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Vermem
            </button>
          </div>
        </div>
      </div>

      {modalAcik && (
        <KiraciModal
          kiraci={kiraci}
          linkId={linkId}
          onKapat={() => setModalAcik(false)}
        />
      )}
    </>
  );
}

// ── Kiracı bilgi modalı ───────────────────────────────────────────────────────

function KiraciModal({
  kiraci,
  linkId,
  onKapat,
}: {
  kiraci: Kullanici | null;
  linkId: string;
  onKapat: () => void;
}) {
  const [kopyalandi, setKopyalandi] = useState<string | null>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onKapat]);

  async function kopyala(deger: string, alan: string) {
    try {
      await navigator.clipboard.writeText(deger);
      setKopyalandi(alan);
      setTimeout(() => setKopyalandi(null), 2000);
    } catch {
      // clipboard erişimi yoksa sessizce geç
    }
  }

  const bilgiler = kiraci
    ? [
        { alan: "ad", ikon: <User className="w-4 h-4" />, etiket: "Ad Soyad", deger: kiraci.adSoyad },
        { alan: "telefon", ikon: <Phone className="w-4 h-4" />, etiket: "Telefon", deger: kiraci.telefon },
        { alan: "email", ikon: <Mail className="w-4 h-4" />, etiket: "E-posta", deger: kiraci.email },
      ]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onKapat}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Kart */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 p-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Kapat butonu */}
        <button
          onClick={onKapat}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Başlık */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">Kiracı Bilgileri</h2>
            <p className="text-xs text-gray-400 font-mono">…{linkId.slice(-8)}</p>
          </div>
        </div>

        {kiraci ? (
          <div className="space-y-3">
            {bilgiler.map(({ alan, ikon, etiket, deger }) => (
              <div
                key={alan}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
              >
                <div className="text-gray-400 flex-shrink-0">{ikon}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 font-medium mb-0.5">{etiket}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{deger}</p>
                </div>
                <button
                  onClick={() => kopyala(deger, alan)}
                  className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    kopyalandi === alan
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white border border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                  aria-label={`${etiket} kopyala`}
                >
                  {kopyalandi === alan ? (
                    <>
                      <Check className="w-3 h-3" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Kopyala
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <User className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">Kiracı bilgisi bulunamadı.</p>
            <p className="text-gray-400 text-xs mt-1">Bu link kayıtsız bir kullanıcıya ait olabilir.</p>
          </div>
        )}

        <button
          onClick={onKapat}
          className="w-full mt-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
        >
          Kapat
        </button>
      </div>
    </div>
  );
}

// ── Özet karar bölümü ────────────────────────────────────────────────────────

function OzetKararBolumu({
  ozetSonuc,
  onKarar,
}: {
  ozetSonuc: OzetSonuc;
  onKarar: (k: "verir" | "vermez") => void;
}) {
  const [modalAcik, setModalAcik] = useState(false);
  const [kiraci, setKiraci] = useState<Kullanici | null>(null);
  const mevcutKarar = linkKarari("ozet_" + ozetSonuc.kullaniciId);

  function kiriyaVer() {
    onKarar("verir");
    setKiraci(ozetSonuc.kiraci);
    setModalAcik(true);
  }

  return (
    <>
      <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
        <p className="text-slate-300 text-sm font-semibold mb-4">
          Bu kiracı hakkında kararınız:
        </p>
        <div className="flex gap-3">
          <button
            onClick={kiriyaVer}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${
              mevcutKarar?.karar === "verir"
                ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Kirayı Veririm
          </button>
          <button
            onClick={() => onKarar("vermez")}
            className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl border-2 transition-all ${
              mevcutKarar?.karar === "vermez"
                ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                : "border-white/10 text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
            }`}
          >
            <XCircle className="w-4 h-4" />
            Vermem
          </button>
        </div>
      </div>
      {modalAcik && (
        <KiraciModal
          kiraci={kiraci}
          linkId={ozetSonuc.kullaniciId}
          onKapat={() => { setModalAcik(false); }}
        />
      )}
    </>
  );
}

// ── Geçmiş özet kartı ─────────────────────────────────────────────────────────

function GecmisOzetKarti({
  goruntulenenOzet,
  mevcutKarar,
  onKarar,
  onGoruntule,
}: {
  goruntulenenOzet: GoruntulenenOzet;
  mevcutKarar: EvsahibiKarari | null;
  onKarar: (k: "verir" | "vermez") => void;
  onGoruntule: () => void;
}) {
  const { kullaniciId, goruntulenmeTarihi } = goruntulenenOzet;
  const [modalAcik, setModalAcik] = useState(false);
  const [kiraci, setKiraci] = useState<Kullanici | null>(null);

  const kiraciAdi = kullaniciGetir(kullaniciId)?.adSoyad ?? "Bilinmeyen Kiracı";

  function kiriyaVer() {
    onKarar("verir");
    setKiraci(kullaniciGetir(kullaniciId) ?? null);
    setModalAcik(true);
  }

  return (
    <>
      <div className="bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <button
                onClick={onGoruntule}
                className="text-white hover:text-indigo-300 font-semibold text-sm transition-colors"
              >
                {kiraciAdi}
              </button>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                Genel Özet
              </span>
              {mevcutKarar && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    mevcutKarar.karar === "verir"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {mevcutKarar.karar === "verir" ? "✓ Kirayı Veririm" : "✕ Vermem"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {new Date(goruntulenmeTarihi).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={kiriyaVer}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${
                mevcutKarar?.karar === "verir"
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "border-white/10 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Kirayı Veririm
            </button>
            <button
              onClick={() => onKarar("vermez")}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all ${
                mevcutKarar?.karar === "vermez"
                  ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30"
                  : "border-white/10 text-slate-400 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Vermem
            </button>
          </div>
        </div>
      </div>
      {modalAcik && (
        <KiraciModal
          kiraci={kiraci}
          linkId={kullaniciId}
          onKapat={() => setModalAcik(false)}
        />
      )}
    </>
  );
}

// ── Özet sonuçları paneli ─────────────────────────────────────────────────────

const OZET_SORULAR = [
  { alan: "kiraOdemesi" as const, emoji: "💰", baslik: "Kira Ödemesi", secenekler: ["Zamanında", "Arada Geç", "Sık Sık Geç"] },
  { alan: "evDurumu"    as const, emoji: "🏠", baslik: "Ev Durumu",    secenekler: ["Hasarsız Teslim", "Küçük Sorunlar", "Hasarlı Teslim"] },
  { alan: "iletisim"   as const, emoji: "📞", baslik: "İletişim",     secenekler: ["Kolay Ulaşılır", "Karışık", "Ulaşmak Zor"] },
  { alan: "tasinma"    as const, emoji: "📦", baslik: "Taşınma",      secenekler: ["Sorunsuz", "Ortalama", "Sorunlu"] },
] as const;

type OzetSoruAlani = "kiraOdemesi" | "evDurumu" | "iletisim" | "tasinma";

function OzetSonuclari({ ozetSonuc }: { ozetSonuc: OzetSonuc }) {
  const { linkler, tumRefs, risk } = ozetSonuc;
  const riskInfo = riskBilgisi(risk);
  const [acikId, setAcikId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Genel risk kartı */}
      <div className={`rounded-2xl border p-6 ${riskInfo.bg} ${riskInfo.border}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
            <RiskIkonu seviye={risk} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${riskInfo.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dot}`} />
                {riskInfo.etiket}
              </span>
              <span className="text-xs text-gray-400">
                {tumRefs.length} değerlendirme · {linkler.length} link
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{riskInfo.aciklama}</p>
          </div>
        </div>
      </div>

      {/* Per-link kartları */}
      {linkler.filter((l) => l.refs.length > 0).length > 0 && (
        <>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Referans Linkleri
          </p>
          <div className="space-y-2">
            {linkler.map(({ link, refs }) => {
              if (refs.length === 0) return null;
              const lRisk = riskHesapla(refs);
              const lInfo = riskBilgisi(lRisk);
              const acik = acikId === link.id;
              return (
                <div key={link.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setAcikId(acik ? null : link.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${lInfo.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${lInfo.dot}`} />
                      {lInfo.etiket}
                    </span>
                    <span className="flex-1 text-white text-sm font-medium truncate">
                      {link.evsahibiAdi ?? "İsimsiz Referans"}
                      {link.sehir && <span className="text-slate-400 font-normal"> · {link.sehir}</span>}
                    </span>
                    <span className="text-xs text-slate-500 flex-shrink-0">{refs.length} ref</span>
                    {acik
                      ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    }
                  </button>
                  {acik && (
                    <div className="px-4 pb-4 border-t border-white/5">
                      <div className="grid sm:grid-cols-2 gap-3 pt-3">
                        {OZET_SORULAR.map((soru) => {
                          const dagilim: [number, number, number] = [0, 0, 0];
                          refs.forEach((r) => { dagilim[r[soru.alan as OzetSoruAlani]]++; });
                          const toplam = refs.length;
                          return (
                            <div key={soru.alan} className="bg-white/5 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-base">{soru.emoji}</span>
                                <span className="text-white text-xs font-semibold">{soru.baslik}</span>
                              </div>
                              <div className="space-y-2">
                                {soru.secenekler.map((secenek, i) => {
                                  const adet = dagilim[i];
                                  const yuzde = toplam > 0 ? Math.round((adet / toplam) * 100) : 0;
                                  const barCls = i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-red-500";
                                  return (
                                    <div key={i}>
                                      <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-xs text-slate-300">{secenek}</span>
                                        <span className="text-xs text-slate-500">{adet > 0 ? `${adet} (%${yuzde})` : "–"}</span>
                                      </div>
                                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${barCls}`} style={{ width: `${yuzde}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Risk ikonu ────────────────────────────────────────────────────────────────

function RiskIkonu({ seviye }: { seviye: RiskSeviyesi | null }) {
  if (seviye === "dusuk") return <ShieldCheck className="w-7 h-7 text-emerald-500" />;
  if (seviye === "orta")  return <ShieldAlert className="w-7 h-7 text-amber-500" />;
  if (seviye === "yuksek") return <ShieldX className="w-7 h-7 text-red-500" />;
  return <Shield className="w-7 h-7 text-gray-400" />;
}
