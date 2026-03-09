"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Calendar,
  Trash2,
  MessageSquare,
  Info,
  ArrowLeft,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import {
  riskHesapla,
  riskBilgisi,
  type ReferansFormu,
  type ReferansLinki,
  type RiskSeviyesi,
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

// ── Yardımcı ──────────────────────────────────────────────────────────────────

const AYLAR_ES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function kiraDonemiEs(bas?: string | null, bitis?: string | null): string | null {
  if (!bas && !bitis) return null;
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${AYLAR_ES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  };
  if (bas && bitis) return `${fmt(bas)} – ${fmt(bitis)}`;
  if (bas) return `${fmt(bas)} –`;
  return `– ${fmt(bitis!)}`;
}

// ── Tipler ────────────────────────────────────────────────────────────────────

interface LinkMeta {
  evsahibiAdi?: string | null;
  sehir?: string | null;
  kiraBaslangic?: string | null;
  kiraBitis?: string | null;
}

interface OturumDurumu {
  id: string;
  adSoyad: string;
  email: string;
  rol: string;
}

interface KiraciInfo {
  id: string;
  adSoyad: string;
  email: string;
  telefon: string;
}

interface Sonuc {
  linkId: string;
  refs: ReferansFormu[];
  risk: RiskSeviyesi | null;
  kiraci: KiraciInfo | null;
  goruntulenmeTarihi: string;
  linkMeta?: LinkMeta;
}

interface OzetSonuc {
  kullaniciId: string;
  kiraci: KiraciInfo | null;
  linkler: { link: ReferansLinki; refs: ReferansFormu[] }[];
  tumRefs: ReferansFormu[];
  risk: RiskSeviyesi | null;
  goruntulenmeTarihi: string;
}

interface GecmisItem {
  linkId: string;
  goruntulenmeTarihi: string;
  kiraciId: string | null;
  kiraciAdSoyad: string;
  evsahibiAdi?: string | null;
  kiraBaslangic?: string | null;
  kiraBitis?: string | null;
  refs: ReferansFormu[];
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

export default function EvsahibiDashboard() {
  const router = useRouter();
  const [girdi, setGirdi] = useState("");
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);
  const [ozetSonuc, setOzetSonuc] = useState<OzetSonuc | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [goruntulenenler, setGoruntulenenler] = useState<GecmisItem[]>([]);
  const [kararlar, setKararlar] = useState<Record<string, "verir" | "vermez" | "kiralandı">>({});
  const [sebepler, setSebepler] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);
  const [oturum, setOturum] = useState<OturumDurumu | null>(null);
  const [aktifSekme, setAktifSekme] = useState<"bekleyen" | "verir" | "vermez" | "tamamlandi">("bekleyen");

  const yenile = useCallback(async () => {
    const [gorRes, karRes] = await Promise.all([
      fetch("/api/ev-sahibi/goruntulenenler"),
      fetch("/api/ev-sahibi/karar"),
    ]);
    if (gorRes.ok) {
      const dbItems: GecmisItem[] = await gorRes.json();
      // DB'den gelen kayıtları in-memory kayıtlarla birleştir (in-memory kaybetme)
      setGoruntulenenler((prev) => {
        const dbIds = new Set(dbItems.map((i) => i.linkId));
        const memoryOnly = prev.filter((i) => !dbIds.has(i.linkId));
        return [...dbItems, ...memoryOnly];
      });
    }
    if (karRes.ok) {
      const karListesi: { linkId: string; karar: string; sebep?: string | null }[] = await karRes.json();
      const map: Record<string, "verir" | "vermez" | "kiralandı"> = {};
      const sebepler: Record<string, string> = {};
      karListesi.forEach((k) => {
        map[k.linkId] = k.karar as "verir" | "vermez" | "kiralandı";
        if (k.sebep) sebepler[k.linkId] = k.sebep;
      });
      setKararlar(map);
      setSebepler(sebepler);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/oturum")
      .then((r) => r.json())
      .then((aktifOturum) => {
        if (!aktifOturum || aktifOturum.rol !== "evsahibi") {
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

  async function fetchKiraci(linkId: string): Promise<KiraciInfo | null> {
    const gecerliRes = await fetch(`/api/linkler/gecerli?id=${linkId}`);
    if (!gecerliRes.ok) return null;
    const gecerli = await gecerliRes.json();
    if (!gecerli?.kullaniciId) return null;
    const kulRes = await fetch(`/api/kullanici?id=${gecerli.kullaniciId}`);
    return kulRes.ok ? kulRes.json() : null;
  }

  async function goruntule() {
    setHata(null);
    const input = girdi.trim();

    // Özet link
    const ozetMatch = input.match(/\/ozet\/([a-z0-9]+)/i);
    if (ozetMatch) {
      const res = await fetch(`/api/ozet?token=${ozetMatch[1]}`);
      const veri = await res.json();
      if (!veri.gecerli) {
        setHata("Özet linki geçersiz.");
        return;
      }
      const linkler = (
        veri.linkler as (ReferansLinki & { referanslar: ReferansFormu[] })[]
      ).map((l) => ({ link: l, refs: l.referanslar ?? [] }));
      const tumRefs = linkler.flatMap((l) => l.refs);
      const kulRes = await fetch(`/api/kullanici?id=${veri.kullaniciId}`);
      const kiraci: KiraciInfo | null = kulRes.ok ? await kulRes.json() : null;
      setSonuc(null);
      setOzetSonuc({
        kullaniciId: veri.kullaniciId,
        kiraci,
        linkler,
        tumRefs,
        risk: riskHesapla(tumRefs),
        goruntulenmeTarihi: new Date().toISOString(),
      });
      setHata(null);
      await yenile();
      return;
    }

    // Rapor-paylas link
    const raporMatch = input.match(/\/rapor-paylas\/([a-z0-9]+)/i);
    if (raporMatch) {
      const res = await fetch(`/api/rapor?token=${raporMatch[1]}`);
      const veri = await res.json();
      if (!veri.gecerli) {
        setHata("Rapor linki geçersiz veya bu tarayıcıda oluşturulmamış.");
        return;
      }
      const refs: ReferansFormu[] = veri.referanslar;
      const kiraci = await fetchKiraci(veri.linkId);
      const gorTarihi = new Date().toISOString();
      const linkMeta: LinkMeta | undefined = veri.linkMeta ?? undefined;

      // Optimistic update ÖNCE — rapor göster ve geçmişe ekle
      setGoruntulenenler((prev) => {
        const filtered = prev.filter((g) => g.linkId !== veri.linkId);
        return [{ linkId: veri.linkId, goruntulenmeTarihi: gorTarihi, kiraciId: kiraci?.id ?? null, kiraciAdSoyad: kiraci?.adSoyad ?? "Bilinmeyen Kiracı", refs }, ...filtered];
      });
      setOzetSonuc(null);
      setSonuc({ linkId: veri.linkId, refs, risk: riskHesapla(refs), kiraci, goruntulenmeTarihi: gorTarihi, linkMeta });
      setHata(null);

      // DB'ye kaydet (ardından DB'den senkronize et)
      await fetch("/api/ev-sahibi/goruntule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkId: veri.linkId }),
      });
      await yenile();
      return;
    }

    // Referans linki veya düz linkId
    const refMatch = input.match(/\/referans\/([a-z0-9]+)/i);
    const linkId = refMatch ? refMatch[1] : input;

    if (!linkId) {
      setHata("Lütfen geçerli bir link veya link ID'si girin.");
      return;
    }

    const [refsRes, gecerliRes] = await Promise.all([
      fetch(`/api/referanslar?linkId=${linkId}`),
      fetch(`/api/linkler/gecerli?id=${linkId}`),
    ]);
    if (!refsRes.ok) {
      setHata("Link bulunamadı.");
      return;
    }
    const refs: ReferansFormu[] = await refsRes.json();
    const gecerliVeri = gecerliRes.ok ? await gecerliRes.json() : null;
    const linkMeta: LinkMeta | undefined = gecerliVeri?.gecerli
      ? { evsahibiAdi: gecerliVeri.evsahibiAdi, sehir: gecerliVeri.sehir, kiraBaslangic: gecerliVeri.kiraBaslangic, kiraBitis: gecerliVeri.kiraBitis }
      : undefined;
    const kiraci = gecerliVeri?.kullaniciId
      ? await fetch(`/api/kullanici?id=${gecerliVeri.kullaniciId}`).then((r) => r.ok ? r.json() : null)
      : null;
    const gorTarihi = new Date().toISOString();

    // Optimistic update ÖNCE — rapor göster ve geçmişe ekle
    setGoruntulenenler((prev) => {
      const filtered = prev.filter((g) => g.linkId !== linkId);
      return [{ linkId, goruntulenmeTarihi: gorTarihi, kiraciId: kiraci?.id ?? null, kiraciAdSoyad: kiraci?.adSoyad ?? "Bilinmeyen Kiracı", refs }, ...filtered];
    });
    setOzetSonuc(null);
    setSonuc({ linkId, refs, risk: riskHesapla(refs), kiraci, goruntulenmeTarihi: gorTarihi, linkMeta });
    setHata(null);

    // DB'ye kaydet (ardından DB'den senkronize et)
    await fetch("/api/ev-sahibi/goruntule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId }),
    });
    await yenile();
  }

  async function kararGeriAl(linkId: string) {
    setKararlar((prev) => {
      const next = { ...prev };
      delete next[linkId];
      return next as Record<string, "verir" | "vermez" | "kiralandı">;
    });
    await fetch(`/api/ev-sahibi/karar?linkId=${encodeURIComponent(linkId)}`, { method: "DELETE" });
  }

  async function karar(linkId: string, k: "verir" | "vermez" | "kiralandı", sebep?: string) {
    // Anında görsel güncelleme
    setKararlar((prev) => ({ ...prev, [linkId]: k }));
    if (k === "vermez" && sebep) {
      setSebepler((prev) => ({ ...prev, [linkId]: sebep }));
    }

    await fetch("/api/ev-sahibi/karar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ linkId, karar: k, ...(sebep ? { sebep } : {}) }),
    });

    // DB ile senkronize et, mevcut in-memory kararları koru
    const karRes = await fetch("/api/ev-sahibi/karar");
    if (karRes.ok) {
      const karListesi: { linkId: string; karar: string; sebep?: string | null }[] = await karRes.json();
      const dbMap: Record<string, "verir" | "vermez" | "kiralandı"> = {};
      const dbSebepler: Record<string, string> = {};
      karListesi.forEach((item) => {
        dbMap[item.linkId] = item.karar as "verir" | "vermez" | "kiralandı";
        if (item.sebep) dbSebepler[item.linkId] = item.sebep;
      });
      setKararlar((prev) => ({ ...prev, ...dbMap }));
      setSebepler((prev) => ({ ...prev, ...dbSebepler }));
    }
  }

  async function gecmisKaydiSil(linkId: string) {
    // Optimistic update
    setGoruntulenenler((prev) => prev.filter((g) => g.linkId !== linkId));
    setKararlar((prev) =>
      Object.fromEntries(Object.entries(prev).filter(([k]) => k !== linkId)) as Record<string, "verir" | "vermez">
    );
    await fetch(`/api/ev-sahibi/goruntulenenler?linkId=${linkId}`, { method: "DELETE" });
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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-6 sm:mb-10">
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
        <div className="mb-5 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ev Sahibi Paneli 🏠
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kiracı referans linkini yapıştırın ve risk değerlendirmesini görün.
          </p>
        </div>

        {/* ── Link görüntüleme alanı ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-3">
            Referans Linki Yapıştır
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={girdi}
              onChange={(e) => { setGirdi(e.target.value); setHata(null); }}
              onKeyDown={(e) => e.key === "Enter" && goruntule()}
              placeholder="https://…/referans/abc123 veya sadece link ID'si"
              className="flex-1 min-w-0 bg-white/5 border border-white/10 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
            />
            <button
              onClick={goruntule}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 sm:hover:-translate-y-0.5 w-full sm:w-auto flex-shrink-0"
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
                onClick={() => setSonuc(null)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 mt-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Listeye Dön
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
              <>
                <ReferansSonuclari sonuc={sonuc} />
                <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-slate-300 text-sm font-semibold mb-1">
                    Bu kiracı hakkında kararınız:
                  </p>
                  <p className="text-slate-600 text-xs mb-4">
                    Bu karar yalnızca sizin panelinizde görünür, kiracıyla paylaşılmaz. İstediğiniz zaman değiştirebilirsiniz.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <KararButonu
                      aktif={kararlar[sonuc.linkId] === "verir"}
                      onKarar={(k) => karar(sonuc.linkId, k)}
                      onGeriAl={() => kararGeriAl(sonuc.linkId)}
                    />
                    <button
                      onClick={() =>
                        kararlar[sonuc.linkId] === "vermez"
                          ? kararGeriAl(sonuc.linkId)
                          : karar(sonuc.linkId, "vermez")
                      }
                      className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                        kararlar[sonuc.linkId] === "vermez"
                          ? "bg-red-500/20 border-red-500/50 text-red-400"
                          : "border-white/10 text-slate-500 hover:border-red-500/30 hover:text-red-400/70"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Vermem
                    </button>
                  </div>
                </div>
              </>
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
                onClick={() => setOzetSonuc(null)}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5 transition-colors flex-shrink-0 mt-0.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Listeye Dön
              </button>
            </div>
            <OzetSonuclari ozetSonuc={ozetSonuc} />

            {/* Karar bölümü */}
            <div className="mt-6 bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-slate-300 text-sm font-semibold mb-1">
                Bu kiracı hakkında kararınız:
              </p>
              <p className="text-slate-600 text-xs mb-4">
                Bu karar yalnızca sizin panelinizde görünür, kiracıyla paylaşılmaz. İstediğiniz zaman değiştirebilirsiniz.
              </p>
              <div className="flex flex-wrap gap-3">
                <KararButonu
                  aktif={kararlar["ozet_" + ozetSonuc.kullaniciId] === "verir"}
                  onKarar={(k) => karar("ozet_" + ozetSonuc.kullaniciId, k)}
                  onGeriAl={() => kararGeriAl("ozet_" + ozetSonuc.kullaniciId)}
                />
                <button
                  onClick={() =>
                    kararlar["ozet_" + ozetSonuc.kullaniciId] === "vermez"
                      ? kararGeriAl("ozet_" + ozetSonuc.kullaniciId)
                      : karar("ozet_" + ozetSonuc.kullaniciId, "vermez")
                  }
                  className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition-all ${
                    kararlar["ozet_" + ozetSonuc.kullaniciId] === "vermez"
                      ? "bg-red-500/20 border-red-500/50 text-red-400"
                      : "border-white/10 text-slate-500 hover:border-red-500/30 hover:text-red-400/70"
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Vermem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Geçmiş ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-slate-400" />
            <h2 className="text-lg font-bold text-white">Görüntüleme Geçmişi</h2>
          </div>

          {goruntulenenler.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <History className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold mb-2">Henüz link görüntülemediniz</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Yukarıya bir referans linki yapıştırıp &ldquo;Görüntüle&rdquo; butonuna bastığınızda burada listelenir.
              </p>
            </div>
          ) : (() => {
            const bekleyenler   = goruntulenenler.filter((g) => !kararlar[g.linkId]);
            const verilenler    = goruntulenenler.filter((g) => kararlar[g.linkId] === "verir");
            const reddedilenler = goruntulenenler.filter((g) => kararlar[g.linkId] === "vermez");
            const tamamlananlar = goruntulenenler.filter((g) => kararlar[g.linkId] === "kiralandı");
            const sekmeler = [
              { id: "bekleyen"   as const, etiket: "Bekleyenler",    kisa: "Bekleyen",  count: bekleyenler.length,   dotRenk: "bg-amber-400" },
              { id: "verir"      as const, etiket: "Kirayı Veririm", kisa: "Veririm",   count: verilenler.length,    dotRenk: "bg-emerald-400" },
              { id: "vermez"     as const, etiket: "Vermem",         kisa: "Vermem",    count: reddedilenler.length, dotRenk: "bg-red-400" },
              { id: "tamamlandi" as const, etiket: "Tamamlandı",     kisa: "Tamam",     count: tamamlananlar.length, dotRenk: "bg-indigo-400" },
            ];
            const aktifItems =
              aktifSekme === "bekleyen"   ? bekleyenler   :
              aktifSekme === "verir"      ? verilenler    :
              aktifSekme === "vermez"     ? reddedilenler :
                                           tamamlananlar;

            const boslukMesaji: Record<string, { baslik: string; aciklama: string }> = {
              bekleyen:   { baslik: "Bekleyen kiracı yok", aciklama: "Tüm kiracılar için karar verdiniz." },
              verir:      { baslik: "Henüz kimseye kirayı vermediniz", aciklama: "Kart üzerindeki \"Kirayı Veririm\" butonunu kullanın." },
              vermez:     { baslik: "Henüz kimseyi reddetmediniz", aciklama: "Kart üzerindeki \"Vermem\" butonunu kullanın." },
              tamamlandi: { baslik: "Tamamlanan kiralama yok", aciklama: "\"Kirayı Veririm\" sekmesindeki kartlarda \"Kiraladım\" butonuna basın." },
            };

            return (
              <>
                {/* Sekme butonları */}
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 mb-4 gap-1">
                  {sekmeler.map((sekme) => (
                    <button
                      key={sekme.id}
                      onClick={() => setAktifSekme(sekme.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg text-xs font-semibold transition-all min-w-0 ${
                        aktifSekme === sekme.id
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sekme.dotRenk} ${aktifSekme === sekme.id ? "opacity-100" : "opacity-50"}`} />
                      <span className="hidden sm:inline truncate">{sekme.etiket}</span>
                      <span className="sm:hidden truncate">{sekme.kisa}</span>
                      <span className={`text-[10px] px-1 py-0.5 rounded-full font-bold flex-shrink-0 ${
                        aktifSekme === sekme.id ? "bg-white/15 text-white" : "bg-white/5 text-slate-500"
                      }`}>
                        {sekme.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Liste */}
                {aktifItems.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 text-center">
                    <p className="text-white font-semibold mb-1">{boslukMesaji[aktifSekme].baslik}</p>
                    <p className="text-slate-400 text-sm">{boslukMesaji[aktifSekme].aciklama}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aktifItems.map((item) => (
                      <GecmisKarti
                        key={item.linkId}
                        item={item}
                        karar={kararlar[item.linkId]}
                        sebep={sebepler[item.linkId]}
                        onKarar={(k, s) => karar(item.linkId, k, s)}
                        onGeriAl={() => kararGeriAl(item.linkId)}
                        onSil={() => gecmisKaydiSil(item.linkId)}
                        onGoruntule={() => {
                          setOzetSonuc(null);
                          setSonuc({
                            linkId: item.linkId,
                            refs: item.refs,
                            risk: riskHesapla(item.refs),
                            kiraci: item.kiraciId
                              ? { id: item.kiraciId, adSoyad: item.kiraciAdSoyad, email: "", telefon: "" }
                              : null,
                            goruntulenmeTarihi: item.goruntulenmeTarihi,
                            linkMeta: (item.kiraBaslangic || item.kiraBitis)
                              ? { kiraBaslangic: item.kiraBaslangic, kiraBitis: item.kiraBitis }
                              : undefined,
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </section>
      </div>
    </main>
  );
}

// ── Karar butonu (Kirayı Veririm + modal) ─────────────────────────────────────

function KararButonu({
  aktif,
  onKarar,
  onGeriAl,
}: {
  aktif: boolean;
  onKarar: (k: "verir") => void;
  onGeriAl: () => void;
}) {
  return (
    <button
      onClick={() => (aktif ? onGeriAl() : onKarar("verir"))}
      className={`flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl border-2 transition-all ${
        aktif
          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30"
          : "bg-emerald-600/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-400 hover:text-emerald-300"
      }`}
    >
      <CheckCircle2 className="w-4 h-4" />
      Kirayı Veririm
    </button>
  );
}

// ── Referans sonuçları paneli ─────────────────────────────────────────────────

function ReferansSonuclari({ sonuc }: { sonuc: Sonuc }) {
  const { linkId, refs, risk, linkMeta } = sonuc;
  const riskInfo = riskBilgisi(risk);
  const donemi = kiraDonemiEs(linkMeta?.kiraBaslangic, linkMeta?.kiraBitis);

  return (
    <div className="space-y-4">
      {/* Risk kartı */}
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
              <span className="text-xs text-gray-400">{refs.length} değerlendirme · …{linkId.slice(-8)}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{riskInfo.aciklama}</p>
            {donemi && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>{donemi}</span>
              </div>
            )}
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
                  const barCls = i === 0 ? "bg-emerald-500" : i === 1 ? "bg-amber-500" : "bg-red-500";
                  const textCls = i === 0 ? "text-emerald-400" : i === 1 ? "text-amber-400" : "text-red-400";

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
  item,
  karar,
  sebep,
  onKarar,
  onGeriAl,
  onSil,
  onGoruntule,
}: {
  item: GecmisItem;
  karar: "verir" | "vermez" | "kiralandı" | undefined;
  sebep?: string;
  onKarar: (k: "verir" | "vermez" | "kiralandı", sebep?: string) => void;
  onGeriAl: () => void;
  onSil: () => void;
  onGoruntule: () => void;
}) {
  const [detayModalAcik, setDetayModalAcik] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const risk = riskHesapla(item.refs);
  const riskInfo = riskBilgisi(risk);

  const tamamlandi = karar === "kiralandı";

  useEffect(() => {
    if (!menuAcik) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAcik(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuAcik]);

  return (
    <>
      <div className={`border rounded-2xl p-4 sm:p-5 transition-all ${
        tamamlandi
          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30"
          : "bg-white/5 border-white/10 hover:border-white/20"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <button
                onClick={onGoruntule}
                className="text-white hover:text-indigo-300 font-semibold text-sm transition-colors"
              >
                {item.kiraciAdSoyad}
              </button>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${riskInfo.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${riskInfo.dot}`} />
                {risk ? riskInfo.etiket : "Değerlendirme Yok"}
              </span>
              {tamamlandi && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="w-3 h-3" />
                  Kiralandı
                </span>
              )}
              {karar === "vermez" && sebep && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">
                  {sebep}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              {new Date(item.goruntulenmeTarihi).toLocaleString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            {(item.kiraBaslangic || item.kiraBitis) && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="w-3 h-3" />
                {kiraDonemiEs(item.kiraBaslangic, item.kiraBitis)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Ana aksiyon: Raporu Görüntüle */}
            <button
              onClick={onGoruntule}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border-2 border-indigo-500/50 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 hover:border-indigo-400/70 hover:text-indigo-200 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Raporu Görüntüle
            </button>

            {/* Overflow menü */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuAcik((prev) => !prev)}
                className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuAcik && (
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#1a1f2e] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                  {item.kiraciId && (
                    <button
                      onClick={() => { setDetayModalAcik(true); setMenuAcik(false); }}
                      className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Kiracı Detayını Gör
                    </button>
                  )}
                  <button
                    onClick={() => { onSil(); setMenuAcik(false); }}
                    className="flex items-center gap-2.5 w-full px-4 py-3 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Kaydı Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {detayModalAcik && (
        <DetayModal
          item={item}
          onKapat={() => setDetayModalAcik(false)}
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
  kiraci: KiraciInfo | null;
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-black/40 p-8 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onKapat}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

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
                    <><Check className="w-3 h-3" />Kopyalandı</>
                  ) : (
                    <><Copy className="w-3 h-3" />Kopyala</>
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

// ── Referans detay modalı ─────────────────────────────────────────────────────

const DETAY_KATEGORI_RENK: Record<number, { bg: string; border: string; text: string }> = {
  0: { bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" },
  1: { bg: "bg-amber-50",   border: "border-amber-100",   text: "text-amber-700"   },
  2: { bg: "bg-red-50",     border: "border-red-100",     text: "text-red-700"     },
};

const DETAY_KATEGORI_ISIMLER: Record<string, string> = {
  kiraOdemesi: "Kira Ödemesi",
  evDurumu: "Ev Durumu",
  iletisim: "İletişim",
  tasinma: "Taşınma",
};

const DETAY_KATEGORI_ETIKETLER: Record<string, [string, string, string]> = {
  kiraOdemesi: ["Zamanında", "Arada Geç", "Sık Sık Geç"],
  evDurumu:    ["Hasarsız Teslim", "Küçük Sorunlar", "Hasarlı Teslim"],
  iletisim:    ["Kolay Ulaşılır", "Karışık", "Ulaşmak Zor"],
  tasinma:     ["Sorunsuz", "Ortalama", "Sorunlu"],
};

function DetayModal({
  item,
  onKapat,
}: {
  item: GecmisItem;
  onKapat: () => void;
}) {
  const [kiraci, setKiraci] = useState<KiraciInfo | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function yukle() {
      if (item.kiraciId) {
        const res = await fetch(`/api/kullanici?id=${item.kiraciId}`);
        if (res.ok) setKiraci(await res.json());
      }
      setYukleniyor(false);
    }
    yukle();
  }, [item.kiraciId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onKapat]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onKapat}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">İletişim Bilgileri</h2>
            <p className="text-sm text-gray-500 mt-0.5">{item.kiraciAdSoyad}</p>
          </div>
          <button
            onClick={onKapat}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {yukleniyor ? (
            <p className="text-center text-gray-400 text-sm py-6">Yükleniyor…</p>
          ) : !kiraci ? (
            <p className="text-center text-gray-400 text-sm py-6">İletişim bilgisi bulunamadı.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">Ad Soyad</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{kiraci.adSoyad}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">Telefon</p>
                  {kiraci.telefon ? (
                    <a href={`tel:${kiraci.telefon}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                      {kiraci.telefon}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 font-medium">E-posta</p>
                  {kiraci.email ? (
                    <a href={`mailto:${kiraci.email}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate block">
                      {kiraci.email}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">—</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          <button
            onClick={onKapat}
            className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Vermem sebebi seçim modalı ────────────────────────────────────────────────

const VERMEZ_SEBEPLER = [
  "Ödeme düzensiz",
  "İletişim zor",
  "Riskli hissettirdi",
  "Genel olarak güvenmedim",
  "Diğer",
];

function VermezSebebiModal({
  onSec,
  onKapat,
}: {
  onSec: (sebep: string) => void;
  onKapat: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onKapat();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onKapat]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onKapat}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/40 p-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onKapat}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Kararınızın sebebi nedir?</h2>
            <p className="text-xs text-gray-400">Bir seçenek seçin</p>
          </div>
        </div>

        <div className="space-y-2">
          {VERMEZ_SEBEPLER.map((sebep) => (
            <button
              key={sebep}
              onClick={() => onSec(sebep)}
              className="w-full text-left text-sm font-medium px-4 py-3 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-all"
            >
              {sebep}
            </button>
          ))}
        </div>
      </div>
    </div>
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
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">
                        {link.evsahibiAdi ?? "İsimsiz Referans"}
                        {link.sehir && <span className="text-slate-400 font-normal"> · {link.sehir}</span>}
                      </div>
                      {(link.kiraBaslangic || link.kiraBitis) && (
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{kiraDonemiEs(link.kiraBaslangic, link.kiraBitis)}</span>
                        </div>
                      )}
                    </div>
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
