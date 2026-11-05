/**
 * Davranış sinyali toplayıcı (The Primer v2, spec.md bölüm 11).
 *
 * Gizlilik: Her şey bellekte tutulur. Hiçbir şey sunucuya gönderilmez, tarayıcıya
 * kaydedilmez (localStorage/çerez yok). Ad, kimlik, konum, tutor'a yazılan metin
 * toplanmaz; tutor için sadece mesaj SAYISI tutulur. Oturum kimliği rastgele üretilir.
 */
import type { DecisionId, Level, OptionId } from '../types/game';

export interface Ozellikler {
  seviye: number; // 0 yeni, 1 biraz, 2 deneyimli
  karar_no: number; // 1..3
  ilk_etkilesim_gecikme_sn: number; // 0..8
  ipucu_kullanildi: number; // 0/1
  tutor_mesaj_sayisi: number;
  sekme_terk_sayisi: number;
  onceki_panel_okuma_sn: number; // 0..120
  onceki_riskli_sayisi: number;
}

export interface VeriSatiri extends Ozellikler {
  oturum_id: string;
  grup: string;
  kaynak: 'gercek';
  rol: string;
  hedef: string;
  erken_karar: number; // 1: oyuncu 8. saniyeden önce seçti (özellikler seçim anında alındı)
  zaman_asimi: number; // 1: seçimi oyuncu değil süre bitimi yaptı (etiket davranış değil)
  karar_suresi_sn: number;
  secim: OptionId;
  riskli_secim: number; // 1 = B
}

export const OZELLIK_ADLARI: (keyof Ozellikler)[] = [
  'seviye',
  'karar_no',
  'ilk_etkilesim_gecikme_sn',
  'ipucu_kullanildi',
  'tutor_mesaj_sayisi',
  'sekme_terk_sayisi',
  'onceki_panel_okuma_sn',
  'onceki_riskli_sayisi',
];

const SUTUNLAR: (keyof VeriSatiri)[] = [
  'oturum_id',
  'grup',
  'kaynak',
  'karar_no',
  'seviye',
  'rol',
  'hedef',
  'ilk_etkilesim_gecikme_sn',
  'ipucu_kullanildi',
  'tutor_mesaj_sayisi',
  'sekme_terk_sayisi',
  'onceki_panel_okuma_sn',
  'onceki_riskli_sayisi',
  'erken_karar',
  'zaman_asimi',
  'karar_suresi_sn',
  'secim',
  'riskli_secim',
];

const TAHMIN_ANI_SN = 8;
const OKUMA_UST_SN = 120;
const SCROLL_TOLERANS_SN = 0.5; // karar açılırken programatik kaydırma etkileşim sayılmasın

const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
export const VERI_MODU = qs.get('veri') === '1';
const GRUP = (qs.get('grup') || 'GX').replace(/[^A-Za-z0-9]/g, '').slice(0, 8) || 'GX';

const SEVIYE_KODU: Record<Level, number> = { yeni: 0, biraz: 1, deneyimli: 2 };

type SekizinciSaniyeDinleyici = (f: Ozellikler) => void;

interface Karar {
  no: number;
  t0: number;
  ilk: number | null;
  ipucu: 0 | 1;
  tutor: number;
  snapshot: Ozellikler | null;
  erken: boolean;
  zamanlayici: ReturnType<typeof setTimeout> | null;
  sonucAcildi: number | null;
  secim: OptionId | null;
}

let oturumId = rastgeleId();
let meta = { seviye: 0, rol: '', hedef: '' };
let sekmeTerk = 0;
let oncekiOkuma = 0;
let oncekiRiskli = 0;
let satirlar: VeriSatiri[] = [];
let cur: Karar | null = null;
const dinleyiciler: SekizinciSaniyeDinleyici[] = [];

function rastgeleId(): string {
  const b = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < b.length; i++) b[i] = Math.floor(Math.random() * 256);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
const r2 = (x: number) => Math.round(x * 100) / 100;

function ozellikAl(): Ozellikler {
  const k = cur!;
  const gecen = (now() - k.t0) / 1000;
  const gecikme = k.ilk !== null ? k.ilk : Math.min(TAHMIN_ANI_SN, gecen);
  return {
    seviye: meta.seviye,
    karar_no: k.no,
    ilk_etkilesim_gecikme_sn: r2(Math.min(TAHMIN_ANI_SN, gecikme)),
    ipucu_kullanildi: k.ipucu,
    tutor_mesaj_sayisi: k.tutor,
    sekme_terk_sayisi: sekmeTerk,
    onceki_panel_okuma_sn: r2(oncekiOkuma),
    onceki_riskli_sayisi: oncekiRiskli,
  };
}

function etkilesim(scroll: boolean) {
  if (!cur || cur.ilk !== null || cur.secim !== null) return;
  const gecen = (now() - cur.t0) / 1000;
  if (scroll && gecen < SCROLL_TOLERANS_SN) return;
  cur.ilk = gecen;
}

if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', () => etkilesim(false), true);
  window.addEventListener('touchstart', () => etkilesim(false), { capture: true, passive: true });
  window.addEventListener('keydown', () => etkilesim(false), true);
  window.addEventListener('scroll', () => etkilesim(true), { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) sekmeTerk += 1;
  });
}

/** Yeni oyun oturumu başlar (rastgele kimlik, sayaçlar sıfır). */
export function oturumBaslat(level: Level, rol: string, hedef: string) {
  if (cur?.zamanlayici) clearTimeout(cur.zamanlayici);
  cur = null;
  oturumId = rastgeleId();
  meta = { seviye: SEVIYE_KODU[level], rol, hedef };
  sekmeTerk = 0;
  oncekiOkuma = 0;
  oncekiRiskli = 0;
  satirlar = [];
}

/** Bir karar ekranı açıldı. 8. saniyede özellikler alınır ve dinleyicilere bildirilir. */
export function kararBasla(id: DecisionId) {
  if (cur?.zamanlayici) clearTimeout(cur.zamanlayici);
  const k: Karar = {
    no: Number(id.slice(1)),
    t0: now(),
    ilk: null,
    ipucu: 0,
    tutor: 0,
    snapshot: null,
    erken: false,
    zamanlayici: null,
    sonucAcildi: null,
    secim: null,
  };
  k.zamanlayici = setTimeout(() => {
    if (cur !== k || k.secim !== null) return;
    k.snapshot = ozellikAl();
    k.zamanlayici = null;
    const f = k.snapshot;
    dinleyiciler.forEach((d) => d(f));
  }, TAHMIN_ANI_SN * 1000);
  cur = k;
}

export function ipucuKullanildi() {
  if (cur) cur.ipucu = 1;
}

export function tutorMesajiGonderildi() {
  if (cur) cur.tutor += 1;
}

/** Oyuncu (ya da süre bitimi) seçimi yaptı. Satır oluşur. */
export function secimYapildi(secim: OptionId, zamanAsimi: boolean) {
  const k = cur;
  if (!k || k.secim !== null) return;
  if (k.zamanlayici) {
    clearTimeout(k.zamanlayici);
    k.zamanlayici = null;
  }
  if (!k.snapshot) {
    k.erken = true;
    k.snapshot = ozellikAl();
  }
  k.secim = secim;
  k.sonucAcildi = now();
  const f = k.snapshot;
  satirlar.push({
    ...f,
    oturum_id: oturumId,
    grup: GRUP,
    kaynak: 'gercek',
    rol: meta.rol,
    hedef: meta.hedef,
    erken_karar: k.erken ? 1 : 0,
    zaman_asimi: zamanAsimi ? 1 : 0,
    karar_suresi_sn: r2((now() - k.t0) / 1000),
    secim,
    riskli_secim: secim === 'B' ? 1 : 0,
  });
}

/** "Devam" basıldı: sonuç panelinde geçen süre ve önceki riskli sayısı güncellenir. */
export function devamEdildi() {
  const k = cur;
  if (!k || k.secim === null || k.sonucAcildi === null) return;
  oncekiOkuma = Math.min(OKUMA_UST_SN, (now() - k.sonucAcildi) / 1000);
  if (k.secim === 'B') oncekiRiskli += 1;
}

export function sekizinciSaniyeyeKayit(d: SekizinciSaniyeDinleyici): () => void {
  dinleyiciler.push(d);
  return () => {
    const i = dinleyiciler.indexOf(d);
    if (i >= 0) dinleyiciler.splice(i, 1);
  };
}

export function csvMetni(): string {
  const baslik = SUTUNLAR.join(',');
  const govde = satirlar.map((s) => SUTUNLAR.map((c) => String(s[c])).join(','));
  return [baslik, ...govde].join('\n');
}

export function satirSayisi(): number {
  return satirlar.length;
}
