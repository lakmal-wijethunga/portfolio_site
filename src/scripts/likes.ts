/**
 * Public like counters, stored in Firebase Realtime Database.
 *
 * Which projects THIS visitor liked lives in localStorage; the shared counts
 * live under likes/<projectId> (see firebase-rules.json). Project ids come from
 * the content filenames — renaming a YAML file resets that project's count.
 *
 * Dynamically imported from main.ts once the browser is idle.
 */
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, runTransaction } from 'firebase/database';

// Client-side Firebase config is public by design; access is limited by the
// database rules, not by keeping this secret.
const firebaseConfig = {
  apiKey: 'AIzaSyCCcSc_G4iLFeCcBYgu1ATYoXwadtSeoHU',
  authDomain: 'portfolio-like-counter.firebaseapp.com',
  databaseURL: 'https://portfolio-like-counter-default-rtdb.firebaseio.com',
  projectId: 'portfolio-like-counter',
  storageBucket: 'portfolio-like-counter.firebasestorage.app',
  messagingSenderId: '350022100734',
  appId: '1:350022100734:web:ed1fc480fe97427910e7af',
  measurementId: 'G-DPDTZMSDBB',
};

const STORAGE_KEY = 'projectLikes';

function readUserLikes(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function initLikeSystem() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const userLikes = readUserLikes();

  const modal = document.getElementById('project-modal');
  const modalLikeBtn = modal?.querySelector<HTMLButtonElement>('[data-modal-like]');
  const modalLikeCount = modal?.querySelector<HTMLElement>('[data-modal-like-count]');

  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    const projectId = card.id;
    const likeBtn = card.querySelector<HTMLButtonElement>('.like-btn');
    const countEl = card.querySelector<HTMLElement>('.like-count');
    if (!projectId || !likeBtn || !countEl) return;

    const setLiked = (liked: boolean) => {
      likeBtn.classList.toggle('is-liked', liked);
      likeBtn.setAttribute('aria-pressed', String(liked));
    };
    setLiked(Boolean(userLikes[projectId]));

    likeBtn.addEventListener('click', (event) => {
      event.stopPropagation();

      const nowLiked = !likeBtn.classList.contains('is-liked');
      setLiked(nowLiked);

      if (nowLiked) {
        userLikes[projectId] = true;
      } else {
        delete userLikes[projectId];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userLikes));
      } catch {
        /* storage unavailable (private mode) — the like still counts */
      }

      // A transaction, not a plain write: two visitors liking at the same moment
      // must not clobber each other's increment.
      runTransaction(ref(db, `likes/${projectId}`), (currentLikes: number | null) =>
        nowLiked ? (currentLikes ?? 0) + 1 : Math.max(0, (currentLikes ?? 0) - 1)
      );
    });

    onValue(ref(db, `likes/${projectId}`), (snapshot) => {
      const count = snapshot.val() ?? 0;
      countEl.textContent = String(count);

      // Mirror into the dialog if it is currently showing this project.
      if (
        modal?.classList.contains('is-open') &&
        modalLikeBtn?.dataset.projectId === projectId &&
        modalLikeCount
      ) {
        modalLikeCount.textContent = String(count);
        const liked = likeBtn.classList.contains('is-liked');
        modalLikeBtn.classList.toggle('is-liked', liked);
        modalLikeBtn.setAttribute('aria-pressed', String(liked));
      }
    });
  });
}
