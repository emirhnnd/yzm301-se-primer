import React, { useState, useRef, useEffect } from 'react';
import { TutorMessage } from '../types/game';

interface AITutorPanelProps {
  messages: TutorMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;

    setInputText('');
    await onSendMessage(trimmed);
  };

  return (
    <section data-testid="tutor-panel" className="w-full bg-white rounded-[12px] lab-card p-3.5 mt-2">
      {/* Tutor Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#EDF2F1]">
        <div className="flex items-center gap-2">
          {/* Institutional Shield Icon */}
          <div className="w-6 h-6 rounded-full bg-[#E8E9FA] flex items-center justify-center text-[#3B3F8F]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#3B3F8F] font-mono">
            AI TUTOR
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#4A5F5C] whitespace-nowrap">
          Sokratik Rehberlik
        </span>
      </div>

      {/* Dialogue Thread */}
      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 mb-3 scroll-smooth" aria-live="polite">
        {messages.map((msg) => (
          <div
            key={msg.id}
            data-testid="tutor-msg"
            className={`flex flex-col ${
              msg.sender === 'player' ? 'items-end ml-auto max-w-[90%]' : 'items-start max-w-[92%]'
            }`}
          >
            {msg.sender === 'player' ? (
              <div className="bg-[#0B6E69] text-white rounded-[12px] rounded-tr-xs px-3.5 py-2.5 text-[15px] leading-[21px] text-right">
                {msg.text}
              </div>
            ) : (
              <div className="bg-[#E8E9FA] text-[#3B3F8F] border border-[#CBD0F2] rounded-[12px] rounded-tl-xs px-3.5 py-2.5 text-[15px] leading-[21px]">
                {msg.text}
              </div>
            )}
            <span
              className={`text-[10px] text-[#4A5F5C] mt-1 font-mono ${
                msg.sender === 'player' ? 'pr-1' : 'pl-1'
              }`}
            >
              {msg.time} · {msg.sender === 'player' ? 'Sen' : 'AI Tutor'}
            </span>
          </div>
        ))}

        {isLoading && (
          <div data-testid="tutor-msg" className="flex flex-col items-start max-w-[92%]">
            <div className="bg-[#E8E9FA] text-[#3B3F8F] border border-[#CBD0F2] rounded-[12px] rounded-tl-xs px-3.5 py-2 text-[14px] flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#3B3F8F] animate-ping" />
              <span>Düşünüyor ve soru hazırlıyor…</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Tutor Input Form */}
      <form onSubmit={handleSubmit} className="pt-2 border-t border-[#EDF2F1]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            data-testid="tutor-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Tutor'a yaz…"
            disabled={isLoading}
            className="flex-1 touch-target rounded-[10px] border border-[#C9D6D3] bg-[#F8FAF9] px-3.5 text-[15px] text-[#12201F] placeholder-[#4A5F5C] focus:bg-white focus:outline-none transition-colors"
          />
          <button
            type="submit"
            data-testid="tutor-send"
            disabled={!inputText.trim() || isLoading}
            aria-label="Gönder"
            className={`w-12 h-12 shrink-0 rounded-[10px] flex items-center justify-center transition-colors ${
              inputText.trim() && !isLoading
                ? 'bg-[#0B6E69] text-white hover:bg-[#095753] active:bg-[#074744] cursor-pointer'
                : 'bg-[#DEE7E5] text-[#8EA29E] cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
};
