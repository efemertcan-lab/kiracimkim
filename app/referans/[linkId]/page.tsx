"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ChevronRight, AlertCircle } from "lucide-react";
import { referansEkle, linkGoruntule, referansGonderildiIsaretle, linkSahibiKim, oturumuGetir, type ReferansFormu } from "@/lib/store";

// ── Sorular ───────────────────────────────────────────────────────────────────

const SORULAR = [
  {
    alan: "kiraOdemesi" as const,
    baslik: "Kira Ödemesi",
    aciklama: "Kiracı kiraya ilişkin ödemelerini nasıl yaptı?",
    emoji: "💰",
    secenekler: [
      { deger: 0 as const, etiket: "Zamanında", aciklama: "Her ay düzenli ve zamanında ödedi", renk: "emerald" },
      { deger: 1 as const, etiket: "Arada Geç", aciklama: "Zaman zaman gecikmeler yaşandı", renk: "amber" },
      { deger: 2 as const, etiket: "Sık Sık Geç", aciklama: "Ödemelerde sürekli gecikme oldu", renk: "red" },
    ],
  },
  {
    alan: "evDurumu" as const,
    baslik: "Ev Durumu",
    aciklama: "Kiracı evi nasıl teslim etti?",
    emoji: "🏠",
    secenekler: [
      { deger: 0 as const, etiket: "Hasarsız Teslim", aciklama: "Ev teslim alındığı gibi, hasarsız teslim edildi", renk: "emerald" },
      { deger: 1 as const, etiket: "Küçük Sorunlar", aciklama: "Küçük çaplı hasarlar veya eksiklikler vardı", renk: "amber" },
      { deger: 2 as const, etiket: "Hasarlı Teslim", aciklama: "Önemli hasar veya büyük sorunlar mevcuttu", renk: "red" },
    ],
  },
  {
    alan: "iletisim" as const,
    baslik: "İletişim",
    aciklama: "Kiracıyla iletişim kurmak nasıldı?",
    emoji: "📞",
    secenekler: [
      { deger: 0 as const, etiket: "Kolay Ulaşılır", aciklama: "Her zaman ulaşılabilir ve duyarlıydı", renk: "emerald" },
      { deger: 1 as const, etiket: "Karışık", aciklama: "Bazen ulaşmak zor oldu ama genel iletişim iyiydi", renk: "amber" },
      { deger: 2 as const, etiket: "Ulaşmak Zor", aciklama: "Ulaşmak genellikle çok zordu", renk: "red" },
    ],
  },
  {
    alan: "tasinma" as const,
    baslik: "Taşınma Süreci",
    aciklama: "Taşınma ve ayrılış süreci nasıl geçti?",
    emoji: "📦",
    secenekler: [
      { deger: 0 as const, etiket: "Sorunsuz", aciklama: "Her şey planlandığı gibi ve sorunsuz gerçekleşti", renk: "emerald" },
      { deger: 1 as const, etiket: "Ortalama", aciklama: "Küçük aksaklıklar yaşandı ama genel iyi geçti", renk: "amber" },
      { deger: 2 as const, etiket: "Sorunlu", aciklama: "Ciddi sorunlar veya anlaşmazlıklar yaşandı", renk: "red" },
    ],
  },
] as const;

type AlanAdi = (typeof SORULAR)[number]["alan"];
type Deger = 0 | 1 | 2;

const RENK_SINIFLAR: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", dot: "bg-emerald-500" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-700",   dot: "bg-amber-500"   },
  red:     { bg: "bg-red-50",     border: "border-red-300",     text: "text-red-700",      dot: "bg-red-500"     },
};

// ── Bileşen ────────────────────────────────────────────────────────────────────

export default function ReferansFormuSayfasi({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = use(params);
  const router = useRouter();

  const [kendiLinki, setKendiLinki] = useState(false);
  const [cevaplar, setCevaplar] = useState<Partial<Record<AlanAdi, Deger>>>({});
  const [hatalar, setHatalar] = useState<Partial<Record<AlanAdi, boolean>>>({});
  const [gonderiliyor, setGonderiliyor] = useState(false);

  useEffect(() => {
    const sahip = linkSahibiKim(linkId);
    const oturum = oturumuGetir();
    if (sahip && oturum && sahip === oturum.kullaniciId) {
      setKendiLinki(true);
      return;
    }
    linkGoruntule(linkId);
  }, [linkId]);

  function sec(alan: AlanAdi, deger: Deger) {
    setCevaplar((prev) => ({ ...prev, [alan]: deger }));
    if (hatalar[alan]) setHatalar((prev) => ({ ...prev, [alan]: false }));
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();

    // Validasyon
    const yeniHatalar: Partial<Record<AlanAdi, boolean>> = {};
    let gecersiz = false;
    for (const soru of SORULAR) {
      if (cevaplar[soru.alan] === undefined) {
        yeniHatalar[soru.alan] = true;
        gecersiz = true;
      }
    }
    if (gecersiz) {
      setHatalar(yeniHatalar);
      document.querySelector("[data-hata]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setGonderiliyor(true);
    await new Promise((r) => setTimeout(r, 600));

    const form: ReferansFormu = {
      linkId,
      kiraOdemesi: cevaplar.kiraOdemesi as Deger,
      evDurumu: cevaplar.evDurumu as Deger,
      iletisim: cevaplar.iletisim as Deger,
      tasinma: cevaplar.tasinma as Deger,
      gonderilenAt: new Date().toISOString(),
    };
    referansEkle(form);
    referansGonderildiIsaretle(linkId);
    router.push(`/referans/${linkId}/tesekkurler`);
  }

  const doldurulan = Object.keys(cevaplar).length;
  const yuzde = Math.round((doldurulan / SORULAR.length) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center px-4 py-12 relative overflow-hidden">
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
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">

        {/* Kendi linkini açma uyarısı */}
        {kendiLinki && (
          <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 mb-2">
                Bu formu dolduramazsınız
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Bu referans linki size ait. Formu yalnızca sizi daha önce kiracı olarak tanıyan kişiler doldurabilir. Linki eski ev sahiplerinizle paylaşın.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/30"
            >
              Panelime Dön
            </button>
          </div>
        )}

        {/* Üst banner */}
        {!kendiLinki && <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 pt-8 pb-10">
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs text-white font-medium mb-4">
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
            Kiracı Referans Formu
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-1">
            Kiracıyı Değerlendirin
          </h1>
          <p className="text-indigo-100 text-sm leading-relaxed">
            Dürüst değerlendirmeniz hem kiracılara hem ev sahiplerine güvenli bir platform oluşturmanıza yardımcı olur.
          </p>

          {/* İlerleme */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
              <span>{doldurulan}/{SORULAR.length} soru cevaplandı</span>
              <span>%{yuzde}</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${yuzde}%` }}
              />
            </div>
          </div>
        </div>}

        {/* Sorular */}
        {!kendiLinki && <form onSubmit={gonder} className="px-8 py-8 space-y-8 -mt-4">
          {SORULAR.map((soru, idx) => (
            <div
              key={soru.alan}
              data-hata={hatalar[soru.alan] ? true : undefined}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base flex-shrink-0">
                  {soru.emoji}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{soru.baslik}</h3>
                  <p className="text-xs text-gray-400">{soru.aciklama}</p>
                </div>
                <span className="ml-auto text-xs text-gray-300 font-mono">{idx + 1}/{SORULAR.length}</span>
              </div>

              {hatalar[soru.alan] && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Bu soruyu cevaplamanız gerekiyor
                </div>
              )}

              <div className="space-y-2">
                {soru.secenekler.map((s) => {
                  const secili = cevaplar[soru.alan] === s.deger;
                  const r = RENK_SINIFLAR[s.renk];
                  return (
                    <button
                      key={s.deger}
                      type="button"
                      onClick={() => sec(soru.alan, s.deger)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                        secili
                          ? `${r.bg} ${r.border}`
                          : "border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          secili ? `${r.border} bg-white` : "border-gray-300"
                        }`}
                      >
                        {secili && <div className={`w-2 h-2 rounded-full ${r.dot}`} />}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${secili ? r.text : "text-gray-700"}`}>
                          {s.etiket}
                        </div>
                        <div className="text-xs text-gray-400">{s.aciklama}</div>
                      </div>
                      {secili && (
                        <div className="ml-auto">
                          <ChevronRight className={`w-4 h-4 ${r.text}`} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={gonderiliyor}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl text-base transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:translate-y-0"
          >
            {gonderiliyor ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gönderiliyor…
              </>
            ) : (
              "Değerlendirmeyi Gönder"
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Değerlendirmeniz anonim tutulabilir. Kiracı adınızı göremez.
          </p>
        </form>}
      </div>
    </main>
  );
}
