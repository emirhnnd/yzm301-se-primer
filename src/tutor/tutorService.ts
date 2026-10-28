import { checkGuard } from './guard';
import { DECISIONS } from '../data/gameContent';
import { DecisionId, TutorMessage } from '../types/game';

/**
 * Ask AI Tutor.
 *
 * Client communicates with the server via /api/tutor.
 * The server handles all Gemini API calls using @google/genai and process.env.GEMINI_API_KEY.
 *
 * Checks:
 * 1. URL parameter ?tutor=mock
 * 2. Sanitize user input (replace 11-digit sequences with [KİMLİK])
 * 3. 10-second timeout
 * 4. Passes through checkGuard; falls back to static hint question if guard fails
 * 5. Returns friendly fallback message on timeout/API error, logging full details to console.
 */
export async function askTutor(
  history: TutorMessage[],
  userMessage: string,
  decisionId: DecisionId
): Promise<string> {
  // Test Modu: URL'de ?tutor=mock varsa mock yanıt dön
  if (typeof window !== 'undefined' && window.location.search.includes('tutor=mock')) {
    return 'Cevabı ben söyleyemem ama sana sorayım: Bu durumda hangi riski önce kapatmak istersin?';
  }

  // Girdi temizleme: 11 haneli sayı dizileri [KİMLİK] ile değiştirilir
  const cleanedMessage = userMessage.replace(/\b\d{11}\b/g, '[KİMLİK]').replace(/\d{11}/g, '[KİMLİK]');

  // Statik ipucu sorusu (guard başarısız olursa yerine kullanılacak)
  const fallbackHint = DECISIONS[decisionId]?.hint || 'Bu durumda hangi riski önce kapatmak istersin?';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort(new Error('Tutor request timed out (35s limit exceeded)'));
    }, 35000);

    const response = await fetch('/api/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: history.map((m) => ({ role: m.sender === 'player' ? 'user' : 'model', text: m.text })),
        userMessage: cleanedMessage,
        decisionId,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `HTTP error ${response.status}`);
      (error as any).status = response.status;
      (error as any).errorDetails = errorData.details || errorData;
      throw error;
    }

    const data = await response.json();
    const rawReply = data?.reply || '';

    // Koruma katmanı (checkGuard)
    const guard = checkGuard(rawReply);
    if (!guard.ok) {
      // Kural ihlal edildi, yanıt atılır ve statik ipucu sorusu gösterilir
      return `(Çevrimdışı ipucu) ${fallbackHint}`;
    }

    return rawReply;
  } catch (err: any) {
    const isAbort = err?.name === 'AbortError' || err?.message?.includes('aborted');
    // Add console.error with full error (message, status, details) so cause is visible in console
    console.error('Gemini call in askTutor failed:', err);
    console.error('Error message:', isAbort ? 'Tutor request timed out' : err?.message);
    console.error('Error status:', err?.status);
    console.error('Error details:', err?.errorDetails || err);

    return `(Çevrimdışı ipucu) ${fallbackHint}`;
  }
}
