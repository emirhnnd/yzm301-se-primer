import React, { useEffect, useRef } from 'react';
import { DecisionDefinition, Goal, Level, OptionId, Role, TutorMessage } from '../types/game';
import { ROLE_NOTES, ROLE_PERSPECTIVE_LABELS, GOAL_LABELS, LEVEL_LABELS } from '../data/gameContent';
import { AITutorPanel } from './AITutorPanel';

interface SceneScreenProps {
  decision: DecisionDefinition;
  level: Level;
  role: Role;
  goal: Goal;
  clock: string;
  selectedOption: OptionId | null;
  previousDecisionWhat: string | null;
  isResultOpen: boolean;
  isTimeout: boolean;
  timeLeft: number;
  totalTime: number;
  hintUsedThisDecision: boolean;
  tutorMessages: TutorMessage[];
  isTutorLoading: boolean;
  onSelectOption: (opt: OptionId, isTimeout?: boolean) => void;
  onUseHint: () => void;
  onContinue: () => void;
  onSendTutorMessage: (text: string) => Promise<void>;
}

export const SceneScreen: React.FC<SceneScreenProps> = ({
  decision,
  level,
  role,
  goal,
  clock,
  selectedOption,
  previousDecisionWhat,
  isResultOpen,
  isTimeout,
  timeLeft,
  totalTime,
  hintUsedThisDecision,
  tutorMessages,
  isTutorLoading,
  onSelectOption,
  onUseHint,
  onContinue,
  onSendTutorMessage,
}) => {
  const resultWhatRef = useRef<HTMLHeadingElement>(null);

  // Focus moves to "Ne oldu" heading when result opens
  useEffect(() => {
    if (isResultOpen && resultWhatRef.current) {
      resultWhatRef.current.focus();
    }
  }, [isResultOpen]);

  // Is timer enabled for this level?
  const hasTimer = level === 'biraz' || level === 'deneyimli';
  const isTimerCritical = timeLeft <= 15;
  const timerPercent = totalTime > 0 ? Math.max(0, Math.min(100, (timeLeft / totalTime) * 100)) : 0;

  // Selected option details
  const chosenContent = selectedOption ? decision.options[selectedOption] : null;
  const isGoalMatch = goal === decision.goalMatch;

  return (
    <div className="w-full flex flex-col flex-grow">
      {/* Top Bar: Clock, Context Chips, Timer */}
      <header className="w-full mb-3">
        <div className="flex items-center justify-between gap-2">
          {/* Big Clock in IBM Plex Mono */}
          <div className="flex items-baseline gap-1.5 shrink-0">
            <span data-testid="clock" className="font-mono text-[32px] sm:text-[36px] font-bold tracking-tight text-[#12201F] leading-none">
              {clock}
            </span>
            <span className="font-mono text-[10px] sm:text-xs font-semibold text-[#4A5F5C] uppercase tracking-wider">
              CANLI
            </span>
          </div>

          {/* Chips on the right */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Decision Chip */}
            <div
              data-testid="decision-chip"
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#E7F3F1] border border-[#C9D6D3] text-[#0B6E69] text-xs font-semibold tracking-wide whitespace-nowrap"
            >
              Karar {decision.order}
            </div>

            {/* Goal Chip (next to Karar chip, highlighted on matching decision) */}
            <div
              data-testid="goal-chip"
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap transition-colors ${
                isGoalMatch
                  ? 'bg-[#D7EEEB] border border-[#0B6E69] text-[#0B6E69] font-bold shadow-xs'
                  : 'bg-[#F4F7F6] border border-[#C9D6D3] text-[#4A5F5C]'
              }`}
            >
              Odak: {GOAL_LABELS[goal]}
            </div>

            {/* Level Chip */}
            <div
              data-testid="level-chip"
              className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#F4F7F6] border border-[#C9D6D3] text-[#4A5F5C] text-xs font-semibold tracking-wide whitespace-nowrap"
            >
              Seviye: {LEVEL_LABELS[level]}
            </div>
          </div>
        </div>

        {/* Timer bar for timed levels */}
        {hasTimer && (
          <div className="w-full mt-2.5">
            <div className="w-full h-1.5 bg-[#D7E2DF] rounded-full overflow-hidden">
              <div
                data-testid="timer-bar"
                className={`h-full rounded-full transition-all duration-1000 ${
                  isTimerCritical ? 'bg-[#8A4B00]' : 'bg-[#0B6E69]'
                }`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="font-mono text-[11px] text-[#4A5F5C]">Kritik müdahale süresi</span>
              <span
                data-testid="timer-text"
                aria-live="polite"
                className={`font-mono text-[11px] font-medium ${
                  isTimerCritical ? 'text-[#8A4B00] font-bold' : 'text-[#0B6E69]'
                }`}
              >
                {timeLeft} sn kaldı
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Scenario Card: K1 is full card, K2 and K3 are DURUM cards */}
      {decision.id === 'k1' ? (
        <section className="w-full bg-white rounded-[12px] lab-card p-4 mb-3.5">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#EDF2F1]">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#0B6E69]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[11px] font-bold tracking-widest text-[#4A5F5C] uppercase">
                SONUÇ EŞLEŞME KAYDI
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#8A4B00] bg-[#FFF1D6] px-1.5 py-0.5 rounded font-semibold border border-[#EACD9B] whitespace-nowrap">
              KRİTİK HATA
            </span>
          </div>

          {/* Narrative Text */}
          <p className="text-[16px] leading-[23px] text-[#12201F] font-normal mb-3.5">
            Dün gece yeni sürüm çıktı. İki hasta portalda başkasının tahlil sonucunu görmüş. Poliklinik 08:30'da açılıyor, 300 hasta bekliyor. Nöbetçi sensin.
          </p>

          {/* Table-like telemetry rows */}
          <div className="bg-[#F8FAF9] rounded-[8px] border border-[#DEE6E4] p-2.5 space-y-2 font-mono text-[12px]">
            {/* Row 1 */}
            <div className="flex flex-col gap-0.5 pb-1.5 border-b border-[#E7EFEA]">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-[#12201F]">Hasta A</span>
                  <span className="text-[#4A5F5C]">—</span>
                  <span className="text-[#12201F]">Hemogram</span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#FFF1D6] text-[#8A4B00] border border-[#EACD9B] whitespace-nowrap">
                  [H] Yüksek risk
                </span>
              </div>
              <span className="text-[11px] text-[#4A5F5C]">Eşleşme: numune sıra no</span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-0.5 pt-0.5">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-semibold text-[#12201F]">Hasta B</span>
                  <span className="text-[#4A5F5C]">—</span>
                  <span className="text-[#12201F]">Biyokimya</span>
                </div>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#FFF1D6] text-[#8A4B00] border border-[#EACD9B] whitespace-nowrap">
                  [H] Yüksek risk
                </span>
              </div>
              <span className="text-[11px] text-[#4A5F5C]">Eşleşme: numune sıra no</span>
            </div>
          </div>

          {/* Single-line role note in IBM Plex Mono */}
          <div className="mt-3 pt-2 border-t border-[#EDF2F1]">
            <p className="font-mono text-[12px] text-[#4A5F5C] leading-snug">
              {ROLE_NOTES.k1[role]}
            </p>
          </div>
        </section>
      ) : (
        /* K2 and K3 DURUM card */
        <section className="w-full bg-white rounded-[12px] lab-card p-3.5 mb-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#4A5F5C] uppercase bg-[#EAEFEF] px-2 py-0.5 rounded">
              DURUM
            </span>
            <span className="font-mono text-[11px] text-[#0B6E69]">Gelişme</span>
          </div>
          <p className="text-[15px] font-mono text-[#12201F] leading-snug">
            {previousDecisionWhat}
          </p>
          {/* Single-line role note in IBM Plex Mono */}
          <div className="mt-2.5 pt-2 border-t border-[#EDF2F1]">
            <p className="font-mono text-[12px] text-[#4A5F5C] leading-snug">
              {ROLE_NOTES[decision.id][role]}
            </p>
          </div>
        </section>
      )}

      {/* Decision Question & Options */}
      <section className="w-full mb-3" aria-labelledby="decision-question-heading">
        <h2 id="decision-question-heading" className="text-[17px] font-bold text-[#12201F] tracking-tight mb-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0B6E69]" />
          {decision.question}
        </h2>

        {/* Options in role="radiogroup" */}
        <div className="space-y-2.5" role="radiogroup" aria-labelledby="decision-question-heading">
          {/* Option A */}
          <button
            type="button"
            role="radio"
            data-testid="option-a"
            aria-checked={selectedOption === 'A'}
            disabled={selectedOption !== null}
            onClick={() => onSelectOption('A')}
            className={`w-full text-left rounded-[12px] p-3.5 flex items-start gap-3 touch-target transition-colors ${
              selectedOption === 'A'
                ? 'bg-[#D7EEEB] border-2 border-[#0B6E69] text-[#0B6E69]'
                : selectedOption !== null
                ? 'bg-white opacity-60 border border-[#C9D6D3] text-[#12201F] cursor-not-allowed'
                : 'bg-white border border-[#C9D6D3] text-[#12201F] hover:bg-[#F9FBFA] active:bg-[#ECEFEF] cursor-pointer'
            }`}
          >
            <span
              className={`w-7 h-7 shrink-0 rounded-full font-mono font-bold text-sm flex items-center justify-center ${
                selectedOption === 'A'
                  ? 'bg-[#0B6E69] text-white'
                  : 'bg-[#F4F7F6] text-[#4A5F5C] border border-[#C9D6D3]'
              }`}
            >
              {selectedOption === 'A' ? (
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                'A'
              )}
            </span>
            <span className="text-[16px] leading-[22px] font-medium pt-0.5">
              {decision.options.A.text}
            </span>
          </button>

          {/* Option B */}
          <button
            type="button"
            role="radio"
            data-testid="option-b"
            aria-checked={selectedOption === 'B'}
            disabled={selectedOption !== null}
            onClick={() => onSelectOption('B')}
            className={`w-full text-left rounded-[12px] p-3.5 flex items-start gap-3 touch-target transition-colors ${
              selectedOption === 'B'
                ? 'bg-[#D7EEEB] border-2 border-[#0B6E69] text-[#0B6E69]'
                : selectedOption !== null
                ? 'bg-white opacity-60 border border-[#C9D6D3] text-[#12201F] cursor-not-allowed'
                : 'bg-white border border-[#C9D6D3] text-[#12201F] hover:bg-[#F9FBFA] active:bg-[#ECEFEF] cursor-pointer'
            }`}
          >
            <span
              className={`w-7 h-7 shrink-0 rounded-full font-mono font-bold text-sm flex items-center justify-center ${
                selectedOption === 'B'
                  ? 'bg-[#0B6E69] text-white'
                  : 'bg-[#F4F7F6] text-[#4A5F5C] border border-[#C9D6D3]'
              }`}
            >
              {selectedOption === 'B' ? (
                <svg className="w-4 h-4 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                'B'
              )}
            </span>
            <span className="text-[16px] leading-[22px] font-medium pt-0.5">
              {decision.options.B.text}
            </span>
          </button>
        </div>

        {/* Hint Button (only visible depending on level) */}
        {level !== 'deneyimli' && (
          <div className="mt-2.5">
            <button
              type="button"
              data-testid="hint-btn"
              disabled={level === 'biraz' && hintUsedThisDecision}
              onClick={onUseHint}
              className={`w-full touch-target rounded-[10px] border border-[#0B6E69] transition-colors font-medium text-[15px] flex items-center justify-center gap-2 px-4 py-2.5 ${
                level === 'biraz' && hintUsedThisDecision
                  ? 'bg-[#EAEFEF] text-[#788C89] border-[#C9D6D3] cursor-not-allowed'
                  : 'bg-transparent text-[#0B6E69] hover:bg-[#E7F3F1] active:bg-[#D7EEEB] cursor-pointer'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>{level === 'biraz' && hintUsedThisDecision ? 'İpucu kullanıldı' : 'İpucu göster'}</span>
            </button>
          </div>
        )}
      </section>

      {/* Result Panel: "Ne oldu / Neden oldu" + "Devam" button */}
      <section data-testid="result-panel" className="w-full bg-white rounded-[12px] lab-card p-3.5 mb-3">
        {/* Result Panel Header */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#EDF2F1]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F4F7F6] text-[#4A5F5C] border border-[#D7E2DF] shrink-0">
              ANALİZ
            </span>
            <span className="text-[15px] font-semibold text-[#12201F]">
              Kök Neden Raporu
            </span>
          </div>
          <span className="text-xs text-[#4A5F5C] whitespace-nowrap">
            {isResultOpen ? 'Sonuçlandı' : '(seçim bekleniyor)'}
          </span>
        </div>

        {isResultOpen && chosenContent ? (
          <div className="mt-2.5 space-y-3">
            {/* Timeout Notice if triggered */}
            {isTimeout && (
              <div
                data-testid="timeout-note"
                className="p-2 rounded bg-[#FFF1D6] border border-[#EACD9B] text-[#8A4B00] text-[13px] font-medium leading-snug flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Süre doldu, hızlı ama riskli seçenek uygulandı.</span>
              </div>
            )}

            {/* Ne oldu */}
            <div>
              <h3
                ref={resultWhatRef}
                tabIndex={-1}
                data-testid="result-what"
                className="text-[14px] font-bold text-[#12201F] mb-1 outline-none"
              >
                Ne oldu:
              </h3>
              <p className="text-[14px] font-mono leading-[21px] text-[#12201F] bg-[#F8FAF9] p-2 rounded border border-[#E1ECE9]">
                {chosenContent.what(clock)}
              </p>
            </div>

            {/* Neden oldu */}
            <div>
              <h3 data-testid="result-why" className="text-[14px] font-bold text-[#12201F] mb-1 flex items-center gap-1.5 flex-wrap">
                <span>Neden oldu</span>
                <span className="text-[#718582] font-normal">·</span>
                <span className="font-mono text-[11px] font-semibold text-[#0B6E69] bg-[#E7F3F1] px-1.5 py-0.5 rounded border border-[#C9D6D3]">
                  {ROLE_PERSPECTIVE_LABELS[role]}
                </span>
              </h3>
              <p className="text-[15px] leading-[22px] text-[#4A5F5C]">
                {chosenContent.why}
              </p>
            </div>

            {/* Derinleşme card (only if player goal matches this decision) */}
            {isGoalMatch && (
              <div
                data-testid="result-deepdive"
                className="p-3.5 bg-[#F4FAF8] border-y border-r border-[#C9D6D3] border-l-4 border-l-[#0B6E69] rounded-r-[8px] text-[14px] leading-[22px] shadow-xs"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-[#0B6E69] uppercase bg-[#D7EEEB] px-2 py-0.5 rounded border border-[#0B6E69]/30">
                    DERİNLEŞME · ODAK: {GOAL_LABELS[goal]}
                  </span>
                </div>
                <p className="text-[#324B48] font-normal">
                  {decision.deepdive}
                </p>
              </div>
            )}

            {/* Devam Button */}
            <button
              type="button"
              data-testid="continue-btn"
              onClick={onContinue}
              className="w-full mt-3 touch-target bg-[#0B6E69] hover:bg-[#095753] active:bg-[#074744] text-white rounded-[10px] font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Devam</span>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        ) : (
          /* Placeholder when result is collapsed before selection */
          <div className="mt-2 pt-2 border-t border-[#EDF2F1]">
            <p className="text-[13px] text-[#4A5F5C] italic">
              A veya B kararını onayladıktan sonra sistem kök neden raporu burada çözümlenecektir.
            </p>
            <button
              type="button"
              data-testid="continue-btn"
              disabled
              className="w-full mt-3 touch-target bg-[#D2DBD8] text-[#718582] rounded-[10px] font-semibold text-[16px] flex items-center justify-center gap-2 cursor-not-allowed opacity-75"
            >
              <span>Devam</span>
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}
      </section>

      {/* AI Tutor Panel */}
      <AITutorPanel
        messages={tutorMessages}
        onSendMessage={onSendTutorMessage}
        isLoading={isTutorLoading}
      />
    </div>
  );
};
