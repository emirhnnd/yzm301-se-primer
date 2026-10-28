import React from 'react';
import { Level, Role, Goal } from '../types/game';

interface IntroScreenProps {
  level: Level | null;
  role: Role | null;
  goal: Goal | null;
  onSelectLevel: (lvl: Level) => void;
  onSelectRole: (role: Role) => void;
  onSelectGoal: (goal: Goal) => void;
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  level,
  role,
  goal,
  onSelectLevel,
  onSelectRole,
  onSelectGoal,
  onStart,
}) => {
  const isStartEnabled = level !== null && role !== null && goal !== null;

  return (
    <div className="w-full flex flex-col flex-grow">
      {/* Headline & Progress */}
      <section className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs font-semibold text-[#0B6E69] bg-[#D7EEEB] px-2.5 py-1 rounded tracking-wide">
            AŞAMA 1/3 · 2/3 · 3/3
          </span>
          <span className="font-mono text-xs text-[#4A5F5C]">Ön Değerlendirme</span>
        </div>
        <h1 className="text-[24px] leading-[30px] font-semibold text-[#12201F] tracking-tight">
          Nöbet başlamadan üç soru
        </h1>
      </section>

      {/* 3 Question Cards */}
      <div className="flex flex-col gap-3.5 flex-grow">
        {/* Question 1: Seviye? */}
        <section className="lab-card p-3.5" aria-labelledby="heading-level">
          <div className="flex items-center justify-between mb-2.5">
            <span id="heading-level" className="text-[14px] font-semibold text-[#12201F] font-mono uppercase tracking-wide">
              1) Seviye?
            </span>
            <span className="font-mono text-[11px] text-[#4A5F5C]">Deneyim</span>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="heading-level">
            <button
              type="button"
              role="radio"
              aria-checked={level === 'yeni'}
              data-testid="level-yeni"
              onClick={() => onSelectLevel('yeni')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                level === 'yeni'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Yeni başladım</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  level === 'yeni' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {level === 'yeni' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={level === 'biraz'}
              data-testid="level-biraz"
              onClick={() => onSelectLevel('biraz')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                level === 'biraz'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Biraz deneyimliyim</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  level === 'biraz' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {level === 'biraz' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={level === 'deneyimli'}
              data-testid="level-deneyimli"
              onClick={() => onSelectLevel('deneyimli')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                level === 'deneyimli'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Deneyimliyim</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  level === 'deneyimli' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {level === 'deneyimli' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Question 2: Rolün? */}
        <section className="lab-card p-3.5" aria-labelledby="heading-role">
          <div className="flex items-center justify-between mb-2.5">
            <span id="heading-role" className="text-[14px] font-semibold text-[#12201F] font-mono uppercase tracking-wide">
              2) Rolün?
            </span>
            <span className="font-mono text-[11px] text-[#4A5F5C]">Uzmanlık</span>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="heading-role">
            <button
              type="button"
              role="radio"
              aria-checked={role === 'gelistirici'}
              data-testid="role-gelistirici"
              onClick={() => onSelectRole('gelistirici')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                role === 'gelistirici'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Geliştirici</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  role === 'gelistirici' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {role === 'gelistirici' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={role === 'test'}
              data-testid="role-test"
              onClick={() => onSelectRole('test')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                role === 'test'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Test mühendisi</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  role === 'test' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {role === 'test' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={role === 'urun'}
              data-testid="role-urun"
              onClick={() => onSelectRole('urun')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                role === 'urun'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Ürün yöneticisi</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  role === 'urun' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {role === 'urun' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </section>

        {/* Question 3: Hedefin? */}
        <section className="lab-card p-3.5" aria-labelledby="heading-goal">
          <div className="flex items-center justify-between mb-2.5">
            <span id="heading-goal" className="text-[14px] font-semibold text-[#12201F] font-mono uppercase tracking-wide">
              3) Hedefin?
            </span>
            <span className="font-mono text-[11px] text-[#4A5F5C]">Odak</span>
          </div>

          <div className="flex flex-col gap-2" role="radiogroup" aria-labelledby="heading-goal">
            <button
              type="button"
              role="radio"
              aria-checked={goal === 'mimari'}
              data-testid="goal-mimari"
              onClick={() => onSelectGoal('mimari')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                goal === 'mimari'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Mimari</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  goal === 'mimari' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {goal === 'mimari' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={goal === 'test'}
              data-testid="goal-test"
              onClick={() => onSelectGoal('test')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                goal === 'test'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">Test</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  goal === 'test' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {goal === 'test' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={goal === 'kvkk'}
              data-testid="goal-kvkk"
              onClick={() => onSelectGoal('kvkk')}
              className={`touch-target flex items-center justify-between px-3 rounded-lg border transition-colors ${
                goal === 'kvkk'
                  ? 'border-2 border-[#0B6E69] bg-[#D7EEEB] font-semibold text-[#0B6E69]'
                  : 'border-[#C9D6D3] bg-white text-[#12201F] hover:bg-[#F9FBFA]'
              }`}
            >
              <span className="text-[16px] font-medium text-left">KVKK</span>
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  goal === 'kvkk' ? 'bg-[#0B6E69] text-white' : 'border border-[#C9D6D3] bg-white'
                }`}
              >
                {goal === 'kvkk' && (
                  <svg className="w-3.5 h-3.5 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>
          </div>
        </section>
      </div>

      {/* Footer Action */}
      <footer className="mt-4 pt-2">
        <div className="flex items-center justify-center gap-1.5 mb-3 text-center">
          <svg className="w-3.5 h-3.5 text-[#4A5F5C] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <p className="text-[13px] text-[#4A5F5C] leading-tight">
            Bu cevaplar hikâyeyi sana göre ayarlar. Hiçbiri kaydedilmez.
          </p>
        </div>

        <button
          type="button"
          data-testid="start-btn"
          disabled={!isStartEnabled}
          onClick={onStart}
          className={`w-full touch-target font-semibold text-[16px] rounded-xl flex items-center justify-center gap-2 transition-colors ${
            isStartEnabled
              ? 'bg-[#0B6E69] text-white hover:bg-[#095b57] active:bg-[#084c49] cursor-pointer'
              : 'bg-[#D2DBD8] text-[#718582] cursor-not-allowed opacity-75'
          }`}
        >
          <span>Nöbete başla</span>
          <svg className="w-4 h-4 stroke-[2.2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </footer>
    </div>
  );
};
