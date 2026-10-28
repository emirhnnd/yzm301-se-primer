export type Level = 'yeni' | 'biraz' | 'deneyimli';
export type Role = 'gelistirici' | 'test' | 'urun';
export type Goal = 'mimari' | 'test' | 'kvkk';

export type DecisionId = 'k1' | 'k2' | 'k3';
export type OptionId = 'A' | 'B';

export type EndingId = 'A' | 'B';

export interface TutorMessage {
  id: string;
  sender: 'tutor' | 'player';
  text: string;
  time: string;
}

export interface DecisionOptionContent {
  text: string;
  what: (clock: string) => string;
  why: string;
  minuteAdvance: number;
}

export interface DecisionDefinition {
  id: DecisionId;
  order: string; // e.g. "1/3"
  topic: string; // e.g. "Mimari"
  goalMatch: Goal;
  question: string;
  options: {
    A: DecisionOptionContent;
    B: DecisionOptionContent;
  };
  hint: string;
  deepdive: string;
}

export interface GameState {
  screen: 'intro' | 'scene' | 'ending';
  level: Level | null;
  role: Role | null;
  goal: Goal | null;
  currentDecisionId: DecisionId;
  decisions: {
    k1: OptionId | null;
    k2: OptionId | null;
    k3: OptionId | null;
  };
  clock: string;
  selectedOption: OptionId | null;
  isResultOpen: boolean;
  isTimeout: boolean;
  hintUsedInDecision: boolean;
  tutorMessages: TutorMessage[];
}
