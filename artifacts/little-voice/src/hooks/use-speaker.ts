import { useCallback, useRef } from 'react';
import { useAppStore } from '@/state/app-store';
import { useI18n } from '@/i18n';
import { useToast } from '@/hooks/use-toast';
import { sayParts, type VoiceIssue } from '@/lib/speech';
import { sentenceParts } from '@/lib/sentence';
import type { SentenceItem, SpeakPart } from '@/lib/types';

/** Speaks in the current language with recorded-voice-first, speech fallback, and gentle, throttled error notes. */
export function useSpeaker() {
  const { settings, sentence } = useAppStore();
  const { t, tIn, lang } = useI18n();
  const { toast } = useToast();
  const lastShown = useRef<Record<string, number>>({});

  const report = useCallback(
    (issue: VoiceIssue | null) => {
      if (!issue) return;
      const now = Date.now();
      if (now - (lastShown.current[issue] ?? 0) < 25_000) return;
      lastShown.current[issue] = now;
      const title =
        issue === 'noVoice'
          ? t('speech.noVoice', { lang: t(lang === 'ar' ? 'lang.ar' : 'lang.en') })
          : issue === 'playFailed'
            ? t('speech.playFailed')
            : t('speech.unsupported');
      toast({ title });
    },
    [t, lang, toast],
  );

  const sayPartsNow = useCallback(
    (parts: SpeakPart[]) => sayParts(parts, lang, settings.volume).then(report),
    [lang, settings.volume, report],
  );

  const sayItem = useCallback((item: SentenceItem) => sayPartsNow(item.parts[lang]), [sayPartsNow, lang]);
  const sayText = useCallback((text: string) => sayPartsNow([{ text }]), [sayPartsNow]);
  const saySentence = useCallback(
    () => (sentence.length ? sayPartsNow(sentenceParts(sentence, lang, tIn)) : Promise.resolve()),
    [sentence, sayPartsNow, lang, tIn],
  );

  return { sayItem, sayText, saySentence, sayPartsNow };
}
