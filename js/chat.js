import { auth, db, rtdb } from './firebase-config.js';
import { initProfileModal } from './profile-modal.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const params      = new URLSearchParams(location.search);
const chatId      = params.get('chatId');
const partnerName = params.get('partner') || '상대방';

document.getElementById('partner-name').textContent = decodeURIComponent(partnerName);

let myUid = null;

onAuthStateChanged(auth, (user) => {
  if (!user) { window.location.href = 'auth.html'; return; }
  myUid = user.uid;
  listenMessages();
});

function listenMessages() {
  const msgRef = ref(rtdb, `chats/${chatId}/messages`);
  onChildAdded(msgRef, (snap) => {
    renderMessage(snap.val());
  });
}

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

document.getElementById('btn-send').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

initProfileModal();