import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === '1') {
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    location.reload();
  }
});