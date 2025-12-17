/**
 * Speech Module Types
 * Types for Text-to-Speech and Speech Recognition
 */

// Text-to-Speech Types
export interface SpeechConfig {
  enabled: boolean;
  rate: number;      // 0.1 to 10, default 1
  pitch: number;     // 0 to 2, default 1
  volume: number;    // 0 to 1, default 1
  voice?: string;    // Voice name/identifier
}

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string | null;
  availableVoices: SpeechSynthesisVoice[];
}

export type SpeechEventType = 'start' | 'end' | 'pause' | 'resume' | 'error';

// Speech Recognition Types
export interface RecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
}

export interface RecognitionState {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}
