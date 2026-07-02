/**
 * All client-side behavior for the single-page portfolio:
 * mobile nav, project filter, modal, slideshows, video playback,
 * scroll effects, reveal animations, and the parallax card tilt.
 * The Firebase like system is loaded lazily (see likes.ts).
 */

// ---------------------------------------------------------------- mobile nav
const hamburger = document.getElementById('hamburger');
const navbar = document.getElementById('navbar');

if (hamburger && navbar) {
  hamburger.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('.navbar a').forEach((link) => {
  link.addEventListener('click', () => {
    navbar?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
  });
});

// ------------------------------------------------------------ project filter
const filterBtns = document.querySelectorAll<HTMLButtonElement>('.filter-btn');
const projectCards = document.querySelectorAll<HTMLElement>('.project-card');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((other) => {
      other.classList.remove('active');
      other.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    const filterValue = btn.dataset.filter;

    projectCards.forEach((card) => {
      const show = filterValue === 'all' || card.dataset.category === filterValue;
      card.style.display = show ? 'block' : 'none';
    });
  });
});

// -------------------------------------------------------------- slideshows
// Wires prev/next buttons inside a slideshow container. Used for the cards
// in the grid and re-used for the cloned slideshow inside the modal.
function wireSlideshowControls(container: HTMLElement) {
  const step = (direction: number, e: Event) => {
    e.stopPropagation();
    const slides = container.querySelectorAll('.slide');
    let currentIndex = 0;
    slides.forEach((slide, index) => {
      if (slide.classList.contains('active')) {
        currentIndex = index;
        slide.classList.remove('active', 'zoom-effect');
      }
    });
    const newIndex = (currentIndex + direction + slides.length) % slides.length;
    slides[newIndex]?.classList.add('active', 'zoom-effect');
  };

  container.querySelector('.prev')?.addEventListener('click', (e) => step(-1, e));
  container.querySelector('.next')?.addEventListener('click', (e) => step(1, e));
}

document
  .querySelectorAll<HTMLElement>('.project-card .slideshow-container')
  .forEach((container) => {
    wireSlideshowControls(container);

    // Auto-advance only while the slideshow is actually on screen
    let onScreen = false;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry?.isIntersecting ?? false;
      },
      { threshold: 0.2 }
    );
    visibilityObserver.observe(container);

    const slides = container.querySelectorAll('.slide');
    let slideIndex = 0;
    setInterval(() => {
      if (!onScreen || container.closest('.project-card:hover')) return;
      slides[slideIndex]?.classList.remove('active', 'zoom-effect');
      slideIndex = (slideIndex + 1) % slides.length;
      slides[slideIndex]?.classList.add('active', 'zoom-effect');
    }, 3200);
  });

// ------------------------------------------------------------ video playback
// Play videos ONLY while they're on screen. Off-screen videos stay paused
// (and, with preload="metadata", barely download) — instead of all videos
// downloading + decoding at once on page load.
const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.25 }
);

projectCards.forEach((card) => {
  const video = card.querySelector('video');
  const soundButton = card.querySelector<HTMLButtonElement>('.video-sound-btn');
  if (!video) return;

  video.muted = true;
  videoObserver.observe(video);

  soundButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;
    soundButton.classList.toggle('muted', video.muted);
    soundButton.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
  });
});

// ------------------------------------------------------------- project modal
const modal = document.getElementById('project-modal');

if (modal) {
  const closeModalBtn = modal.querySelector<HTMLButtonElement>('.modal-close')!;
  const modalMediaContainer = modal.querySelector('.modal-media-container')!;
  const modalTitle = modal.querySelector('.modal-title')!;
  const modalLikeBtn = modal.querySelector<HTMLButtonElement>('.modal-like-btn')!;
  const modalLikeCount = modal.querySelector('.modal-like-count')!;
  const modalDescription = modal.querySelector('.modal-description')!;
  const modalToolsContainer = modal.querySelector('.modal-tools-container')!;
  const modalButtons = modal.querySelector('.modal-buttons')!;

  let lastFocused: HTMLElement | null = null;

  const openModal = (card: HTMLElement) => {
    const originalLikeBtn = card.querySelector('.card-like-btn');
    const originalLikeCount = originalLikeBtn?.querySelector('.card-like-count')?.textContent;

    if (originalLikeBtn) {
      modalLikeBtn.dataset.projectId = card.id;
      modalLikeCount.textContent = originalLikeCount ?? '…';
      const liked = originalLikeBtn.classList.contains('liked');
      modalLikeBtn.classList.toggle('liked', liked);
      modalLikeBtn.setAttribute('aria-pressed', String(liked));
    }

    const mediaElement = card.querySelector('img, video, .slideshow-container');
    const title = card.querySelector('.project-overlay h3')?.textContent ?? 'Project Details';
    const description =
      card.querySelector('.project-overlay p')?.textContent ?? 'No description available.';
    const buttons = card.querySelector('.project-buttons');
    const toolsString = card.dataset.tools ?? '';

    modalMediaContainer.innerHTML = '';
    modalToolsContainer.innerHTML = '';
    modalButtons.innerHTML = '';

    if (mediaElement) {
      const clonedMedia = mediaElement.cloneNode(true) as HTMLElement;
      if (clonedMedia.tagName === 'VIDEO') {
        const video = clonedMedia as HTMLVideoElement;
        video.muted = false;
        video.controls = true;
        video.autoplay = true;
      }
      // The card images are sized for the grid; the modal shows them much
      // larger, so relax `sizes` so the browser picks a bigger srcset entry.
      clonedMedia.querySelectorAll('img').forEach((img) => {
        img.sizes = '(min-width: 1000px) 900px, 90vw';
      });
      if (clonedMedia.tagName === 'IMG') {
        (clonedMedia as HTMLImageElement).sizes = '(min-width: 1000px) 900px, 90vw';
      }
      if (clonedMedia.classList.contains('slideshow-container')) {
        wireSlideshowControls(clonedMedia);
      }
      modalMediaContainer.appendChild(clonedMedia);
    }

    modalTitle.textContent = title;
    modalDescription.textContent = description;

    if (toolsString) {
      const toolsTitle = document.createElement('h4');
      toolsTitle.textContent = 'Tools Used';
      modalToolsContainer.appendChild(toolsTitle);
      const tagsWrapper = document.createElement('div');
      tagsWrapper.className = 'modal-tools-tags';
      toolsString.split(',').forEach((toolName) => {
        const toolTag = document.createElement('span');
        toolTag.className = 'modal-tool-tag';
        toolTag.textContent = toolName.trim();
        tagsWrapper.appendChild(toolTag);
      });
      modalToolsContainer.appendChild(tagsWrapper);
    }
    if (buttons) {
      modalButtons.innerHTML = buttons.innerHTML;
    }

    lastFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add('modal-open');
    modal.classList.add('active');
    // The overlay transitions from visibility:hidden — focus() is a no-op
    // until the browser has applied the .active styles, so defer it a frame.
    requestAnimationFrame(() => requestAnimationFrame(() => closeModalBtn.focus()));
  };

  const closeModal = () => {
    modal.querySelector('video')?.pause();
    document.body.classList.remove('modal-open');
    modal.classList.remove('active');
    lastFocused?.focus();
  };

  projectCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (
        (e.target as HTMLElement).closest('.card-like-btn, .video-sound-btn, a, .prev, .next')
      ) {
        return;
      }
      openModal(card);
    });
    // The card acts as a button — make it keyboard-operable
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // The modal like button proxies to the card's like button so all
  // Firebase/localStorage logic lives in one place (likes.ts).
  modalLikeBtn.addEventListener('click', () => {
    const projectId = modalLikeBtn.dataset.projectId;
    if (!projectId) return;
    document
      .getElementById(projectId)
      ?.querySelector<HTMLButtonElement>('.card-like-btn')
      ?.click();
  });

  closeModalBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  // Keep keyboard focus inside the dialog while it's open
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || !modal.classList.contains('active')) return;
    const focusables = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, video[controls]'
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// ---------------------------------------------------- scroll-linked elements
const progressBar = document.getElementById('scroll-progress');
const backToTop = document.getElementById('back-to-top');
const header = document.querySelector('header');

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener(
  'scroll',
  () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('sticky', scrollY > 0);

    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }

    backToTop?.classList.toggle('show', scrollY > 500);
  },
  { passive: true }
);

// --------------------------------------------------------- reveal on scroll
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    // Stagger elements that enter the viewport together (e.g. a row of cards)
    let batchIndex = 0;
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const delay = batchIndex * 90;
      batchIndex++;

      el.style.transitionDelay = `${delay}ms`;
      el.classList.add('visible');
      observer.unobserve(el);

      // Once the entrance finishes, drop the reveal classes entirely.
      // Their final state matches the default state, and keeping the
      // 0.8s transform transition around would fight the hover tilt.
      setTimeout(() => {
        el.classList.remove('reveal', 'visible');
        el.style.transitionDelay = '';
      }, 850 + delay);
    });
  },
  { root: null, threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// -------------------------------------------------------------- card tilt
// Parallax tilt — rAF-driven with lerp smoothing. Raw mousemove values snap
// the card around; instead we ease the current rotation toward a target every
// frame. Skipped for touch devices (no hover) and reduced-motion users.
function initParallaxEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

  const MAX_TILT = 4; // degrees
  const HOVER_SCALE = 1.02; // subtle lift while hovered
  const EASE = 0.12; // lerp factor per frame (lower = heavier feel)

  projectCards.forEach((card) => {
    const current = { rx: 0, ry: 0, s: 1 };
    const target = { rx: 0, ry: 0, s: 1 };
    let rafId: number | null = null;

    const render = () => {
      current.rx += (target.rx - current.rx) * EASE;
      current.ry += (target.ry - current.ry) * EASE;
      current.s += (target.s - current.s) * EASE;

      const atRest =
        target.s === 1 &&
        Math.abs(current.rx) < 0.02 &&
        Math.abs(current.ry) < 0.02 &&
        Math.abs(current.s - 1) < 0.002;

      if (atRest) {
        // Fully settled: clear inline styles so CSS owns the card again
        card.style.transform = '';
        card.style.willChange = '';
        rafId = null;
        return;
      }

      card.style.transform = `perspective(900px) rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg) scale3d(${current.s.toFixed(3)}, ${current.s.toFixed(3)}, 1)`;
      rafId = requestAnimationFrame(render);
    };

    const wake = () => {
      if (rafId === null) rafId = requestAnimationFrame(render);
    };

    card.addEventListener('pointerenter', () => {
      card.style.willChange = 'transform';
      target.s = HOVER_SCALE;
      wake();
    });

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 .. 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      target.rx = -py * MAX_TILT * 2;
      target.ry = px * MAX_TILT * 2;
      wake();
    });

    card.addEventListener('pointerleave', () => {
      target.rx = 0;
      target.ry = 0;
      target.s = 1;
      wake(); // eases back to rest, then releases the inline transform
    });
  });
}
initParallaxEffect();

// ------------------------------------------------------------- like system
// Firebase is ~100KB gzipped — load it after everything else is idle instead
// of blocking first paint. Counts show "…" until it arrives.
const loadLikes = () => import('./likes').then((m) => m.initLikeSystem());
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => loadLikes(), { timeout: 4000 });
} else {
  setTimeout(loadLikes, 2000);
}
