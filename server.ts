import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { TUTOR_SYSTEM_PROMPT } from './src/tutor/systemPrompt';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
      retryOptions: { attempts: 1 },
      timeout: 10000,
    },
  });
}

import { DECISIONS } from './src/data/gameContent';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Model priority list with Gemini 3.1 Flash Lite as primary
export const TUTOR_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
];

// AI Tutor API Endpoint
app.post('/api/tutor', async (req: Request, res: Response) => {
  try {
    const { history, userMessage, decisionId } = req.body;

    if (!userMessage || typeof userMessage !== 'string') {
      res.status(400).json({ error: 'userMessage is required' });
      return;
    }

    const decisionKey = (decisionId || 'k1') as 'k1' | 'k2' | 'k3';
    const staticHint = DECISIONS[decisionKey]?.hint || 'Bu durumda hangi riski önce kapatmak istersin?';

    if (!ai) {
      // In case API key is missing, respond with safe Socratic offline hint
      res.json({
        reply: `(Çevrimdışı ipucu) ${staticHint}`,
        model: 'offline-fallback',
      });
      return;
    }

    // Build chat contents or formatted prompt with history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item.text) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `[Aktif Karar: ${decisionId || 'k1'}] Öğrenci sorusu: "${userMessage}"`,
        },
      ],
    });

    let reply = '';
    let answeredModel = '';
    let finalFailureReason: any = null;

    for (let i = 0; i < TUTOR_MODELS.length; i++) {
      const model = TUTOR_MODELS[i];
      let modelSuccess = false;

      // Model configuration: for gemini-2.5-flash set thinkingBudget: 0 and maxOutputTokens 400
      const config: any = {
        systemInstruction: TUTOR_SYSTEM_PROMPT,
        maxOutputTokens: model === 'gemini-2.5-flash' ? 400 : 500,
      };
      if (model === 'gemini-2.5-flash') {
        config.thinkingConfig = { thinkingBudget: 0 };
      }

      // Retry the same model once after 1.5 s on 503/504 (UNAVAILABLE / DEADLINE_EXCEEDED) or timeout
      for (let attempt = 0; attempt <= 1; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config,
          });

          reply = response.text || '';
          answeredModel = model;
          console.log(`Model answered: ${answeredModel}`);
          modelSuccess = true;
          break;
        } catch (err: any) {
          finalFailureReason = err?.message || err;
          console.error(`Gemini call failed for model ${model} (attempt ${attempt + 1}/2):`, finalFailureReason);

          // 404 / NOT_FOUND (model no longer available): log it and move on immediately, without retry
          const isNotFound =
            err?.status === 404 ||
            err?.message?.includes('404') ||
            err?.message?.includes('NOT_FOUND');

          if (isNotFound) {
            console.log(`404 / NOT_FOUND on ${model}: model no longer available. Moving to next model immediately without retry.`);
            break;
          }

          // 429 / RESOURCE_EXHAUSTED: move to next model immediately (no retry)
          const isQuotaOrExhausted =
            err?.status === 429 ||
            err?.message?.includes('429') ||
            err?.message?.includes('RESOURCE_EXHAUSTED');

          if (isQuotaOrExhausted) {
            console.log(`429 / RESOURCE_EXHAUSTED on ${model}. Moving to next model immediately without retry.`);
            break;
          }

          // 503/504 (UNAVAILABLE / DEADLINE_EXCEEDED) or timeout: retry the same model once after 1.5 s
          const isUnavailableOrTimeout =
            err?.status === 503 ||
            err?.status === 504 ||
            err?.message?.includes('503') ||
            err?.message?.includes('504') ||
            err?.message?.includes('UNAVAILABLE') ||
            err?.message?.includes('DEADLINE_EXCEEDED') ||
            err?.message?.includes('Timeout') ||
            err?.message?.includes('timeout') ||
            err?.name === 'AbortError' ||
            err?.message?.includes('aborted');

          if (isUnavailableOrTimeout && attempt === 0) {
            console.log(`503/504 (UNAVAILABLE / DEADLINE_EXCEEDED) or timeout on ${model}. Retrying same model once after 1.5 s...`);
            await sleep(1500);
            continue;
          }

          // Otherwise, move to next model
          break;
        }
      }

      if (modelSuccess) {
        break;
      }
    }

    // Offline hint is kept only as the last resort if every model fails
    if (!answeredModel) {
      console.log('AI Tutor all models failed. Final failure reason:', finalFailureReason);
      reply = `(Çevrimdışı ipucu) ${staticHint}`;
    }

    res.json({ reply, model: answeredModel || 'offline-fallback' });
  } catch (error: any) {
    const decisionKey = (req.body?.decisionId || 'k1') as 'k1' | 'k2' | 'k3';
    const staticHint = DECISIONS[decisionKey]?.hint || 'Bu durumda hangi riski önce kapatmak istersin?';
    console.error('Gemini API Error:', error?.message || error);
    console.log('AI Tutor final failure reason:', error?.message || error);
    res.json({
      reply: `(Çevrimdışı ipucu) ${staticHint}`,
      model: 'offline-fallback',
    });
  }
});

// Vite Middleware for Development / Static for Production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
