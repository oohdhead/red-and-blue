import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function initProfileModal() {
  const icon    = document.getElementById('nav-profile-icon');
  const overlay = document.getElementById('profile-modal-overlay');
  if (!icon || !overlay) return;

  const modal     = overlay.querySelector('.profile-modal');
  const closeBtn  = document.getElementById('modal-close');
  const saveBtn   = document.getElementById('modal-btn-save');
  const logoutBtn = document.getElementById('modal-btn-logout');

  let currentUid = null;

  onAuthStateChanged(auth, (user) => {
    currentUid = user ? user.uid : null;
  });

  icon.addEventListener('click', async () => {
    overlay.classList.remove('hidden');
    if (!currentUid) return;

    const snap = await getDoc(doc(db, 'users', currentUid));
    const data = snap.data() || {};

    document.getElementById('modal-avatar').textContent    = data.nickname?.[0]?.toUpperCase() || '?';
    document.getElementById('modal-nickname').textContent  = data.nickname || '닉네임';
    document.getElementById('modal-edit-nickname').value   = data.nickname || '';
    document.getElementById('modal-edit-age').value        = data.age || '';
    document.getElementById('modal-edit-gender').value     = data.gender || '';
    document.getElementById('modal-edit-bio').value        = data.bio || '';
  });

  closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

  saveBtn.addEventListener('click', async () => {
    if (!currentUid) return;
    const nickname = document.getElementById('modal-edit-nickname').value.trim();
    await updateDoc(doc(db, 'users', currentUid), {
      nickname,
      age:    Number(document.getElementById('modal-edit-age').value),
      gender: document.getElementById('modal-edit-gender').value,
      bio:    document.getElementById('modal-edit-bio').value.trim(),
    });
    document.getElementById('modal-avatar').textContent   = nickname?.[0]?.toUpperCase() || '?';
    document.getElementById('modal-nickname').textContent = nickname || '닉네임';
    alert('저장되었습니다');
  });

  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
}
