export interface CharacterData {
  char: string;
  pinyin: string;
  definition: string;
  radical: string;
  strokeCount: number;
}

export interface GradingResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// Minimal type definition for HanziWriter since it is loaded via CDN
export interface HanziWriterOptions {
  width: number;
  height: number;
  padding: number;
  showOutline?: boolean;
  strokeAnimationSpeed?: number;
  delayBetweenStrokes?: number;
  strokeColor?: string;
  radicalColor?: string;
  showCharacter?: boolean;
  showHintAfterMisses?: number;
}

export interface HanziWriterInstance {
  animateCharacter: (options?: { onComplete?: () => void }) => void;
  quiz: (options?: any) => void;
  hideOutline: () => void;
  showOutline: () => void;
  cancelQuiz: () => void;
  setCharacter: (char: string) => void;
}
