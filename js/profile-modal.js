import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

export function initProfileModal() {
  const icon = document.getElementById('nav-profile-icon');
  if (!icon) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="profile-modal-overlay hidden" id="profile-modal-overlay">
      <div class="profile-modal">
        <button class="modal-close" id="modal-close">✕</button>
        <div class="profile-modal-avatar" id="modal-avatar">?</div>
        <div class="profile-modal-name" id="modal-nickname">닉네임</div>
        <div class="form-group">
          <label>닉네임</label>
          <input type="text" id="modal-edit-nickname" />
        </div>
        <div class="form-group">
          <label>나이</label>
          <input type="number" id="modal-edit-age" />
        </div>
        <div class="form-group">
          <label>성별</label>
          <select id="modal-edit-gender">
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
        <div class="form-group">
          <label>한줄소개</label>
          <input type="text" id="modal-edit-bio" />
        </div>
        <button class="btn-primary full" id="modal-btn-save">저장하기</button>
        <button class="btn-outline full" id="modal-btn-logout">로그아웃</button>
      </div>
    </div>
  `);

  const overlay   = document.getElementById('profile-modal-overlay');
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

    document.getElementById('modal-avatar').textContent   = data.nickname?.[0]?.toUpperCase() || '?';
    document.getElementById('modal-nickname').textContent = data.nickname || '닉네임';
    document.getElementById('modal-edit-nickname').value  = data.nickname || '';
    document.getElementById('modal-edit-age').value       = data.age || '';
    document.getElementById('modal-edit-gender').value    = data.gender || '';
    document.getElementById('modal-edit-bio').value       = data.bio || '';
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
