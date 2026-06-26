import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { toggleNavIcon } from './utils.js';
import { initProfileModal } from './profile-modal.js';

onAuthStateChanged(auth, (user) => {
  toggleNavIcon(user);
});

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    location.reload();
  }
});

initProfileModal();
