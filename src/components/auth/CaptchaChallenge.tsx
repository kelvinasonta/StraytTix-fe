import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface CaptchaChallengeHandle {
  execute: () => Promise<string>;
  reset: () => void;
}

interface CaptchaChallengeProps {
  provider: 'none' | 'recaptcha' | 'turnstile' | string;
  siteKey?: string | null;
  onVerify?: (token: string) => void;
  onError?: (error: any) => void;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement | string, parameters: Record<string, any>) => number;
      execute: (opt_widget_id?: number | string, action?: Record<string, any>) => Promise<string> | void;
      reset: (opt_widget_id?: number) => void;
      getResponse: (opt_widget_id?: number) => string;
    };
    turnstile?: {
      render: (container: HTMLElement | string, parameters: Record<string, any>) => string;
      execute: (container?: HTMLElement | string, parameters?: Record<string, any>) => void;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export const CaptchaChallenge = forwardRef<CaptchaChallengeHandle, CaptchaChallengeProps>(
  ({ provider, siteKey, onVerify, onError, theme = 'dark' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<any>(null);
    const resolvePromiseRef = useRef<((token: string) => void) | null>(null);
    const rejectPromiseRef = useRef<((err: any) => void) | null>(null);

    // Expose imperative methods to parent (e.g. trigger verify on click)
    useImperativeHandle(ref, () => ({
      execute: () => {
        if (provider === 'none' || !siteKey) {
          return Promise.resolve('');
        }

        return new Promise<string>((resolve, reject) => {
          resolvePromiseRef.current = resolve;
          rejectPromiseRef.current = reject;

          try {
            if (provider === 'recaptcha' && window.grecaptcha) {
              if (widgetIdRef.current !== null) {
                const response = window.grecaptcha.getResponse(widgetIdRef.current);
                if (response) {
                  resolve(response);
                  return;
                }
                window.grecaptcha.execute(widgetIdRef.current);
              }
            } else if (provider === 'turnstile' && window.turnstile) {
              if (widgetIdRef.current !== null) {
                const response = window.turnstile.getResponse(widgetIdRef.current);
                if (response) {
                  resolve(response);
                  return;
                }
                window.turnstile.execute(widgetIdRef.current);
              }
            } else {
              // Scripts still loading or not ready
              reject(new Error('Captcha challenge is loading. Please try again.'));
            }
          } catch (err) {
            reject(err);
          }
        });
      },
      reset: () => {
        try {
          if (provider === 'recaptcha' && window.grecaptcha && widgetIdRef.current !== null) {
            window.grecaptcha.reset(widgetIdRef.current);
          } else if (provider === 'turnstile' && window.turnstile && widgetIdRef.current !== null) {
            window.turnstile.reset(widgetIdRef.current);
          }
        } catch {
          // ignore reset error
        }
      },
    }));

    useEffect(() => {
      if (provider === 'none' || !siteKey) {
        return;
      }

      let isMounted = true;

      const handleToken = (token: string) => {
        if (onVerify) {
          onVerify(token);
        }
        if (resolvePromiseRef.current) {
          resolvePromiseRef.current(token);
          resolvePromiseRef.current = null;
          rejectPromiseRef.current = null;
        }
      };

      const handleError = (error: any) => {
        if (onError) {
          onError(error);
        }
        if (rejectPromiseRef.current) {
          rejectPromiseRef.current(error);
          resolvePromiseRef.current = null;
          rejectPromiseRef.current = null;
        }
      };

      // 1. Google reCAPTCHA
      if (provider === 'recaptcha') {
        const scriptId = 'google-recaptcha-v2-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const initRecaptcha = () => {
          if (!isMounted || !containerRef.current || !window.grecaptcha) {
            return;
          }
          window.grecaptcha.ready(() => {
            if (!isMounted || !containerRef.current) return;
            try {
              if (widgetIdRef.current === null) {
                widgetIdRef.current = window.grecaptcha!.render(containerRef.current, {
                  sitekey: siteKey,
                  theme,
                  size: 'invisible',
                  callback: (token: string) => handleToken(token),
                  'error-callback': () => handleError(new Error('reCAPTCHA failed')),
                });
              }
            } catch (err) {
              console.error('reCAPTCHA render error:', err);
            }
          });
        };

        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          script.onload = () => initRecaptcha();
          document.head.appendChild(script);
        } else {
          initRecaptcha();
        }
      }

      // 2. Cloudflare Turnstile
      if (provider === 'turnstile') {
        const scriptId = 'cloudflare-turnstile-script';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const initTurnstile = () => {
          if (!isMounted || !containerRef.current || !window.turnstile) {
            return;
          }
          try {
            if (widgetIdRef.current === null) {
              widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: siteKey,
                theme,
                size: 'invisible',
                callback: (token: string) => handleToken(token),
                'error-callback': () => handleError(new Error('Cloudflare Turnstile challenge failed')),
              });
            }
          } catch (err) {
            console.error('Turnstile render error:', err);
          }
        };

        if (!script) {
          script = document.createElement('script');
          script.id = scriptId;
          script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
          script.async = true;
          script.defer = true;
          script.onload = () => initTurnstile();
          document.head.appendChild(script);
        } else {
          initTurnstile();
        }
      }

      return () => {
        isMounted = false;
        widgetIdRef.current = null;
      };
    }, [provider, siteKey, theme, onVerify, onError]);

    if (provider === 'none' || !siteKey) {
      return null;
    }

    return (
      <div className="relative my-1">
        <div ref={containerRef} className="flex justify-center" />
      </div>
    );
  }
);

