import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getCompassColor, toggleNavIcon } from './utils.js';
import { initProfileModal } from './profile-modal.js';

onAuthStateChanged(auth, async (user) => {
  toggleNavIcon(user);
  if (!user) { window.location.href = 'auth.html'; return; }

  const snap = await getDoc(doc(db, 'users', user.uid));
  const { x = 0, y = 0 } = snap.data() || {};

  applyBg(x);
  applyLabel(x, y);
  applyDot(x, y);
});

function applyBg(x) {
  document.body.style.background = getCompassColor(x);
}

function applyLabel(x, y) {
  const xTag = x < -0.2 ? '진보' : x > 0.2 ? '보수' : null;
  const yTag = y < -0.2 ? '권위' : y > 0.2 ? '자유' : null;

  let label;
  if (!xTag && !yTag) label = '중도';
  else if (!xTag) label = yTag;
  else if (!yTag) label = xTag;
  else label = `${xTag} ${yTag}`;

  document.getElementById('result-label').textContent = `당신은 ${label}주의자입니다`;
}

function applyDot(x, y) {
  const dot = document.getElementById('compass-dot');
  dot.style.left = `${((x + 1) / 2) * 100}%`;
  dot.style.top  = `${((-y + 1) / 2) * 100}%`;
}

initProfileModal();
