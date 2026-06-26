import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 이미 로그인 상태면 매칭 페이지로
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists() && snap.data().x !== undefined) {
      window.location.href = 'match.html';
    } else {
      window.location.href = 'quiz.html';
    }
  }
});

// 탭 전환
const tabLogin  = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const formLogin  = document.getElementById('form-login');
const formSignup = document.getElementById('form-signup');

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabSignup.classList.remove('active');
  formLogin.classList.remove('hidden');
  formSignup.classList.add('hidden');
});

tabSignup.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabLogin.classList.remove('active');
  formSignup.classList.remove('hidden');
  formLogin.classList.add('hidden');
});

// URL에 ?tab=signup 있으면 회원가입 탭 자동 오픈
if (new URLSearchParams(location.search).get('tab') === 'signup') {
  tabSignup.click();
}

// 로그인
document.getElementById('btn-login').addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.textContent = '';

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    errEl.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
  }
});

// 회원가입
document.getElementById('btn-signup').addEventListener('click', async () => {
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const nickname = document.getElementById('signup-nickname').value.trim();
  const age      = Number(document.getElementById('signup-age').value);
  const gender   = document.getElementById('signup-gender').value;
  const bio      = document.getElementById('signup-bio').value.trim();
  const errEl    = document.getElementById('signup-error');
  errEl.textContent = '';

  if (!nickname || !age || !gender) {
    errEl.textContent = '모든 항목을 입력해주세요.';
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', cred.user.uid), {
      nickname, age, gender, bio,
      showCompass: true,
      createdAt: Date.now()
    });
    window.location.href = 'quiz.html';
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      errEl.textContent = '이미 사용 중인 이메일입니다.';
    } else if (e.code === 'auth/weak-password') {
      errEl.textContent = '비밀번호는 6자 이상이어야 합니다.';
    } else {
      errEl.textContent = '회원가입 중 오류가 발생했습니다.';
    }
  }
});

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === '1') {
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    location.reload();
  }
});