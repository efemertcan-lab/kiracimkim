// ── Tipler ──────────────────────────────────────────────────────────────────

export interface ReferansLinki {
  id: string;
  etiket: string;   // "Link 1", "Link 2" …
  olusturulma: string; // ISO date
  kullaniciId?: string; // linki oluşturan kullanıcı
  evsahibiAdi?: string; // bu linkin gönderileceği ev sahibinin adı
  sehir?: string;       // isteğe bağlı şehir/ilçe
}

export interface ReferansFormu {
  linkId: string;
  kiraOdemesi: 0 | 1 | 2;  // 0 = iyi, 2 = kötü
  evDurumu: 0 | 1 | 2;
  iletisim: 0 | 1 | 2;
  tasinma: 0 | 1 | 2;
  gonderilenAt: string;
}

export type RiskSeviyesi = "dusuk" | "orta" | "yuksek";

export interface GoruntulenenLink {
  linkId: string;
  goruntulenmeTarihi: string;
  referansGonderildi: boolean;
}

export interface EvsahibiKarari {
  linkId: string;
  karar: "verir" | "vermez";
  tarih: string;
}

// ── LocalStorage anahtarları ─────────────────────────────────────────────────

const LINKS_KEY = "kcm_links";
const REFS_KEY = "kcm_refs";
const GORUNTULENDI_KEY = "kcm_goruntulendi";
const KARARLAR_KEY = "kcm_kararlar";
const KULLANICILAR_KEY = "kcm_kullanicilar";
const OTURUM_KEY = "kcm_oturum";

// ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────

function safe<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Linkler ──────────────────────────────────────────────────────────────────

// Tüm kullanıcıların linkleri — sadece dahili kullanım
function tumLinkleriGetir(): ReferansLinki[] {
  return safe<ReferansLinki[]>(LINKS_KEY, []);
}

// Sadece oturumdaki kiracının linkleri
export function linkleriGetir(): ReferansLinki[] {
  const oturum = oturumuGetir();
  if (!oturum) return [];
  return tumLinkleriGetir().filter((l) => l.kullaniciId === oturum.kullaniciId);
}

export function linkEkle(bilgi?: { evsahibiAdi?: string; sehir?: string }): ReferansLinki {
  const tumLinkler = tumLinkleriGetir();
  const oturum = oturumuGetir();
  const kullanicininSayisi = oturum
    ? tumLinkler.filter((l) => l.kullaniciId === oturum.kullaniciId).length
    : tumLinkler.length;
  const yeni: ReferansLinki = {
    id: Math.random().toString(36).slice(2, 10),
    etiket: `Link ${kullanicininSayisi + 1}`,
    olusturulma: new Date().toISOString(),
    kullaniciId: oturum?.kullaniciId,
    evsahibiAdi: bilgi?.evsahibiAdi,
    sehir: bilgi?.sehir,
  };
  save(LINKS_KEY, [yeni, ...tumLinkler]); // global diziye ekle
  return yeni;
}

// Sahiplik kontrolü için global dizide ara
export function linkSahibiKim(linkId: string): string | null {
  return tumLinkleriGetir().find((l) => l.id === linkId)?.kullaniciId ?? null;
}

export function linkGecerliMi(id: string): boolean {
  return tumLinkleriGetir().some((l) => l.id === id);
}

// ── Referanslar ───────────────────────────────────────────────────────────────

export function tumReferanslariGetir(): Record<string, ReferansFormu[]> {
  return safe<Record<string, ReferansFormu[]>>(REFS_KEY, {});
}

export function linkReferanslari(linkId: string): ReferansFormu[] {
  return tumReferanslariGetir()[linkId] ?? [];
}

export function referansEkle(form: ReferansFormu) {
  const hepsi = tumReferanslariGetir();
  const mevcut = hepsi[form.linkId] ?? [];
  save(REFS_KEY, { ...hepsi, [form.linkId]: [...mevcut, form] });
}

// ── Ev sahibi: görüntülenen linkler (kullanıcıya özel) ───────────────────────

function goruntulenenKey(): string {
  const oturum = oturumuGetir();
  return oturum ? `${GORUNTULENDI_KEY}_${oturum.kullaniciId}` : GORUNTULENDI_KEY;
}

export function goruntulenenLinkleri(): GoruntulenenLink[] {
  return safe<GoruntulenenLink[]>(goruntulenenKey(), []);
}

export function linkGoruntule(linkId: string) {
  const key = goruntulenenKey();
  const mevcut = safe<GoruntulenenLink[]>(key, []);
  if (!mevcut.some((g) => g.linkId === linkId)) {
    save(key, [
      { linkId, goruntulenmeTarihi: new Date().toISOString(), referansGonderildi: false },
      ...mevcut,
    ]);
  }
}

export function referansGonderildiIsaretle(linkId: string) {
  const key = goruntulenenKey();
  const mevcut = safe<GoruntulenenLink[]>(key, []);
  save(key, mevcut.map((g) => (g.linkId === linkId ? { ...g, referansGonderildi: true } : g)));
}

// ── Ev sahibi: kararlar (kullanıcıya özel) ───────────────────────────────────

function kararlarKey(): string {
  const oturum = oturumuGetir();
  return oturum ? `${KARARLAR_KEY}_${oturum.kullaniciId}` : KARARLAR_KEY;
}

export function kararlar(): EvsahibiKarari[] {
  return safe<EvsahibiKarari[]>(kararlarKey(), []);
}

export function linkKarari(linkId: string): EvsahibiKarari | null {
  return kararlar().find((k) => k.linkId === linkId) ?? null;
}

export function kararEkle(linkId: string, karar: "verir" | "vermez") {
  const key = kararlarKey();
  const mevcut = safe<EvsahibiKarari[]>(key, []);
  const yeni: EvsahibiKarari = { linkId, karar, tarih: new Date().toISOString() };
  const guncellendi = mevcut.some((k) => k.linkId === linkId)
    ? mevcut.map((k) => (k.linkId === linkId ? yeni : k))
    : [yeni, ...mevcut];
  save(key, guncellendi);
}

// ── Risk hesaplama ────────────────────────────────────────────────────────────

export function riskHesapla(referanslar: ReferansFormu[]): RiskSeviyesi | null {
  if (referanslar.length === 0) return null;

  const toplam = referanslar.reduce(
    (acc, r) => acc + r.kiraOdemesi + r.evDurumu + r.iletisim + r.tasinma,
    0
  );
  const ort = toplam / (referanslar.length * 4); // 0–2 arası

  if (ort < 0.67) return "dusuk";
  if (ort < 1.34) return "orta";
  return "yuksek";
}

// ── Kullanıcı yönetimi ────────────────────────────────────────────────────────

export interface Kullanici {
  id: string;
  adSoyad: string;
  email: string;
  sifre: string;
  telefon: string;
  rol: "kiraci" | "evsahibi";
}

export interface Oturum {
  kullaniciId: string;
  adSoyad: string;
  email: string;
  rol: "kiraci" | "evsahibi";
}

export function kullaniciKaydet(
  data: Omit<Kullanici, "id">
): { basarili: boolean; hata?: string } {
  const kullanicilar = safe<Kullanici[]>(KULLANICILAR_KEY, []);
  if (kullanicilar.some((k) => k.email.toLowerCase() === data.email.toLowerCase())) {
    return { basarili: false, hata: "Bu e-posta adresiyle zaten bir hesap var." };
  }
  const yeni: Kullanici = { id: Math.random().toString(36).slice(2, 10), ...data };
  save(KULLANICILAR_KEY, [...kullanicilar, yeni]);
  return { basarili: true };
}

export function kullaniciGiris(email: string, sifre: string): Kullanici | null {
  const kullanicilar = safe<Kullanici[]>(KULLANICILAR_KEY, []);
  return (
    kullanicilar.find(
      (k) => k.email.toLowerCase() === email.toLowerCase() && k.sifre === sifre
    ) ?? null
  );
}

export function oturumuGetir(): Oturum | null {
  return safe<Oturum | null>(OTURUM_KEY, null);
}

export function oturumuKaydet(kullanici: Kullanici) {
  const oturum: Oturum = {
    kullaniciId: kullanici.id,
    adSoyad: kullanici.adSoyad,
    email: kullanici.email,
    rol: kullanici.rol,
  };
  save(OTURUM_KEY, oturum);
}

export function oturumuSil() {
  localStorage.removeItem(OTURUM_KEY);
}

export function kullaniciGetir(id: string): Kullanici | null {
  return safe<Kullanici[]>(KULLANICILAR_KEY, []).find((k) => k.id === id) ?? null;
}

// ── Özet link (tüm referanslar) ───────────────────────────────────────────────

export interface OzetToken {
  token: string;
  kullaniciId: string;
  olusturulma: string;
}

const OZET_TOKENLAR_KEY = "kcm_ozet_tokenlar";

export function ozetTokenOlustur(kullaniciId: string): string {
  const tokenlar = safe<OzetToken[]>(OZET_TOKENLAR_KEY, []);
  const mevcut = tokenlar.find((t) => t.kullaniciId === kullaniciId);
  if (mevcut) return mevcut.token;
  const token = Math.random().toString(36).slice(2, 14);
  save(OZET_TOKENLAR_KEY, [
    ...tokenlar,
    { token, kullaniciId, olusturulma: new Date().toISOString() },
  ]);
  return token;
}

export function ozetTokendenKullaniciId(token: string): string | null {
  return (
    safe<OzetToken[]>(OZET_TOKENLAR_KEY, []).find((t) => t.token === token)
      ?.kullaniciId ?? null
  );
}

export function kullanicininTumLinkleri(kullaniciId: string): ReferansLinki[] {
  return tumLinkleriGetir().filter((l) => l.kullaniciId === kullaniciId);
}

// ── Görüntülenen özetler (ev sahibi, kullanıcıya özel) ────────────────────────

export interface GoruntulenenOzet {
  kullaniciId: string;
  goruntulenmeTarihi: string;
}

const GORUNTULENEN_OZETLER_KEY = "kcm_goruntulenen_ozetler";

function goruntulenenOzetKey(): string {
  const oturum = oturumuGetir();
  return oturum
    ? `${GORUNTULENEN_OZETLER_KEY}_${oturum.kullaniciId}`
    : GORUNTULENEN_OZETLER_KEY;
}

export function goruntulenenOzetleri(): GoruntulenenOzet[] {
  return safe<GoruntulenenOzet[]>(goruntulenenOzetKey(), []);
}

export function ozetGoruntule(kullaniciId: string) {
  const key = goruntulenenOzetKey();
  const mevcut = safe<GoruntulenenOzet[]>(key, []);
  // Her görüntülemede tarihi güncelle
  const filtrelenmis = mevcut.filter((o) => o.kullaniciId !== kullaniciId);
  save(key, [
    { kullaniciId, goruntulenmeTarihi: new Date().toISOString() },
    ...filtrelenmis,
  ]);
}

// ── Rapor token yönetimi ──────────────────────────────────────────────────────

export interface RaporToken {
  token: string;
  linkId: string;
  olusturulma: string;
}

const RAPOR_TOKENLAR_KEY = "kcm_rapor_tokenlar";

export function raporTokenOlustur(linkId: string): string {
  const tokenlar = safe<RaporToken[]>(RAPOR_TOKENLAR_KEY, []);
  const mevcut = tokenlar.find((t) => t.linkId === linkId);
  if (mevcut) return mevcut.token;
  const token = Math.random().toString(36).slice(2, 12);
  save(RAPOR_TOKENLAR_KEY, [
    ...tokenlar,
    { token, linkId, olusturulma: new Date().toISOString() },
  ]);
  return token;
}

export function tokendenLinkId(token: string): string | null {
  return (
    safe<RaporToken[]>(RAPOR_TOKENLAR_KEY, []).find((t) => t.token === token)
      ?.linkId ?? null
  );
}

export function riskBilgisi(seviye: RiskSeviyesi | null) {
  switch (seviye) {
    case "dusuk":
      return {
        etiket: "Düşük Risk",
        renk: "emerald",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        badge: "bg-emerald-100 text-emerald-700",
        dot: "bg-emerald-500",
        aciklama:
          "Kiracı, referanslarına göre güvenilir ve sorumluluk sahibidir. Ödemeleri zamanında yapmış, evi iyi durumda teslim etmiş.",
      };
    case "orta":
      return {
        etiket: "Orta Risk",
        renk: "amber",
        bg: "bg-amber-50",
        border: "border-amber-200",
        badge: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
        aciklama:
          "Kiracı genel olarak kabul edilebilir düzeyde. Bazı küçük sorunlar yaşanmış ancak ciddi bir olumsuzluk raporlanmamış.",
      };
    case "yuksek":
      return {
        etiket: "Yüksek Risk",
        renk: "red",
        bg: "bg-red-50",
        border: "border-red-200",
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
        aciklama:
          "Referanslar çeşitli sorunlara işaret ediyor. Ödeme gecikmeleri veya mülk hasarı gibi ciddi problemler raporlanmış.",
      };
    default:
      return {
        etiket: "Henüz Değerlendirme Yok",
        renk: "gray",
        bg: "bg-gray-50",
        border: "border-gray-200",
        badge: "bg-gray-100 text-gray-600",
        dot: "bg-gray-400",
        aciklama:
          "Henüz hiç referans gelmedi. Linkinizi eski ev sahiplerinizle paylaşarak değerlendirme toplayın.",
      };
  }
}
