import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {
  const icon = document.getElementById('nav-profile-icon');
  if (icon) icon.classList.toggle('hidden', !user);

  if (!user) { window.location.href = 'auth.html'; return; }

  const snap = await getDoc(doc(db, 'users', user.uid));
  const { x = 0, y = 0 } = snap.data() || {};
  // x, y 범위: -1(진보/권위) ~ +1(보수/자유)

  applyBg(x);
  applyLabel(x, y);
  applyDot(x, y);
});

function applyBg(x) {
  const from = [0x97, 0x7E, 0xFF]; // #977EFF (x 작을수록)
  const to   = [0xFF, 0x95, 0x95]; // #FF9595 (x 클수록)
  const t = (x + 1) / 2;
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  document.body.style.background = `rgb(${r},${g},${b})`;
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
  // left 0% = 진보(-1), 100% = 보수(+1)
  // top  0% = 권위(-1), 100% = 자유(+1)
  dot.style.left = `${((x + 1) / 2) * 100}%`;
  dot.style.top  = `${((-y + 1) / 2) * 100}%`;
}
