import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { toggleNavIcon } from './utils.js';
import { initProfileModal } from './profile-modal.js';

// 로그인 여부에 따라 프로필 아이콘 표시 제어
onAuthStateChanged(auth, (user) => {
  toggleNavIcon(user);
});

initProfileModal();
