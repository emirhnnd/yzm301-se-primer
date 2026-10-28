/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DecisionId, Goal, Level, OptionId, Role, TutorMessage } from './types/game';
import { advanceClock, DECISIONS, determineEnding } from './data/gameContent';
import { IntroScreen } from './components/IntroScreen';
import { SceneScreen } from './components/SceneScreen';
import { EndingScreen } from './components/EndingScreen';
import { askTutor } from './tutor/tutorService';

const INITIAL_CLOCK = '07:40';

export default function App() {
  // Screen router: 'intro' | 'scene' | 'ending'
  const [screen, setScreen] = useState<'intro' | 'scene' | 'ending'>('intro');

  // Selected profile
  const [level, setLevel] = useState<Level | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  // Simulation state
  const [currentDecisionId, setCurrentDecisionId] = useState<DecisionId>('k1');
  const [decisions, setDecisions] = useState<{
    k1: OptionId | null;
    k2: OptionId | null;
    k3: OptionId | null;
  }>({
    k1: null,
    k2: null,
    k3: null,
  });

  const [clock, setClock] = useState<string>(INITIAL_CLOCK);
  const [selectedOption, setSelectedOption] = useState<OptionId | null>(null);
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [hintUsedThisDecision, setHintUsedThisDecision] = useState<boolean>(false);

  // DURUM card records previous decision's "Ne oldu" string
  const [previousWhatText, setPreviousWhatText] = useState<string | null>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [totalTime, setTotalTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // AI Tutor dialogue messages
  const [tutorMessages, setTutorMessages] = useState<TutorMessage[]>([
    {
      id: 'init-1',
      sender: 'tutor',
      text: 'Laboratuvar sisteminde acil bir durum var. Kararını vermeden önce kafana takılan bir nokta olursa bana sorabilirsin.',
      time: INITIAL_CLOCK,
    },
  ]);
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);

  // Initialize timer for a decision based on level
  const startTimerForDecision = useCallback(
    (lvl: Level) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (lvl === 'yeni') {
        setTimeLeft(0);
        setTotalTime(0);
        return;
      }

      const seconds = lvl === 'biraz' ? 120 : 60;
      setTimeLeft(seconds);
      setTotalTime(seconds);
    },
    []
  );

  // Handle option selection (either user click or timeout)
  const handleSelectOption = useCallback(
    (option: OptionId, timeoutTriggered: boolean = false) => {
      // Stop timer immediately
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const currentDef = DECISIONS[currentDecisionId];
      const minuteAdvance = currentDef.options[option].minuteAdvance;
      const newClock = advanceClock(clock, minuteAdvance);

      setSelectedOption(option);
      setIsTimeout(timeoutTriggered);
      setIsResultOpen(true);
      setClock(newClock);

      setDecisions((prev) => ({
        ...prev,
        [currentDecisionId]: option,
      }));
    },
    [clock, currentDecisionId]
  );

  // Countdown effect
  useEffect(() => {
    if (screen !== 'scene' || !level || level === 'yeni' || selectedOption !== null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // Timeout expired! Option B is automatically applied
          handleSelectOption('B', true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [screen, level, selectedOption, handleSelectOption]);

  // Start simulation from Intro
  const handleStartSimulation = () => {
    if (!level || !role || !goal) return;

    setScreen('scene');
    setCurrentDecisionId('k1');
    setClock(INITIAL_CLOCK);
    setSelectedOption(null);
    setIsResultOpen(false);
    setIsTimeout(false);
    setHintUsedThisDecision(false);
    setPreviousWhatText(null);
    setDecisions({ k1: null, k2: null, k3: null });

    setTutorMessages([
      {
        id: 'init-1',
        sender: 'tutor',
        text: 'Laboratuvar sisteminde acil bir durum var. Kararını vermeden önce kafana takılan bir nokta olursa bana sorabilirsin.',
        time: INITIAL_CLOCK,
      },
    ]);

    startTimerForDecision(level);
  };

  // Continue to next decision or ending
  const handleContinue = () => {
    if (!selectedOption) return;

    const currentDef = DECISIONS[currentDecisionId];
    const whatText = currentDef.options[selectedOption].what(clock);

    if (currentDecisionId === 'k1') {
      setCurrentDecisionId('k2');
      setSelectedOption(null);
      setIsResultOpen(false);
      setIsTimeout(false);
      setHintUsedThisDecision(false);
      setPreviousWhatText(whatText);
      if (level) startTimerForDecision(level);
    } else if (currentDecisionId === 'k2') {
      setCurrentDecisionId('k3');
      setSelectedOption(null);
      setIsResultOpen(false);
      setIsTimeout(false);
      setHintUsedThisDecision(false);
      setPreviousWhatText(whatText);
      if (level) startTimerForDecision(level);
    } else {
      // k3 finished -> go to ending
      setScreen('ending');
    }
  };

  // Hint button clicked
  const handleUseHint = () => {
    if (level === 'deneyimli') return;
    if (level === 'biraz' && hintUsedThisDecision) return;

    const currentDef = DECISIONS[currentDecisionId];
    const hintQuestion = currentDef.hint;

    setHintUsedThisDecision(true);
    setTutorMessages((prev) => [
      ...prev,
      {
        id: `hint-${Date.now()}`,
        sender: 'tutor',
        text: hintQuestion,
        time: clock,
      },
    ]);
  };

  // Send message to AI Tutor
  const handleSendTutorMessage = async (userText: string) => {
    const playerMsg: TutorMessage = {
      id: `user-${Date.now()}`,
      sender: 'player',
      text: userText,
      time: clock,
    };

    setTutorMessages((prev) => [...prev, playerMsg]);
    setIsTutorLoading(true);

    try {
      const tutorReply = await askTutor(tutorMessages, userText, currentDecisionId);
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: tutorReply,
          time: clock,
        },
      ]);
    } catch {
      setTutorMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'tutor',
          text: 'Şu an soru soramıyorum, bir daha dene.',
          time: clock,
        },
      ]);
    } finally {
      setIsTutorLoading(false);
    }
  };

  // Restart from Intro screen
  const handleReplay = () => {
    setScreen('intro');
    setLevel(null);
    setRole(null);
    setGoal(null);
    setCurrentDecisionId('k1');
    setDecisions({ k1: null, k2: null, k3: null });
    setClock(INITIAL_CLOCK);
    setSelectedOption(null);
    setIsResultOpen(false);
    setIsTimeout(false);
    setHintUsedThisDecision(false);
    setPreviousWhatText(null);
  };

  // Retry with same profile at K1
  const handleRetryPath = () => {
    if (!level || !role || !goal) {
      handleReplay();
      return;
    }

    setScreen('scene');
    setCurrentDecisionId('k1');
    setDecisions({ k1: null, k2: null, k3: null });
    setClock(INITIAL_CLOCK);
    setSelectedOption(null);
    setIsResultOpen(false);
    setIsTimeout(false);
    setHintUsedThisDecision(false);
    setPreviousWhatText(null);

    setTutorMessages([
      {
        id: 'init-retry',
        sender: 'tutor',
        text: 'Krizi yeniden devraldın. Bu kez farklı bir strateji deneyebilirsin. Kafana takılanı sormaktan çekinme.',
        time: INITIAL_CLOCK,
      },
    ]);

    startTimerForDecision(level);
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#12201F] flex justify-center py-0 sm:py-4">
      {/* Mobile container: 390px standard mobile viewport, down to 360px without scroll */}
      <main className="w-full max-w-[390px] min-h-screen flex flex-col px-3.5 py-4 relative">
        {/* Top Wordmark & Facility Subtitle (Always visible) */}
        <header className="pt-1 pb-3 border-b border-[#C9D6D3]/70 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-[#0B6E69]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 18h8" />
                <path d="M3 22h18" />
                <path d="M14 22a7 7 0 1 0 0-14h-1" />
                <path d="M9 14h2" />
                <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
                <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
              </svg>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0B6E69]">
                SE PRIMER
              </span>
            </div>
            <span className="font-mono text-[11px] font-medium text-[#4A5F5C] bg-[#E2ECE9] px-2 py-0.5 rounded">
              LABLINK
            </span>
          </div>
          <p className="font-mono text-[12px] text-[#4A5F5C] mt-1">
            LabLink Krizi · Akasya Tıp Merkezi
          </p>
        </header>

        {/* View Router */}
        {screen === 'intro' && (
          <IntroScreen
            level={level}
            role={role}
            goal={goal}
            onSelectLevel={setLevel}
            onSelectRole={setRole}
            onSelectGoal={setGoal}
            onStart={handleStartSimulation}
          />
        )}

        {screen === 'scene' && level && role && goal && (
          <SceneScreen
            decision={DECISIONS[currentDecisionId]}
            level={level}
            role={role}
            goal={goal}
            clock={clock}
            selectedOption={selectedOption}
            previousDecisionWhat={previousWhatText}
            isResultOpen={isResultOpen}
            isTimeout={isTimeout}
            timeLeft={timeLeft}
            totalTime={totalTime}
            hintUsedThisDecision={hintUsedThisDecision}
            tutorMessages={tutorMessages}
            isTutorLoading={isTutorLoading}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            onContinue={handleContinue}
            onSendTutorMessage={handleSendTutorMessage}
          />
        )}

        {screen === 'ending' && goal && decisions.k1 && decisions.k2 && decisions.k3 && (
          <EndingScreen
            ending={determineEnding(decisions.k1, decisions.k2, decisions.k3)}
            clock={clock}
            decisions={{
              k1: decisions.k1,
              k2: decisions.k2,
              k3: decisions.k3,
            }}
            goal={goal}
            onReplay={handleReplay}
            onRetryPath={handleRetryPath}
          />
        )}
      </main>
    </div>
  );
}
