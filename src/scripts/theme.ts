/**
 * Theme switching.
 *
 * The initial theme is resolved by the inline script in BaseLayout.astro before
 * first paint — this module only handles user toggles and OS changes, so it can
 * load with the rest of the bundle.
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

function current(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme, persist: boolean) {
  document.documentElement.dataset.theme = theme;
  if (!persist) return;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — the theme still applies for this session */
  }
}

export function initTheme() {
  const toggles = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]');

  const sync = () => {
    const isDark = current() === 'dark';
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', String(isDark));
      btn.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
    });
  };

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      apply(current() === 'dark' ? 'light' : 'dark', true);
      sync();
    });
  });

  // Follow the OS only while the visitor has not made an explicit choice.
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (event) => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (stored === 'light' || stored === 'dark') return;
    apply(event.matches ? 'light' : 'dark', false);
    sync();
  });

  sync();
}
