/**
 * Sokratik AI Tutor Koruma Katmanı (Guard)
 * 
 * Kurallar:
 * 1. Yanıtta '?' yoksa geçersiz.
 * 2. Yanıtta bir seçenek harfi (A veya B, tek başına, büyük harf veya Türkçe ekli) ile
 *    doğruluk hükmü kelimeleri (doğru, yanlış, en iyi, daha iyi, tercih, seç, kötü)
 *    aynı cümlede geçiyorsa geçersiz.
 */

export interface GuardResult {
  ok: boolean;
  reason?: string;
}

const OPTION_PATTERN = /(?:\b[AB]\b|\b[AB]['’][a-zA-ZçğıöşüÇĞİÖŞÜ]+|\b[AB]\s*(?:seçene|şık|doğru|yanlış))/u;

const JUDGMENT_PATTERN = /(?:doğru|yanlış|en\s+iyi|daha\s+iyi|tercih|seç(?:im|enek|il|me|mek|tin|sen|meli)?|kötü)/iu;

export function checkGuard(reply: string): GuardResult {
  if (!reply || typeof reply !== 'string') {
    return { ok: false, reason: 'Yanıt boş veya metin değil.' };
  }

  // Kural 1: Yanıtta '?' yoksa yanıt atılır
  if (!reply.includes('?')) {
    return { ok: false, reason: 'Yanıtta soru işareti bulunmuyor.' };
  }

  // Cümlelere ayır: ., !, ? ve satır sonları
  const sentences = reply.split(/(?<=[.!?\n])\s+/);

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    const hasOption = OPTION_PATTERN.test(trimmed);
    const hasJudgment = JUDGMENT_PATTERN.test(trimmed);

    if (hasOption && hasJudgment) {
      return {
        ok: false,
        reason: `Cümlede seçenek harfi ve doğruluk hükmü birlikte yer alıyor: "${trimmed}"`,
      };
    }
  }

  return { ok: true };
}
