import React from 'react';
import { Goal, OptionId } from '../types/game';
import { DECISIONS, NEXT_LESSONS, PATH_REASONS } from '../data/gameContent';

interface EndingScreenProps {
  ending: 'A' | 'B';
  clock: string;
  decisions: {
    k1: OptionId;
    k2: OptionId;
    k3: OptionId;
  };
  goal: Goal;
  onReplay: () => void;
  onRetryPath: () => void;
}

export const EndingScreen: React.FC<EndingScreenProps> = ({
  ending,
  clock,
  decisions,
  goal,
  onReplay,
  onRetryPath,
}) => {
  const pathKey = `${decisions.k1}-${decisions.k2}-${decisions.k3}`;
  const pathReason = PATH_REASONS[pathKey] || 'Simülasyon tamamlandı.';
  const nextLessonTitle = NEXT_LESSONS[goal];

  const isSuccess = ending === 'A';

  return (
    <div className="w-full flex flex-col gap-4 flex-grow">
      {/* Micro Header */}
      <header className="flex items-center justify-between px-1 py-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wider text-[#4A5F5C] uppercase font-mono">
            SE PRIMER
          </span>
          <span className="text-xs text-[#4A5F5C] opacity-60">·</span>
          <span className="text-xs text-[#4A5F5C]">Sonuç (Aşama 3/3)</span>
        </div>
        <div className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#E7F7F5] text-[#0B6E69] border border-[#C9D6D3]">
          SİM-SONLANDI
        </div>
      </header>

      {/* Main Result Card */}
      <section className="bg-white lab-card p-5 flex flex-col gap-4">
        {/* Status Badge */}
        <div>
          {isSuccess ? (
            <div
              data-testid="ending-badge"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DDF3E4] border border-[#BCE7C7] text-[#1B6B3A]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-bold tracking-wider uppercase font-mono">
                SON A · KONTROL ALTINDA
              </span>
            </div>
          ) : (
            <div
              data-testid="ending-badge"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FDE7E5] border border-[#F6BDB8] text-[#B3261E]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-bold tracking-wider uppercase font-mono">
                SON B · GİZLİ BOMBA
              </span>
            </div>
          )}
        </div>

        {/* Clock & Headline */}
        <div className="flex flex-col gap-1 border-b border-[#E1ECE9] pb-4">
          <div className="flex items-baseline gap-3">
            <span
              data-testid="ending-clock"
              className="font-mono text-[40px] font-semibold tracking-tight text-[#12201F] leading-none"
            >
              {clock}
            </span>
            <span
              className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                isSuccess
                  ? 'bg-[#DDF3E4] text-[#1B6B3A] border-[#BCE7C7]'
                  : 'bg-[#FDE7E5] text-[#B3261E] border-[#F6BDB8]'
              }`}
            >
              {isSuccess ? 'KRİZ ÇÖZÜLDÜ' : 'RİSK AKTİF'}
            </span>
          </div>

          <h2 className="text-[17px] font-bold text-[#12201F] leading-snug mt-1">
            {isSuccess
              ? "Akasya Tıp Merkezi 08:30'da zamanında açıldı."
              : 'Poliklinik açıldı ama kriz sürüyor.'}
          </h2>

          {/* Path Reason (Exact sentence) */}
          <p
            data-testid="ending-reason"
            className="text-[14px] text-[#4A5F5C] leading-relaxed pt-1"
          >
            {pathReason}
          </p>
        </div>

        {/* Section: Senin Yolun */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#4A5F5C] tracking-wide uppercase font-mono">
              Senin Yolun
            </span>
            <span className="text-[11px] font-mono text-[#0B6E69] font-medium">
              Rota: {pathKey}
            </span>
          </div>

          <div className="flex items-start justify-between relative px-2 pt-1 pb-2">
            {/* Step K1 */}
            <div data-testid="path-k1" className="flex flex-col items-center text-center z-10 w-20">
              <div
                className={`w-8 h-8 rounded-full font-mono text-xs font-semibold flex items-center justify-center border-2 border-white ${
                  decisions.k1 === 'A' ? 'bg-[#1B6B3A] text-white' : 'bg-[#8A4B00] text-white'
                }`}
              >
                {decisions.k1}
              </div>
              <span className="text-[11px] font-semibold text-[#12201F] mt-1.5 leading-tight">
                K1 Mimari
              </span>
              <div
                className={`mt-1 flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  decisions.k1 === 'A'
                    ? 'bg-[#DDF3E4] text-[#1B6B3A]'
                    : 'bg-[#FFF1D6] text-[#8A4B00]'
                }`}
              >
                [{decisions.k1 === 'A' ? 'N' : 'H'}]
              </div>
            </div>

            {/* Connector line 1-2 */}
            <div className="h-0.5 bg-[#C9D6D3] flex-grow mt-4" />

            {/* Step K2 */}
            <div data-testid="path-k2" className="flex flex-col items-center text-center z-10 w-20">
              <div
                className={`w-8 h-8 rounded-full font-mono text-xs font-semibold flex items-center justify-center border-2 border-white ${
                  decisions.k2 === 'A' ? 'bg-[#1B6B3A] text-white' : 'bg-[#8A4B00] text-white'
                }`}
              >
                {decisions.k2}
              </div>
              <span className="text-[11px] font-semibold text-[#12201F] mt-1.5 leading-tight">
                K2 Test
              </span>
              <div
                className={`mt-1 flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  decisions.k2 === 'A'
                    ? 'bg-[#DDF3E4] text-[#1B6B3A]'
                    : 'bg-[#FFF1D6] text-[#8A4B00]'
                }`}
              >
                [{decisions.k2 === 'A' ? 'N' : 'H'}]
              </div>
            </div>

            {/* Connector line 2-3 */}
            <div className="h-0.5 bg-[#C9D6D3] flex-grow mt-4" />

            {/* Step K3 */}
            <div data-testid="path-k3" className="flex flex-col items-center text-center z-10 w-20">
              <div
                className={`w-8 h-8 rounded-full font-mono text-xs font-semibold flex items-center justify-center border-2 border-white ${
                  decisions.k3 === 'A' ? 'bg-[#1B6B3A] text-white' : 'bg-[#8A4B00] text-white'
                }`}
              >
                {decisions.k3}
              </div>
              <span className="text-[11px] font-semibold text-[#12201F] mt-1.5 leading-tight">
                K3 KVKK
              </span>
              <div
                className={`mt-1 flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                  decisions.k3 === 'A'
                    ? 'bg-[#DDF3E4] text-[#1B6B3A]'
                    : 'bg-[#FFF1D6] text-[#8A4B00]'
                }`}
              >
                [{decisions.k3 === 'A' ? 'N' : 'H'}]
              </div>
            </div>
          </div>
        </div>

        {/* Section: Karar Özeti */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-[#E1ECE9]">
          <span className="text-xs font-semibold text-[#4A5F5C] tracking-wide uppercase font-mono">
            Karar Özeti
          </span>

          {/* K1 Summary Row */}
          <div className="bg-[#F8FAF9] border border-[#DEE6E4] rounded-[8px] p-2.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B6E69]">K1 · Mimari</span>
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#D7EEEB] text-[#0B6E69]">
                Seçim {decisions.k1}
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#12201F] leading-snug">
              {DECISIONS.k1.options[decisions.k1].text}
            </p>
            <p className="text-xs text-[#4A5F5C] leading-snug">
              <span className="font-semibold text-[#12201F]">Neden oldu: </span>
              {DECISIONS.k1.options[decisions.k1].why}
            </p>
          </div>

          {/* K2 Summary Row */}
          <div className="bg-[#F8FAF9] border border-[#DEE6E4] rounded-[8px] p-2.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B6E69]">K2 · Test</span>
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#D7EEEB] text-[#0B6E69]">
                Seçim {decisions.k2}
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#12201F] leading-snug">
              {DECISIONS.k2.options[decisions.k2].text}
            </p>
            <p className="text-xs text-[#4A5F5C] leading-snug">
              <span className="font-semibold text-[#12201F]">Neden oldu: </span>
              {DECISIONS.k2.options[decisions.k2].why}
            </p>
          </div>

          {/* K3 Summary Row */}
          <div className="bg-[#F8FAF9] border border-[#DEE6E4] rounded-[8px] p-2.5 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B6E69]">K3 · KVKK</span>
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#D7EEEB] text-[#0B6E69]">
                Seçim {decisions.k3}
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#12201F] leading-snug">
              {DECISIONS.k3.options[decisions.k3].text}
            </p>
            <p className="text-xs text-[#4A5F5C] leading-snug">
              <span className="font-semibold text-[#12201F]">Neden oldu: </span>
              {DECISIONS.k3.options[decisions.k3].why}
            </p>
          </div>
        </div>

        {/* Section: Sonraki Ders (Based on chosen Goal) */}
        <div
          data-testid="next-lesson"
          className="bg-[#E8E9FA] border border-[#CBD0F2] rounded-[10px] p-3 flex items-start gap-2.5"
        >
          <div className="w-6 h-6 rounded bg-[#3B3F8F] text-white flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-mono font-semibold uppercase text-[#3B3F8F] tracking-wide">
              Sonraki Ders · Hedef: {goal.toUpperCase()}
            </span>
            <span className="text-[14px] font-bold text-[#1F235A]">
              {nextLessonTitle}
            </span>
            <p className="text-xs text-[#3B3F8F] leading-snug">
              Bu senaryoda edindiğin tecrübeyi pekiştirmek için önerilen derinleşme modülü.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary button: Tekrar oyna */}
          <button
            type="button"
            data-testid="replay-btn"
            onClick={onReplay}
            className="w-full touch-target bg-[#0B6E69] text-white text-[15px] font-semibold rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#095955] active:bg-[#074945] transition cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Tekrar oyna</span>
          </button>

          {/* Secondary text/outline button: Farklı yolu dene */}
          <button
            type="button"
            data-testid="retry-path-btn"
            onClick={onRetryPath}
            className="w-full touch-target bg-transparent border border-[#0B6E69] text-[#0B6E69] text-[15px] font-semibold rounded-[10px] flex items-center justify-center hover:bg-[#E7F7F5] active:bg-[#D7EEEB] transition cursor-pointer"
          >
            Farklı yolu dene
          </button>
        </div>
      </section>
    </div>
  );
};
