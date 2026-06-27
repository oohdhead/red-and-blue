import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { toggleNavIcon } from './utils.js';
import { initProfileModal } from './profile-modal.js';

const questions = [
  { axis: 'x', text: '부유층에 대한 세금을 높여 복지를 확대해야 한다.' },
  { axis: 'x', text: '최저임금 대폭 인상이 필요하다.' },
  { axis: 'x', text: '공기업 민영화보다 국가 주도 경제가 바람직하다.', reverse: true },
  { axis: 'x', text: '성별 임금 격차 해소를 위한 적극적 정책이 필요하다.' },
  { axis: 'x', text: '경제 성장보다 환경 보호를 우선해야 한다.' },
  { axis: 'x', text: '남북 관계 개선을 위해 대화와 지원을 늘려야 한다.' },
  { axis: 'y', text: '국가 안보를 위해 개인 정보 수집은 허용될 수 있다.', reverse: true },
  { axis: 'y', text: '집회와 시위는 강력히 규제해야 한다.', reverse: true },
  { axis: 'y', text: '동성결혼을 법적으로 인정해야 한다.' },
  { axis: 'y', text: '마약 경범죄는 처벌보다 치료 중심으로 접근해야 한다.' },
  { axis: 'y', text: '가짜뉴스 방지를 위해 인터넷 표현을 규제해야 한다.', reverse: true },
  { axis: 'y', text: '전통적 가족 구조와 가치관을 사회가 보호해야 한다.', reverse: true },
];
// reverse : 찬성할 수록 반대쪽

let uid = null; //userid
const answers = new Array(questions.length).fill(null);

// 로그인 확인 후 설문 화면 렌더링 시작
onAuthStateChanged(auth, (user) => {
  toggleNavIcon(user);
  
  if (!user) { window.location.href = 'auth.html'; return; } // 로그인 안했으면
  uid = user.uid;
  renderQuestions();
});

// 설문 화면에 띄우기
function renderQuestions() {
  const sheet = document.getElementById('quiz-sheet');
  sheet.innerHTML = '';
  let dotsHTML = '';
  for (let v = 1; v <= 7; v++) {
    dotsHTML += `<button class="scale-dot" data-value="${v}"></button>`;
  }

  questions.forEach((q, i) => {
    const row = document.createElement('div');
    row.className = 'quiz-row';
    row.innerHTML = `
      <p class="quiz-row-text">${q.text}</p>
      <div class="quiz-scale">
        <span class="scale-label left">그렇다</span>
        <div class="scale-options" data-index="${i}">
          ${dotsHTML}
        </div>
        <span class="scale-label right">그렇지 않다</span>
      </div>
    `;
    sheet.appendChild(row);

    if (i < questions.length - 1) {
      const divider = document.createElement('div');
      divider.className = 'quiz-divider';
      sheet.appendChild(divider);
    }
  });

  // 클릭시 점수 저장
  sheet.querySelectorAll('.scale-options').forEach(group => {
    const idx = Number(group.dataset.index);
    group.querySelectorAll('.scale-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const val = Number(dot.dataset.value);
        answers[idx] = val;

        group.querySelectorAll('.scale-dot').forEach(d => d.classList.remove('selected'));
        dot.classList.add('selected');
      });
    });
  });
}

// 결과 보기 버튼 클릭 시 답변 검증 후 점수 계산하여 Firestore에 저장하고 결과 페이지로 이동
document.getElementById('btn-submit').addEventListener('click', async () => {
  const warning = document.getElementById('quiz-warning');

  if (answers.some(a => a === null)) {
    warning.classList.remove('hidden');
    const firstEmpty = answers.findIndex(a => a === null);
    document.querySelectorAll('.quiz-row')[firstEmpty].scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  warning.classList.add('hidden');

  const xVals = [];
  const yVals = [];

  // 점수 계산 
  questions.forEach((q, i) => {
    let v = answers[i];
    if (q.reverse) v = 8 - v; 
    const norm = (v - 4) / 3; 
    if (q.axis === 'x') xVals.push(norm);
    else yVals.push(norm);
  });

  const x = Math.round((xVals.reduce((a, b) => a + b, 0) / xVals.length) * 100) / 100;
  const y = Math.round((yVals.reduce((a, b) => a + b, 0) / yVals.length) * 100) / 100;

  await updateDoc(doc(db, 'users', uid), { x, y });

  window.location.href = 'result.html';
});

// 강제 로그아웃
window.addEventListener('keydown', async (e) => {
  if (e.key === 'F1') {
    e.preventDefault();
    alert('개발자모드: 1 입력됨. 로그아웃 실행');
    await signOut(auth);
    window.location.href = 'index.html';
  }
});

initProfileModal();