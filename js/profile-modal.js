import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// x, y 좌표로 성향 이름 반환
function getCompassLabel(x, y) {
  const xTag = x < -0.2 ? '진보' : x > 0.2 ? '보수' : null;
  const yTag = y < -0.2 ? '권위' : y > 0.2 ? '자유' : null;
  if (!xTag && !yTag) return '중도';
  if (!xTag) return yTag;
  if (!yTag) return xTag;
  return `${xTag} ${yTag}`;
}

// 프로필 모달 HTML을 동적으로 삽입하고 모든 이벤트 연결
export function initProfileModal() {
  const icon = document.getElementById('nav-profile-icon');
  if (!icon) return;

  document.body.insertAdjacentHTML('beforeend', `
    <div class="profile-modal-overlay hidden" id="profile-modal-overlay">
      <div class="profile-modal">
        <button class="modal-close" id="modal-close">✕</button>
        <div class="profile-modal-avatar" id="modal-avatar">?</div>
        <div class="profile-modal-name" id="modal-nickname">닉네임</div>
        <div class="modal-compass-wrap">
          <div class="modal-compass-label" id="modal-compass-label">-</div>
          <div class="modal-compass-graph">
            <span class="modal-edge-label">권위</span>
            <div class="modal-compass-middle">
              <span class="modal-edge-label">진보</span>
              <div class="compass modal-compass" id="modal-compass">
                <div class="compass-line h"></div>
                <div class="compass-line v"></div>
                <div class="compass-dot" id="modal-compass-dot"></div>
              </div>
              <span class="modal-edge-label">보수</span>
            </div>
            <span class="modal-edge-label">자유</span>
          </div>
        </div>
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

  // 프로필 아이콘 클릭 시 모달을 열고 내 프로필 데이터 채우기
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

    const x = data.x || 0;
    const y = data.y || 0;
    document.getElementById('modal-compass-label').textContent = `당신은 ${getCompassLabel(x, y)}주의자`;
    const dot = document.getElementById('modal-compass-dot');
    dot.style.left = `${((x + 1) / 2) * 100}%`;
    dot.style.top  = `${((-y + 1) / 2) * 100}%`;
  });

  // 닫기 버튼 클릭 시 모달 닫기
  closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));

  // 모달 바깥 영역 클릭 시 모달 닫기
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });

  // 저장 버튼 클릭 시 입력된 프로필 정보를 Firestore에 저장
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

  // 로그아웃 버튼 클릭 시 Firebase 세션 종료 후 랜딩 페이지로 이동
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  });
}
