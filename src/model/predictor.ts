/**
 * Model çıkarımı (onnxruntime-web, tarayıcıda). Sözleşme: model.onnx girdi `input` float32 [n,f],
 * çıktı `probabilities` [n,c]; özellik sırası config.json → features.
 *
 * Model dosyası bulunamazsa ya da yüklenemezse oyun normal çalışır, tutor kendiliğinden konuşmaz.
 * Test kancası: ?p_test=0.9 verilirse model yerine bu olasılık kullanılır (Cypress KÖ-7/KÖ-8 için).
 */
import { OZELLIK_ADLARI, VERI_MODU } from '../telemetry/collector';
import type { Ozellikler } from '../telemetry/collector';

const qs = new URLSearchParams(window.location.search);
const SAYFA = new URL('./', document.baseURI).href;
const MODEL_URL = qs.get('model_url') || SAYFA + 'model/model.onnx';
const CONFIG_URL = qs.get('config_url') || SAYFA + 'model/config.json';
const P_TEST = qs.get('p_test');

/** Veri toplama modunda model KAPALI: model müdahale ederse toplanan davranış değişir (geri besleme). */
export const MODEL_AKTIF = !VERI_MODU && qs.get('model') !== '0';

interface Yuklu {
  oturum: any;
  ort: any;
  karar_esigi: number;
  sirali_ozellikler: string[];
  riskli_indeks: number;
}

let yuk: Promise<Yuklu> | null = null;

function yukle(): Promise<Yuklu> {
  if (!yuk) {
    yuk = (async () => {
      const ort: any = await import(/* @vite-ignore */ SAYFA + 'ort/ort.wasm.min.mjs');
      ort.env.wasm.wasmPaths = SAYFA + 'ort/';
      ort.env.wasm.numThreads = 1; // GitHub Pages'te SharedArrayBuffer yok
      const [cfgYanit, modelYanit] = await Promise.all([fetch(CONFIG_URL), fetch(MODEL_URL)]);
      if (!cfgYanit.ok || !modelYanit.ok) throw new Error('model dosyası bulunamadı');
      const cfg = await cfgYanit.json();
      const oturum = await ort.InferenceSession.create(new Uint8Array(await modelYanit.arrayBuffer()));
      const siniflar: string[] = cfg.classes.map(String);
      return {
        oturum,
        ort,
        karar_esigi: Number(cfg.karar_esigi ?? 0.5),
        sirali_ozellikler: cfg.features.map((f: any) => f.name),
        riskli_indeks: Math.max(0, siniflar.indexOf('1')),
      };
    })();
    yuk.catch(() => {
      yuk = null; // sonraki denemede yeniden dene
    });
  }
  return yuk;
}

/** Ham girdi vektöründen [p_guvenli, p_riskli] (parite sayfası ve testler için). */
export async function olasiliklar(girdi: number[]): Promise<number[]> {
  const m = await yukle();
  const tensor = new m.ort.Tensor('float32', Float32Array.from(girdi), [1, girdi.length]);
  const sonuc = await m.oturum.run({ input: tensor });
  return Array.from(sonuc.probabilities.data as Float32Array).map(Number);
}

export async function kararEsigi(): Promise<number> {
  if (P_TEST !== null) return 0.5;
  return (await yukle()).karar_esigi;
}

/** Bir kararın özelliklerinden riskli seçim olasılığı. */
export async function olasilikRiskli(f: Ozellikler): Promise<number> {
  if (P_TEST !== null) return Number(P_TEST);
  const m = await yukle();
  const girdi = m.sirali_ozellikler.map((ad) => Number((f as any)[ad]));
  const p = await olasiliklar(girdi);
  return p[m.riskli_indeks];
}

export { OZELLIK_ADLARI };
