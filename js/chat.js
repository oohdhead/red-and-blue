import { auth, db, rtdb } from './firebase-config.js';
import { initProfileModal } from './profile-modal.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { doc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const params      = new URLSearchParams(location.search);
const chatId      = params.get('chatId');
const partnerName = params.get('partner') || '상대방';

document.getElementById('partner-name').textContent = decodeURIComponent(partnerName);

let myUid = null;

// 로그인 확인 후 메시지 실시간 감시 시작
onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = 'auth.html'; return; }
  myUid = user.uid;
  listenMessages();
});

// 채팅방의 새 메시지를 실시간으로 받아 화면에 표시
function listenMessages() {
  const msgRef = ref(rtdb, `chats/${chatId}/messages`);
  onChildAdded(msgRef, (snap) => {
    renderMessage(snap.val());
  });
}

// 메시지 하나를 말풍선 형태로 화면에 추가
function renderMessage(msg) {
  const container = document.getElementById('chat-messages');
  const isMine = msg.sender === myUid;

  const wrapper = document.createElement('div');
  wrapper.className = `chat-row ${isMine ? 'mine' : 'theirs'}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${isMine ? 'mine' : 'theirs'}`;
  bubble.textContent = msg.text;

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

// 입력창의 텍스트를 Realtime Database에 저장하고 채팅 목록 마지막 메시지 갱신
async function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text || !myUid) return;

  const msgRef = ref(rtdb, `chats/${chatId}/messages`);
  await push(msgRef, {
    sender: myUid,
    text,
    createdAt: Date.now()
  });

  // 채팅목록에 표시할 마지막 메시지 갱신
  await updateDoc(doc(db, 'chats', chatId), {
    lastMessage: text,
    lastMessageAt: Date.now()
  });

  input.value = '';
}

// 채팅방을 나가고 내 members 목록에서 제거 후 창 닫기
async function leaveChat() {
  if (!confirm('채팅방을 나가시겠어요?')) return;
  await updateDoc(doc(db, 'chats', chatId), {
    members: arrayRemove(myUid)
  });
  window.close();
}

// 나가기 버튼 클릭 시 채팅방 나가기
document.getElementById('btn-leave-chat').addEventListener('click', leaveChat);
// 전송 버튼 클릭 시 메시지 전송
document.getElementById('btn-send').addEventListener('click', sendMessage);
// 입력창에서 Enter 키 입력 시 메시지 전송
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

initProfileModal();