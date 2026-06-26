import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  collection, getDocs, doc, getDoc, updateDoc, setDoc, query, where, onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getCompassColor } from './utils.js';

let myUid = null;
let myProfile = null;
let matchUsers = [];

onAuthStateChanged(auth, async (user) => {
  const icon = document.getElementById('nav-profile-icon');
  if (icon) icon.classList.toggle('hidden', !user);

  if (!user) { window.location.href = 'auth.html'; return; }
  myUid = user.uid;

  const snap = await getDoc(doc(db, 'users', myUid));
  myProfile = { uid: myUid, ...snap.data() };

  const { x = 0 } = myProfile;
  const selector = document.getElementById('match-mode-selector');
  if (selector) selector.style.background = getCompassColor(x);

  // 이미 모드 선택한 적 있으면 바로 매칭 화면으로
  if (myProfile.matchMode) {
    showMatchMain(myProfile.matchMode);
  }
});

// 모드 선택 버튼
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', async () => {
    const mode = card.dataset.mode; // 'similar' or 'opposite'
    await updateDoc(doc(db, 'users', myUid), { matchMode: mode });
    myProfile.matchMode = mode;
    showMatchMain(mode);
  });
});

document.getElementById('btn-change-mode').addEventListener('click', () => {
  document.getElementById('match-main').classList.add('hidden');
  document.getElementById('match-mode-selector').classList.remove('hidden');
});

async function showMatchMain(mode) {
  document.getElementById('match-mode-selector').classList.add('hidden');
  document.getElementById('match-main').classList.remove('hidden');
  document.getElementById('bubble-title').textContent = '청문회 할 사람은?';

  await loadCandidates(mode);
  listenChatList();
}

// ===== 매칭 후보 불러오기 (상위 20명) =====
async function loadCandidates(mode) {
  const snapshot = await getDocs(collection(db, 'users'));
  let users = [];
  snapshot.forEach(d => {
    if (d.id !== myUid && d.data().x !== undefined) {
      users.push({ uid: d.id, ...d.data() });
    }
  });

  users = users.map(u => ({
    ...u,
    distance: Math.sqrt(
      Math.pow(u.x - myProfile.x, 2) + Math.pow((u.y || 0) - (myProfile.y || 0), 2)
    )
  }));

  if (mode === 'similar') {
    users.sort((a, b) => a.distance - b.distance);
  } else {
    users.sort((a, b) => b.distance - a.distance);
  }

  matchUsers = users.slice(0, 20);
  renderBubbles(matchUsers, mode);
}

function getLabel(x, y) {
  if (x < -0.3 && y < -0.3) return '진보적 자유주의자';
  if (x < -0.3 && y >  0.3) return '권위적 진보주의자';
  if (x >  0.3 && y < -0.3) return '보수적 자유주의자';
  if (x >  0.3 && y >  0.3) return '권위적 보수주의자';
  return '중도주의자';
}

function genderLabel(g) {
  return g === 'male' ? '남성' : g === 'female' ? '여성' : '기타';
}

// ===== 버블 렌더링 =====
function renderBubbles(users, mode) {
  const area = document.getElementById('bubble-area');
  area.innerHTML = '';

  const W = area.clientWidth  || 360;
  const H = area.clientHeight || 420;

  const maxDist = Math.max(...users.map(u => u.distance), 0.01);
  const minDist = Math.min(...users.map(u => u.distance));

  users.forEach((u, i) => {
    const ratio = mode === 'similar'
      ? 1 - (u.distance - minDist) / (maxDist - minDist + 0.01)
      : (u.distance - minDist) / (maxDist - minDist + 0.01);

    const size = 56 + ratio * 36; // 56 ~ 92px

    const angle  = (i / users.length) * 2 * Math.PI + (i * 0.37);
    const radius = 60 + (i % 5) * 28;
    const cx = W / 2 + Math.cos(angle) * radius;
    const cy = H / 2 + Math.sin(angle) * radius;

    const bubble = document.createElement('button');
    bubble.className = 'bubble-item';
    bubble.dataset.uid = u.uid;
    bubble.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.max(size/2, Math.min(W - size/2, cx)) - size/2}px;
      top:  ${Math.max(size/2, Math.min(H - size/2, cy)) - size/2}px;
      background: ${getCompassColor(u.x)};
    `;
    bubble.innerHTML = `<span>${u.nickname || '익명'}</span>`;
    bubble.addEventListener('click', () => selectUser(u, bubble));
    area.appendChild(bubble);
  });
}

function selectUser(u, bubbleEl) {
  document.querySelectorAll('.bubble-item').forEach(b => b.classList.remove('selected'));
  bubbleEl.classList.add('selected');

  document.getElementById('bubble-detail').classList.remove('hidden');
  document.getElementById('detail-avatar').textContent = u.nickname?.[0]?.toUpperCase() || '?';
  document.getElementById('detail-avatar').style.background = getCompassColor(u.x);
  document.getElementById('detail-name').textContent = u.nickname || '익명';
  document.getElementById('detail-meta').textContent = `${u.age ? u.age + '세' : ''} · ${genderLabel(u.gender)}`;
  document.getElementById('detail-label').textContent = getLabel(u.x, u.y || 0);
  document.getElementById('detail-bio').textContent = u.bio || '소개가 없습니다.';

  document.getElementById('btn-chat-request').onclick = () => requestChat(u);
}

// ===== 채팅 신청 (버튼 눌렀을 때만 방 생성) =====
async function requestChat(u) {
  const chatId = [myUid, u.uid].sort().join('_');

  await setDoc(doc(db, 'chats', chatId), {
    members: [myUid, u.uid],
    memberNames: {
      [myUid]: myProfile.nickname || '익명',
      [u.uid]: u.nickname || '익명'
    },
    createdAt: Date.now(),
    lastMessage: '',
    lastMessageAt: Date.now()
  }, { merge: true });

  window.open(`chat.html?chatId=${chatId}&partner=${encodeURIComponent(u.nickname || '익명')}`, '_blank');
}

// ===== 채팅목록 실시간 구독 =====
function listenChatList() {
  const q = query(collection(db, 'chats'), where('members', 'array-contains', myUid));

  onSnapshot(q, (snapshot) => {
    const listEl = document.getElementById('chatlist');
    const emptyEl = document.getElementById('chatlist-empty');

    if (snapshot.empty) {
      listEl.innerHTML = '';
      listEl.appendChild(emptyEl);
      return;
    }

    const rooms = [];
    snapshot.forEach(d => rooms.push({ id: d.id, ...d.data() }));
    rooms.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    listEl.innerHTML = '';
    rooms.forEach(room => {
      const partnerUid = room.members.find(m => m !== myUid);
      const partnerName = room.memberNames?.[partnerUid] || '익명';

      const item = document.createElement('div');
      item.className = 'chatlist-item';
      item.innerHTML = `
        <div class="chatlist-avatar">${partnerName[0]?.toUpperCase() || '?'}</div>
        <div class="chatlist-info">
          <div class="chatlist-name">${partnerName}</div>
          <div class="chatlist-preview">${room.lastMessage || '대화를 시작해보세요'}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        window.open(`chat.html?chatId=${room.id}&partner=${encodeURIComponent(partnerName)}`, '_blank');
      });
      listEl.appendChild(item);
    });
  });
}

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    alert('개발자모드: F1 입력됨. 로그아웃 실행');
    await signOut(auth);
    window.location.href = 'index.html';
  }
});