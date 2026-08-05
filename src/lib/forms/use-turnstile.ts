import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  loadTurnstile,
  type TurnstileApi,
  type TurnstileRenderOptions,
} from '@lib/forms/turnstile-client';

type StatusUpdater = (value: string | ((current: string) => string)) => void;

interface UseTurnstileOptions {
  siteKey: string;
  action: string;
  language: string;
  theme: NonNullable<TurnstileRenderOptions['theme']>;
  size: NonNullable<TurnstileRenderOptions['size']>;
  requiredMessage: string;
  unavailableMessage: string;
  setStatus: StatusUpdater;
}

interface UseTurnstileResult {
  containerRef: { current: HTMLDivElement | null };
  token: string;
  unavailable: boolean;
  reset: () => void;
  announceRequired: () => void;
  announceUnavailable: () => void;
}

export function useTurnstile({
  siteKey,
  action,
  language,
  theme,
  size,
  requiredMessage,
  unavailableMessage,
  setStatus,
}: UseTurnstileOptions): UseTurnstileResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const announcedStatusRef = useRef<string | null>(null);
  const [token, setToken] = useState('');
  const [unavailable, setUnavailable] = useState(false);

  const announce = useCallback(
    (message: string) => {
      announcedStatusRef.current = message;
      setStatus(message);
    },
    [setStatus]
  );

  const clearTurnstileStatus = useCallback(() => {
    const staleStatus = announcedStatusRef.current;
    if (!staleStatus) return;

    setStatus((current) => (current === staleStatus ? '' : current));
    announcedStatusRef.current = null;
  }, [setStatus]);

  const announceRequired = useCallback(
    () => announce(requiredMessage),
    [announce, requiredMessage]
  );
  const announceUnavailable = useCallback(
    () => announce(unavailableMessage),
    [announce, unavailableMessage]
  );

  const reset = useCallback(() => {
    setToken('');
    if (!apiRef.current || !widgetIdRef.current) return;

    try {
      apiRef.current.reset(widgetIdRef.current);
    } catch {
      setUnavailable(true);
      announceUnavailable();
    }
  }, [announceUnavailable]);

  useEffect(() => {
    const container = containerRef.current;
    const normalizedSiteKey = siteKey.trim();
    setToken('');

    if (!container || !normalizedSiteKey) {
      setUnavailable(true);
      announceUnavailable();
      return;
    }

    let active = true;
    let api: TurnstileApi | null = null;
    let widgetId: string | null = null;
    setUnavailable(false);

    void loadTurnstile()
      .then((loadedApi) => {
        if (!active || !containerRef.current) return;

        api = loadedApi;
        apiRef.current = loadedApi;
        widgetId = loadedApi.render(containerRef.current, {
          sitekey: normalizedSiteKey,
          action,
          language,
          theme,
          size,
          callback: (nextToken) => {
            if (!active) return;
            setToken(nextToken);
            setUnavailable(false);
            clearTurnstileStatus();
          },
          'expired-callback': () => {
            if (!active) return;
            setToken('');
            announceRequired();
          },
          'error-callback': () => {
            if (!active) return;
            setToken('');
            setUnavailable(true);
            announceUnavailable();
          },
        });
        widgetIdRef.current = widgetId;
      })
      .catch(() => {
        if (!active) return;
        setToken('');
        setUnavailable(true);
        announceUnavailable();
      });

    return () => {
      active = false;
      if (api && widgetId) {
        try {
          api.remove(widgetId);
        } catch {
          // The widget may already have removed itself after an asynchronous failure.
        }
      }
      if (widgetIdRef.current === widgetId) widgetIdRef.current = null;
      if (apiRef.current === api) apiRef.current = null;
    };
  }, [
    action,
    announceRequired,
    announceUnavailable,
    clearTurnstileStatus,
    language,
    siteKey,
    size,
    theme,
  ]);

  return {
    containerRef,
    token,
    unavailable,
    reset,
    announceRequired,
    announceUnavailable,
  };
}
