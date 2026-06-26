import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getCompassColor } from './utils.js';

let myUid = null;

onAuthStateChanged(auth, async (user) => {
  const icon = document.getElementById('nav-profile-icon');
  if (icon) icon.classList.toggle('hidden', !user);

  if (!user) { window.location.href = 'auth.html'; return; }
  myUid = user.uid;

  const snap = await getDoc(doc(db, 'users', myUid));
  const { x = 0 } = snap.data() || {};

  const selector = document.getElementById('match-mode-selector');
  if (selector) selector.style.background = getCompassColor(x);
});

// 모드 선택 버튼 클릭 → Firestore에 matchMode 저장
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', async () => {
    const mode = card.dataset.mode; // 'similar' or 'opposite'
    await updateDoc(doc(db, 'users', myUid), { matchMode: mode });
    console.log(`선택한 모드: ${mode}`);
    // TODO: 다음 단계(실제 매칭 카드 화면)로 전환하는 로직 추가 예정
  });
});

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    window.location.href = 'index.html';
  }
});