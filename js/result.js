// x: -100(진보) ~ +100(보수), y: -100(권위) ~ +100(자유)
// localStorage에서 quiz 결과 읽어옴 (quiz.js가 저장해놓은 값 사용)
const scores = JSON.parse(localStorage.getItem('quizResult') || '{"x":0,"y":0}');
const x = Math.max(-100, Math.min(100, scores.x));
const y = Math.max(-100, Math.min(100, scores.y));

// 배경색: x=-100 → #977EFF, x=+100 → #FF9595
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
function lerp(a, b, t) { return Math.round(a + (b - a) * t); }

const colorLeft = hexToRgb('#977EFF'); // x 작을수록
const colorRight = hexToRgb('#FF9595'); // x 클수록
const t = (x + 100) / 200; // 0~1
const bg = `rgb(${lerp(colorLeft[0], colorRight[0], t)}, ${lerp(colorLeft[1], colorRight[1], t)}, ${lerp(colorLeft[2], colorRight[2], t)})`;
document.body.style.background = bg;

// 레이블 텍스트
function getLabel(x, y) {
  const xSide = x < -20 ? '진보' : x > 20 ? '보수' : '중도';
  const ySide = y < -20 ? '권위주의' : y > 20 ? '자유주의' : '중도';
  if (xSide === '중도' && ySide === '중도') return '중도';
  if (xSide === '중도') return ySide;
  if (ySide === '중도') return xSide;
  return `${ySide} ${xSide}`;
}
document.getElementById('result-label').textContent = `당신은 ${getLabel(x, y)}주의자입니다`;

// 점수 표시
document.getElementById('score-x').textContent = x > 0 ? `+${x}` : `${x}`;
document.getElementById('score-y').textContent = y > 0 ? `+${y}` : `${y}`;

// 나침반 점 위치 (left: 0%=진보, 100%=보수 / top: 0%=권위, 100%=자유)
const dotX = ((x + 100) / 200) * 100;
const dotY = ((-y + 100) / 200) * 100; // y+ = 자유 = 아래
const dot = document.getElementById('compass-dot');
dot.style.left = `${dotX}%`;
dot.style.top = `${dotY}%`;
