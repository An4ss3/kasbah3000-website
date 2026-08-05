export interface TurnstileRenderOptions {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  size?: 'normal' | 'compact' | 'flexible';
}

export interface TurnstileApi {
  render(container: HTMLElement, options: TurnstileRenderOptions): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_ID = 'cloudflare-turnstile-script';
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
const LOAD_TIMEOUT_MS = 15_000;
let loaderPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<TurnstileApi>((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (script && script.dataset.turnstileState !== 'loading') {
      script.remove();
      script = null;
    }

    let settled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const cleanup = () => {
      clearTimeout(timeoutId);
      script?.removeEventListener('load', handleLoad);
      script?.removeEventListener('error', handleError);
    };
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (script) {
        script.dataset.turnstileState = 'failed';
        script.remove();
      }
      loaderPromise = null;
      reject(new Error(message));
    };
    const handleLoad = () => {
      if (settled) return;
      if (!window.turnstile) {
        fail('Turnstile API unavailable');
        return;
      }

      settled = true;
      cleanup();
      if (script) script.dataset.turnstileState = 'loaded';
      resolve(window.turnstile);
    };
    const handleError = () => fail('Turnstile script failed to load');

    const created = !script;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.turnstileState = 'loading';
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    timeoutId = setTimeout(() => fail('Turnstile script load timed out'), LOAD_TIMEOUT_MS);

    if (created) document.head.append(script);
  });

  return loaderPromise;
}
