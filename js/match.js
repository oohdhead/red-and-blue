import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    window.location.href = 'index.html';
  }
});