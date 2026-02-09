'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VoiceState } from '@/types/voice-search';
import { translateArabicToEnglish, normalizeArabic } from '@/lib/voice-search-mapping';

export type { VoiceState } from '@/types/voice-search';

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** Perfumes list cache for fuzzy matching (api/perfumes or local) */
let perfumesCache: { name: string; brand: string }[] | null = null;

async function getPerfumesForFuzzy(): Promise<{ name: string; brand: string }[]> {
  if (perfumesCache?.length) return perfumesCache;
  try {
    const res = await fetch('/api/perfumes');
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.perfumes ?? [];
      const mapped = list.map((p: { name?: string; brand?: string }) => ({ name: p.name ?? '', brand: p.brand ?? '' }));
      perfumesCache = mapped;
      return mapped;
    }
  } catch {
    // fallback to local
  }
  const { perfumes } = await import('@/lib/data/perfumes');
  const mapped = perfumes.map((p) => ({ name: p.name, brand: p.brand }));
  perfumesCache = mapped;
  return mapped;
}

/** Optional fuzzy match: transcript → best perfume name/brand or transcript */
async function fuzzyTranscript(transcript: string): Promise<string> {
  try {
    // LAYER 1: Try Arabic to English translation first (fast & accurate)
    const translated = translateArabicToEnglish(transcript);
    if (translated) {
      console.log('[Voice Search] Translated:', transcript, '→', translated);
      return translated;
    }

    // LAYER 2: Try Fuse.js fuzzy matching on original transcript
    const Fuse = (await import('fuse.js')).default;
    const perfumes = await getPerfumesForFuzzy();

    if (!perfumes.length) {
      console.log('[Voice Search] No perfumes available for fuzzy matching');
      return transcript;
    }

    const fuse = new Fuse(perfumes, {
      keys: ['name', 'brand'],
      threshold: 0.35, // Slightly more strict for better accuracy
      ignoreLocation: true,
      distance: 100,
    });

    // Search with normalized transcript
    const normalized = normalizeArabic(transcript);
    const result = fuse.search(normalized);

    if (result.length > 0 && result[0].score !== undefined && result[0].score < 0.35) {
      const match = result[0].item;
      console.log('[Voice Search] Fuzzy match:', transcript, '→', match.name, 'score:', result[0].score);
      return match.name;
    }

    // LAYER 3: If no good match, return original
    console.log('[Voice Search] No good match, using original:', transcript);
    return transcript;
  } catch (error) {
    console.error('[Voice Search] Error in fuzzyTranscript:', error);
    return transcript;
  }
}

export interface UseVoiceSearchOptions {
  lang?: string;
  onTranscript?: (text: string) => void;
}

export const useVoiceSearch = (options?: UseVoiceSearchOptions) => {
  const onTranscriptRef = useRef(options?.onTranscript);
  const langRef = useRef(options?.lang || 'ar-SA');

  useEffect(() => {
    onTranscriptRef.current = options?.onTranscript;
  });

  useEffect(() => {
    langRef.current = options?.lang || 'ar-SA';
  });

  const [state, setState] = useState<VoiceState>({
    status: 'idle',
    transcript: '',
    error: '',
  });

  const [isSupported, setIsSupported] = useState(false);
  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const getRecognition = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: 'Speech recognition is not supported in this browser.',
      }));
      return null;
    }
    if (!recognitionRef.current) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = langRef.current;

      recognitionRef.current.onresult = (event: { results: SpeechRecognitionResultList }) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(' ')
          .trim();
        if (transcript) {
          console.log('[Voice Search] Raw transcript:', transcript);
          setState((s) => ({
            ...s,
            status: 'transcript',
            transcript,
            error: '',
          }));
        }
      };

      recognitionRef.current.onerror = (event: { error: string }) => {
        const message = event.error === 'not-allowed' ? 'Microphone access denied.' : event.error || 'Speech recognition error.';
        setState((s) => ({
          ...s,
          status: 'error',
          error: message,
        }));
      };

      recognitionRef.current.onend = () => {
        setState((s) => (s.status === 'listening' ? { ...s, status: 'idle' } : s));
      };
    }
    return recognitionRef.current;
  }, []);

  const startListening = useCallback(() => {
    setState({ status: 'idle', transcript: '', error: '' });
    const rec = getRecognition();
    if (rec) {
      try {
        rec.start();
        setState((s) => ({ ...s, status: 'listening' }));
      } catch (e) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: e instanceof Error ? e.message : 'Failed to start listening.',
        }));
      }
    }
  }, [getRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setState((s) => (s.status === 'listening' ? { ...s, status: 'idle' } : s));
    }
  }, []);

  const reset = useCallback(() => {
    stopListening();
    setState({ status: 'idle', transcript: '', error: '' });
  }, [stopListening]);

  // On final transcript: optional fuzzy match → onTranscript(fuzzyResult)
  useEffect(() => {
    if (state.status !== 'transcript' || !state.transcript) return;
    const cb = onTranscriptRef.current;
    if (!cb) return;
    let cancelled = false;
    fuzzyTranscript(state.transcript).then((text) => {
      if (!cancelled) cb(text);
    });
    return () => {
      cancelled = true;
    };
  }, [state.status, state.transcript]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    state,
    startListening,
    stopListening,
    reset,
    isSupported,
  };
};
