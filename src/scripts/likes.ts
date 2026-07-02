/**
 * Public like counters, stored in Firebase Realtime Database.
 * Which projects THIS visitor liked lives in localStorage; the shared
 * counts live under likes/<projectId> (see firebase-rules.json).
 *
 * This module is dynamically imported from main.ts after page load.
 */
import { initializeApp } from 'firebase/app';
import { getDatabase, onValue, ref, runTransaction } from 'firebase/database';

// Client-side Firebase config is public by design; access is limited
// by the database rules, not by this config.
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

function readUserLikes(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem('projectLikes') ?? '{}');
  } catch {
    return {};
  }
}

export function initLikeSystem() {
  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const userLikes = readUserLikes();

  const modal = document.getElementById('project-modal');
  const modalLikeBtn = modal?.querySelector<HTMLButtonElement>('.modal-like-btn');
  const modalLikeCount = modal?.querySelector('.modal-like-count');

  document.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
    const projectId = card.id;
    const likeBtn = card.querySelector<HTMLButtonElement>('.card-like-btn');
    const countSpan = card.querySelector('.card-like-count');
    if (!projectId || !likeBtn || !countSpan) return;

    const setLiked = (liked: boolean) => {
      likeBtn.classList.toggle('liked', liked);
      likeBtn.setAttribute('aria-pressed', String(liked));
    };
    setLiked(Boolean(userLikes[projectId]));

    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      const isNowLiked = !likeBtn.classList.contains('liked');
      setLiked(isNowLiked);

      if (isNowLiked) {
        userLikes[projectId] = true;
      } else {
        delete userLikes[projectId];
      }
      try {
        localStorage.setItem('projectLikes', JSON.stringify(userLikes));
      } catch {
        /* storage unavailable (private mode) — the like still counts */
      }

      runTransaction(ref(db, `likes/${projectId}`), (currentLikes: number | null) =>
        isNowLiked ? (currentLikes ?? 0) + 1 : Math.max(0, (currentLikes ?? 0) - 1)
      );
    });

    onValue(ref(db, `likes/${projectId}`), (snapshot) => {
      const count = snapshot.val() ?? 0;
      countSpan.textContent = String(count);

      // Mirror into the modal if it's showing this project
      if (
        modal?.classList.contains('active') &&
        modalLikeBtn?.dataset.projectId === projectId
      ) {
        if (modalLikeCount) modalLikeCount.textContent = String(count);
        const liked = likeBtn.classList.contains('liked');
        modalLikeBtn.classList.toggle('liked', liked);
        modalLikeBtn.setAttribute('aria-pressed', String(liked));
      }
    });
  });
}
