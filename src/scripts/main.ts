/**
 * Entry point for all client-side behaviour.
 *
 * Everything here is progressive enhancement: with JavaScript disabled the page
 * still renders every project, its title, description and tools — only the
 * dialog, the filter and the like counters are lost.
 *
 * Firebase (~100KB gzipped) is deliberately NOT part of this bundle; it is
 * dynamically imported once the browser is idle.
 */
import { initTheme } from './theme';
import { createSlideshow } from './slideshow';
import { initModal } from './modal';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ theme */
initTheme();

/* ----------------------------------------------------------- mobile menu */
function initMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  const openBtn = document.getElementById('menu-open');
  const closeBtn = document.getElementById('menu-close');
  if (!menu || !openBtn) return;

  const setOpen = (open: boolean) => {
    menu.classList.toggle('is-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      menu.querySelector<HTMLElement>('a')?.focus();
    } else {
      openBtn.focus();
    }
  };

  openBtn.addEventListener('click', () => setOpen(true));
  closeBtn?.addEventListener('click', () => setOpen(false));
  menu.querySelectorAll('[data-menu-link]').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
  });
}

/* ------------------------------------------------------------ work filter */
function initFilter() {
  const buttons = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));
  const readout = document.querySelector<HTMLElement>('[data-work-count]');
  if (buttons.length === 0 || cards.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter ?? 'all';

      buttons.forEach((other) => {
        const isActive = other === button;
        other.classList.toggle('is-active', isActive);
        other.setAttribute('aria-pressed', String(isActive));
      });

      let shown = 0;
      cards.forEach((card) => {
        const match = filter === 'all' || card.dataset.category === filter;
        // `hidden` rather than inline display, so the card's own grid-column
        // rules stay in the stylesheet where they belong.
        card.hidden = !match;
        if (match) shown++;
      });

      if (readout) readout.textContent = `Showing ${shown} of ${cards.length}`;
    });
  });
}

/* -------------------------------------------------------------- slideshows */
function initSlideshows() {
  document
    .querySelectorAll<HTMLElement>('.project-card [data-slideshow]')
    .forEach((container) => createSlideshow(container, { autoplay: !prefersReducedMotion }));
}

/* ---------------------------------------------------------------- videos */
/**
 * Play a video only while it is on screen. With preload="metadata" this means
 * an off-screen video barely downloads, instead of fourteen of them decoding at
 * once on load.
 */
function initVideos() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay refused — the sound button still works */
          });
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.25 }
  );

  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    const video = card.querySelector('video');
    if (!video) return;

    video.muted = true;
    observer.observe(video);

    const soundBtn = card.querySelector<HTMLButtonElement>('.sound-btn');
    soundBtn?.addEventListener('click', (event) => {
      event.stopPropagation();
      video.muted = !video.muted;
      soundBtn.classList.toggle('is-muted', video.muted);
      soundBtn.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
    });
  });

  // Never leave audio playing on a backgrounded tab.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) return;
    document.querySelectorAll('video').forEach((video) => video.pause());
  });
}

/* ------------------------------------------------------- scroll-linked UI */
function initScrollChrome() {
  const header = document.getElementById('site-header');
  const progress = document.getElementById('scroll-progress');
  const toTop = document.getElementById('to-top');

  toTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // Coalesce scroll work into one rAF per frame rather than running it on every
  // scroll event.
  let queued = false;
  const update = () => {
    queued = false;
    const y = window.scrollY;

    header?.classList.toggle('is-stuck', y > 8);
    toTop?.classList.toggle('is-visible', y > 600);

    if (progress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${scrollable > 0 ? (y / scrollable) * 100 : 0}%`;
    }
  };

  window.addEventListener(
    'scroll',
    () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  update();
}

/* --------------------------------------------------- active nav highlight */
function initActiveNav() {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]'));
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => Boolean(section));
  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        links.forEach((link) => link.classList.toggle('is-current', link.hash === id));
      });
    },
    // A band across the upper-middle of the viewport: the section occupying
    // that band is the one the visitor is reading.
    { rootMargin: '-25% 0px -60% 0px', threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------- scroll reveal */
function initReveal() {
  const targets = document.querySelectorAll<HTMLElement>('.reveal');
  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.remove('reveal'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      // Stagger items that enter together (a row of cards, say) so the grid
      // resolves in a sweep instead of a single pop.
      let batch = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = batch * 80;
        batch++;

        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-visible');
        obs.unobserve(el);

        // Once the entrance finishes, strip the reveal classes entirely: their
        // end state matches the default, and leaving a 620ms transform
        // transition in place would fight the card's hover lift.
        window.setTimeout(
          () => {
            el.classList.remove('reveal', 'is-visible');
            el.style.transitionDelay = '';
          },
          700 + delay
        );
      });
    },
    { threshold: 0.1 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------------- boot */
initMobileMenu();
initFilter();
initSlideshows();
initVideos();
initModal();
initScrollChrome();
initActiveNav();
initReveal();

/* --------------------------------------------------------- hero 3D model */
/**
 * three.js and the GLB are a separate chunk, fetched only once the page is
 * interactive and only where the model earns its bandwidth: not under reduced
 * motion, and not on a metered connection.
 */
function loadHero3D() {
  const host = document.getElementById('hero-3d');
  if (!host || prefersReducedMotion) return;

  const connection = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return;

  import('./hero3d')
    .then((module) => module.initHero3D(host))
    .catch(() => {
      /* chunk blocked or WebGL unavailable — the hero stands on its own */
    });
}

loadHero3D();

/* -------------------------------------------------------------- like system */
const loadLikes = () =>
  import('./likes')
    .then((module) => module.initLikeSystem())
    .catch(() => {
      /* offline or blocked — counts stay at their placeholder */
    });

if (typeof requestIdleCallback === 'function') {
  requestIdleCallback(() => loadLikes(), { timeout: 4000 });
} else {
  setTimeout(loadLikes, 2000);
}
