// 사용자의 설문 결과에 따라 배경색 바꾸기
export function getCompassColor(x) {
  const from = [0x97, 0x7E, 0xFF]; // #977EFF (x 작을수록, 진보)
  const to   = [0xFF, 0x95, 0x95]; // #FF9595 (x 클수록, 보수)
  const t = (x + 1) / 2;
  const r = Math.round(from[0] + (to[0] - from[0]) * t);
  const g = Math.round(from[1] + (to[1] - from[1]) * t);
  const b = Math.round(from[2] + (to[2] - from[2]) * t);
  return `rgb(${r},${g},${b})`;
}