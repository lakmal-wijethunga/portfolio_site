/**
 * Slideshow controller.
 *
 * Exported as a factory so the same logic drives both the small cards in the
 * grid and the enlarged clone inside the modal, and so the modal's instance can
 * be destroyed on close instead of ticking forever in the background.
 */

const AUTOPLAY_MS = 3600;

export interface Slideshow {
  destroy(): void;
}

export function createSlideshow(container: HTMLElement, options: { autoplay?: boolean } = {}) {
  const { autoplay = true } = options;
  const slides = Array.from(container.querySelectorAll<HTMLElement>('.slide'));
  const dots = Array.from(container.querySelectorAll<HTMLElement>('.slide-dots span'));
  if (slides.length < 2) return { destroy() {} } satisfies Slideshow;

  let index = Math.max(
    0,
    slides.findIndex((slide) => slide.classList.contains('is-active'))
  );

  const show = (next: number) => {
    const target = (next + slides.length) % slides.length;
    slides[index]?.classList.remove('is-active');
    dots[index]?.classList.remove('is-active');
    index = target;
    slides[index]?.classList.add('is-active');
    dots[index]?.classList.add('is-active');
  };

  // Arrows must not bubble: the card's media has a full-bleed "open" button
  // behind them, and a stray click there would open the modal.
  const onPrev = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    show(index - 1);
    restart();
  };
  const onNext = (event: Event) => {
    event.stopPropagation();
    event.preventDefault();
    show(index + 1);
    restart();
  };

  const prevBtn = container.querySelector<HTMLButtonElement>('.slide-nav--prev');
  const nextBtn = container.querySelector<HTMLButtonElement>('.slide-nav--next');
  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);

  // --- autoplay, gated on visibility and hover ------------------------------
  let timer: number | undefined;
  let onScreen = !autoplay;
  let paused = false;

  const tick = () => {
    if (!onScreen || paused || document.hidden) return;
    show(index + 1);
  };

  const restart = () => {
    if (!autoplay) return;
    window.clearInterval(timer);
    timer = window.setInterval(tick, AUTOPLAY_MS);
  };

  const observer = autoplay
    ? new IntersectionObserver(
        ([entry]) => {
          onScreen = entry?.isIntersecting ?? false;
        },
        { threshold: 0.2 }
      )
    : undefined;
  observer?.observe(container);

  const onEnter = () => {
    paused = true;
  };
  const onLeave = () => {
    paused = false;
  };

  if (autoplay) {
    container.addEventListener('pointerenter', onEnter);
    container.addEventListener('pointerleave', onLeave);
    container.addEventListener('focusin', onEnter);
    container.addEventListener('focusout', onLeave);
    restart();
  }

  return {
    destroy() {
      window.clearInterval(timer);
      observer?.disconnect();
      prevBtn?.removeEventListener('click', onPrev);
      nextBtn?.removeEventListener('click', onNext);
      container.removeEventListener('pointerenter', onEnter);
      container.removeEventListener('pointerleave', onLeave);
      container.removeEventListener('focusin', onEnter);
      container.removeEventListener('focusout', onLeave);
    },
  } satisfies Slideshow;
}
