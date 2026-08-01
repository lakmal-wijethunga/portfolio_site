/**
 * Project dialog.
 *
 * Content comes from the card's `data-*` attributes, so the dialog does not care
 * how the card is laid out. Media is cloned from the card because the srcset has
 * already been generated at build time — cloning re-uses those exact candidates
 * instead of shipping a second set of images.
 */
import { createSlideshow, type Slideshow } from './slideshow';

export function initModal() {
  const modal = document.getElementById('project-modal');
  if (!modal) return;

  const panel = modal.querySelector<HTMLElement>('.modal-panel')!;
  const closeBtn = modal.querySelector<HTMLButtonElement>('.modal-close')!;
  const mediaBox = modal.querySelector<HTMLElement>('[data-modal-media]')!;
  const categoryEl = modal.querySelector<HTMLElement>('[data-modal-category]')!;
  const titleEl = modal.querySelector<HTMLElement>('[data-modal-title]')!;
  const descEl = modal.querySelector<HTMLElement>('[data-modal-description]')!;
  const toolsBlock = modal.querySelector<HTMLElement>('[data-modal-tools-block]')!;
  const toolsEl = modal.querySelector<HTMLElement>('[data-modal-tools]')!;
  const linksEl = modal.querySelector<HTMLElement>('[data-modal-links]')!;
  const fullLink = modal.querySelector<HTMLAnchorElement>('[data-modal-full]')!;
  const likeBtn = modal.querySelector<HTMLButtonElement>('[data-modal-like]')!;
  const likeCount = modal.querySelector<HTMLElement>('[data-modal-like-count]')!;

  let lastFocused: HTMLElement | null = null;
  let activeSlideshow: Slideshow | null = null;

  // Arrow consts rather than function declarations: a hoisted `function` loses
  // the `if (!modal) return` narrowing above, since TypeScript cannot prove it
  // is only called after that guard.

  // --- media ----------------------------------------------------------------
  const cloneMedia = (card: HTMLElement) => {
    mediaBox.innerHTML = '';
    activeSlideshow?.destroy();
    activeSlideshow = null;

    const source = card.querySelector('.slideshow, .card-media > img, .card-media > video');
    if (!source) return;

    const clone = source.cloneNode(true) as HTMLElement;

    // The card's images were sized for a grid cell; the dialog shows them far
    // larger, so relax `sizes` to let the browser pick a bigger candidate.
    const relax = (img: HTMLImageElement) => {
      img.sizes = '(min-width: 960px) 900px, 96vw';
      img.loading = 'eager';
    };
    if (clone instanceof HTMLImageElement) relax(clone);
    clone.querySelectorAll('img').forEach(relax);

    if (clone instanceof HTMLVideoElement) {
      clone.muted = false;
      clone.controls = true;
      clone.autoplay = true;
      clone.loop = true;
    }

    mediaBox.appendChild(clone);

    if (clone.classList.contains('slideshow')) {
      // No autoplay in the dialog: someone who opened a project is looking at a
      // specific frame, and having it slide away is hostile.
      activeSlideshow = createSlideshow(clone, { autoplay: false });
    }
  };

  // --- open / close ---------------------------------------------------------
  const open = (card: HTMLElement) => {
    const data = card.dataset;

    categoryEl.textContent = data.categoryLabel ?? '';
    titleEl.textContent = data.title ?? 'Project';
    descEl.textContent = data.description ?? '';

    const tools = (data.tools ?? '')
      .split(',')
      .map((tool) => tool.trim())
      .filter(Boolean);
    toolsEl.replaceChildren(
      ...tools.map((tool) => {
        const tag = document.createElement('span');
        tag.className = 'tool-tag';
        tag.textContent = tool;
        return tag;
      })
    );
    toolsBlock.hidden = tools.length === 0;

    fullLink.href = data.href ?? '#';
    fullLink.setAttribute('aria-label', `View the full ${data.title ?? 'project'} page`);

    let links: { label: string; url: string }[] = [];
    try {
      links = JSON.parse(data.links ?? '[]');
    } catch {
      links = [];
    }
    linksEl.replaceChildren(
      ...links.map((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'btn btn--ghost';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.textContent = link.label;
        return anchor;
      })
    );

    // Mirror the card's like state; likes.ts keeps the two in sync afterwards.
    const cardLike = card.querySelector<HTMLButtonElement>('.like-btn');
    likeBtn.dataset.projectId = card.id;
    likeCount.textContent = cardLike?.querySelector('.like-count')?.textContent ?? '…';
    const liked = cardLike?.classList.contains('is-liked') ?? false;
    likeBtn.classList.toggle('is-liked', liked);
    likeBtn.setAttribute('aria-pressed', String(liked));

    cloneMedia(card);

    lastFocused = document.activeElement as HTMLElement | null;
    document.body.classList.add('no-scroll');
    modal.classList.add('is-open');
    // The panel transitions out of visibility:hidden, so focus() is a no-op
    // until the browser has applied .is-open — defer it two frames.
    requestAnimationFrame(() => requestAnimationFrame(() => closeBtn.focus()));
  };

  const close = () => {
    mediaBox.querySelector('video')?.pause();
    activeSlideshow?.destroy();
    activeSlideshow = null;
    document.body.classList.remove('no-scroll');
    modal.classList.remove('is-open');
    lastFocused?.focus();
    // Drop the cloned media so an off-screen video can never keep buffering.
    window.setTimeout(() => {
      if (!modal.classList.contains('is-open')) mediaBox.innerHTML = '';
    }, 400);
  };

  // --- wiring ---------------------------------------------------------------
  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    card.querySelector<HTMLAnchorElement>('[data-open]')?.addEventListener('click', (event) => {
      // The trigger is a real <a href="/work/…/">, so a plain click is upgraded
      // to the dialog while every other kind of click keeps its native
      // behaviour: ctrl/cmd/shift-click opens the project page in a new tab,
      // and with JavaScript off the link simply navigates.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      event.preventDefault();
      open(card);
    });

    // Convenience for pointer users: clicking anywhere on the caption opens the
    // project too. Keyboard users get the single, explicit button above.
    card.querySelector<HTMLElement>('.card-body')?.addEventListener('click', (event) => {
      if ((event.target as HTMLElement).closest('button, a')) return;
      open(card);
    });
  });

  // The dialog's like button proxies to the card's, so all Firebase and
  // localStorage logic stays in likes.ts.
  likeBtn.addEventListener('click', () => {
    const id = likeBtn.dataset.projectId;
    if (!id) return;
    document.getElementById(id)?.querySelector<HTMLButtonElement>('.like-btn')?.click();
  });

  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) close();
  });

  // Focus trap
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, video[controls], [tabindex]:not([tabindex="-1"])'
      )
    ).filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (focusables.length === 0) return;

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
