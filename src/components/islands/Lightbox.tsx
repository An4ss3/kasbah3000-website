import './Lightbox.css';

import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { LightboxProps } from '../../types/components';

type LightboxPhase = 'closed' | 'opening' | 'open' | 'closing';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), video[controls]';

const SWIPE_THRESHOLD_PX = 50;

export default function Lightbox({
  items,
  rootId,
  lang,
  label,
  closeLabel,
  previousLabel,
  nextLabel,
  zoomInLabel,
  zoomOutLabel,
  counterLabel,
}: LightboxProps) {
  const [phase, setPhase] = useState<LightboxPhase>('closed');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const previousOverflowRef = useRef<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isActive = phase !== 'closed';

  const finishClose = useCallback(() => {
    setPhase('closed');
    setZoomed(false);
    triggerRef.current?.focus();
    triggerRef.current = null;
  }, []);

  const closeLightbox = useCallback(() => {
    if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);

    setPhase((currentPhase) => {
      if (currentPhase === 'closed' || currentPhase === 'closing') return currentPhase;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      closeTimerRef.current = setTimeout(finishClose, reducedMotion ? 120 : 250);
      return 'closing';
    });
  }, [finishClose]);

  const showPrevious = useCallback(() => {
    setCurrentIndex((index) => (index === 0 ? items.length - 1 : index - 1));
    setZoomed(false);
  }, [items.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((index) => (index === items.length - 1 ? 0 : index + 1));
    setZoomed(false);
  }, [items.length]);

  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const handleGalleryClick = (event: Event) => {
      if (!(event.target instanceof Element)) return;

      const trigger = event.target.closest<HTMLButtonElement>('[data-lightbox-index]');
      if (!trigger || !root.contains(trigger)) return;

      const requestedIndex = Number.parseInt(trigger.dataset.lightboxIndex ?? '', 10);
      if (
        !Number.isInteger(requestedIndex) ||
        requestedIndex < 0 ||
        requestedIndex >= items.length
      ) {
        return;
      }

      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);

      triggerRef.current = trigger;
      setCurrentIndex(requestedIndex);
      setZoomed(false);
      setPhase('opening');
      animationFrameRef.current = requestAnimationFrame(() => setPhase('open'));
    };

    root.addEventListener('click', handleGalleryClick);
    return () => root.removeEventListener('click', handleGalleryClick);
  }, [items.length, rootId]);

  useEffect(() => {
    if (!isActive) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflowRef.current ?? '';
      previousOverflowRef.current = null;
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      // Native media controls own arrow and Home/End keys for seeking and volume,
      // so navigation shortcuts must not be intercepted while the video has focus.
      const target = event.target;
      const isMediaFocused = target instanceof HTMLMediaElement;

      if (!isMediaFocused && event.key === 'ArrowLeft' && items.length > 1) {
        event.preventDefault();
        showPrevious();
        return;
      }

      if (!isMediaFocused && event.key === 'ArrowRight' && items.length > 1) {
        event.preventDefault();
        showNext();
        return;
      }

      if (!isMediaFocused && event.key === 'Home') {
        event.preventDefault();
        setCurrentIndex(0);
        setZoomed(false);
        return;
      }

      if (!isMediaFocused && event.key === 'End') {
        event.preventDefault();
        setCurrentIndex(items.length - 1);
        setZoomed(false);
        return;
      }

      if (event.key !== 'Tab') return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (element) =>
          !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true'
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === first || !dialog.contains(activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (activeElement === last || !dialog.contains(activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeLightbox, isActive, items.length, showNext, showPrevious]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      if (previousOverflowRef.current !== null) {
        document.body.style.overflow = previousOverflowRef.current;
      }
      triggerRef.current?.focus();
    },
    []
  );

  const handleTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: TouchEvent) => {
    const start = touchStartRef.current;
    const touch = event.changedTouches[0];
    touchStartRef.current = null;
    if (!start || !touch || items.length < 2) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    if (deltaX > 0) showPrevious();
    else showNext();
  };

  if (!isActive || items.length === 0) {
    return <span class="lightbox__sentinel" aria-hidden="true" />;
  }

  const item = items[currentIndex] ?? items[0];
  if (!item) return <span class="lightbox__sentinel" aria-hidden="true" />;

  const counter = counterLabel
    .replace('{current}', String(currentIndex + 1))
    .replace('{total}', String(items.length));
  const isOpen = phase === 'open';
  const zoomLabel = zoomed ? zoomOutLabel : zoomInLabel;

  return (
    <>
      <span class="lightbox__sentinel" aria-hidden="true" />
      <div
        ref={dialogRef}
        class={`lightbox${isOpen ? ' lightbox--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        lang={lang}
        tabIndex={-1}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeLightbox();
        }}
      >
        <div class="lightbox__surface">
          <header class="lightbox__header">
            <p class="lightbox__title">{item.title}</p>
            <button
              ref={closeButtonRef}
              type="button"
              class="lightbox__button"
              aria-label={closeLabel}
              onClick={closeLightbox}
            >
              ×
            </button>
          </header>

          <div class="lightbox__stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {items.length > 1 && (
              <button
                type="button"
                class="lightbox__button lightbox__previous"
                aria-label={previousLabel}
                onClick={showPrevious}
              >
                ←
              </button>
            )}

            <div class="lightbox__media">
              {item.isVideo ? (
                <video
                  key={item.src}
                  class="lightbox__video"
                  src={item.src}
                  poster={item.poster}
                  controls
                  playsInline
                  preload="none"
                />
              ) : (
                <button
                  type="button"
                  class="lightbox__media-button"
                  aria-label={`${zoomLabel} — ${item.title}`}
                  aria-pressed={zoomed}
                  onClick={() => setZoomed((value) => !value)}
                >
                  <img
                    class={`lightbox__image${zoomed ? ' lightbox__image--zoomed' : ''}`}
                    src={item.src}
                    alt={item.title}
                    width="1600"
                    height="1200"
                  />
                </button>
              )}
            </div>

            {items.length > 1 && (
              <button
                type="button"
                class="lightbox__button lightbox__next"
                aria-label={nextLabel}
                onClick={showNext}
              >
                →
              </button>
            )}
          </div>

          <footer class="lightbox__footer">
            <p class="lightbox__counter" aria-live="polite">
              {counter}
            </p>
            {!item.isVideo && <p class="lightbox__hint">{zoomLabel}</p>}
          </footer>
        </div>
      </div>
    </>
  );
}
