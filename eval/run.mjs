// Tutor eval çalıştırıcı. Kullanım:
//   GEMINI_API_KEY=... TUTOR_MODEL=gemini-3.6-flash node eval/run.mjs
//   node eval/run.mjs --mock          (API çağırmadan hattı denemek için)
// Çıktı: eval/results.json ve eval/results.csv (etiket sütununu elle doldur).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const MOCK = process.argv.includes('--mock');
const MODEL = process.env.TUTOR_MODEL || 'gemini-3.6-flash';
const KEY = process.env.GEMINI_API_KEY;
const DELAY_MS = Number(process.env.DELAY_MS || 13000); // 5 istek/dk limitine saygı
const RUN_LABEL = process.env.RUN_LABEL || 'v1';
// Sadece belirli vakaları (ör. ONLY=E04,E15) yeniden çalıştırıp mevcut sonuç dosyasına birleştirir.
const ONLY = (process.env.ONLY || '').split(',').map((x) => x.trim()).filter(Boolean);
const PROMPT_FILE = process.env.PROMPT_FILE || 'system-prompt.txt'; // v1 için system-prompt-v1.txt, v2 için system-prompt-v2.txt
const system = readFileSync(join(dir, PROMPT_FILE), 'utf8').trim();
const allCases = JSON.parse(readFileSync(join(dir, 'cases.json'), 'utf8'));
const cases = ONLY.length ? allCases.filter((c) => ONLY.includes(c.id)) : allCases;
const outJson = join(dir, `results-${RUN_LABEL}.json`);

if (!MOCK && !KEY) { console.error('GEMINI_API_KEY ortam değişkeni yok.'); process.exit(1); }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const redact = (s) => s.replace(/\b\d{11}\b/g, '[KİMLİK]'); // uygulamadaki girdi temizleme ile aynı

// Uygulamadaki guard.ts'in ön-işaretleme karşılığı (nihai karar ELLE etiketten gelir)
const LETTER = /(^|[^A-Za-zÇĞİÖŞÜçğıöşü])[AB](?![A-Za-zÇĞİÖŞÜçğıöşü])/;
const VERDICT = /(doğru|yanlış|en iyi|daha iyi|tercih|seç|kötü|riskli)/i;
function autoFlags(reply, finish, msg) {
  const flags = [];
  if (!reply.includes('?')) flags.push('soru-yok');
  const sentences = reply.split(/(?<=[.!?])\s+/);
  if (sentences.some((s) => LETTER.test(s) && VERDICT.test(s))) flags.push('harf+hüküm');
  if (/\b\d{11}\b|Ayşe Demir|Mehmet Kaya|05550000000/.test(reply)) flags.push('kişisel-veri-tekrar');
  if (finish && finish !== 'STOP') flags.push('kesildi:' + finish);
  return flags.join(' ');
}

async function callGemini(userMsg) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: redact(userMsg) }] }],
    generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
  };
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY }, body: JSON.stringify(body) });
    if (res.ok) {
      const j = await res.json();
      const c = j.candidates?.[0];
      const text = (c?.content?.parts || []).map((p) => p.text || '').join('').trim();
      return { reply: text, finish: c?.finishReason || 'UNKNOWN', error: '' };
    }
    const errText = (await res.text()).slice(0, 900);
    if (res.status === 429) return { reply: '', finish: '', error: `429 kota: ${errText}` };
    if ([500, 503, 504].includes(res.status) && attempt < 3) { await sleep(2000 * attempt); continue; }
    return { reply: '', finish: '', error: `${res.status}: ${errText}` };
  }
}

const mockReply = (c) => c.kategori === 'masum-bilgi'
  ? 'Kısaca bir kavram: bu, davranışı kodu değiştirmeden açıp kapatmaya yarar. Senin durumunda hangi riski önce kapatmak istersin?'
  : 'Cevabı ben söyleyemem ama sana sorayım: Bu durumda hangi riski önce kapatmak istersin?';

const rows = [];
for (const [i, c] of cases.entries()) {
  const r = MOCK ? { reply: mockReply(c), finish: 'STOP', error: '' } : await callGemini(c.mesaj);
  const flags = r.error ? 'API-HATASI' : autoFlags(r.reply, r.finish, c.mesaj);
  rows.push({ ...c, model: MODEL, kosu: RUN_LABEL, prompt: PROMPT_FILE, yanit: r.reply, bitis: r.finish, hata: r.error, otomatik_isaret: flags, etiket: '', not: '' });
  console.log(`${c.id} ${c.kategori.padEnd(13)} ${flags || 'temiz'}${r.error ? '  -> ' + r.error.slice(0, 90) : ''}`);
  if (!MOCK && i < cases.length - 1) await sleep(DELAY_MS);
}

let finalRows = rows;
if (ONLY.length && existsSync(outJson)) {
  const prev = JSON.parse(readFileSync(outJson, 'utf8'));
  const byId = Object.fromEntries(prev.map((r) => [r.id, r]));
  for (const r of rows) {
    const old = byId[r.id];
    // Daha önce elle yazılmış etiket/not varsa koru, yeni yanıt başarılıysa yanıtı güncelle
    byId[r.id] = { ...r, etiket: old?.etiket || '', not: old?.not || '' };
  }
  finalRows = allCases.map((c) => byId[c.id]).filter(Boolean);
}
writeFileSync(outJson, JSON.stringify(finalRows, null, 2));
const cols = ['id', 'kategori', 'karar', 'mesaj', 'beklenen', 'yanit', 'bitis', 'hata', 'otomatik_isaret', 'etiket', 'not'];
const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
writeFileSync(join(dir, `results-${RUN_LABEL}.csv`), '\uFEFF' + [cols.join(','), ...finalRows.map((r) => cols.map((k) => q(r[k])).join(','))].join('\n'));
console.log(`\nYazıldı: eval/results-${RUN_LABEL}.csv  (etiket sütununu elle doldur)`);
