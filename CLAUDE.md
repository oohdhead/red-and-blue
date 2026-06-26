# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 협업 규칙

- 모든 설명과 답변은 **한국어**로 작성한다.
- 코드를 수정하기 전에 **왜 수정하는지 이유를 먼저** 설명한다.
- 수정 시 **변경 전/후 코드를 함께** 보여준다.
- 절대 바로 코드를 수정하지 마라.

## Project Overview

RED&BLUE는 정치 성향 기반 매칭 플랫폼입니다. 사용자가 정치 나침반 설문을 완료하면 경제(좌←→우) × 사회(권위←→자유) 2차원 좌표를 산출하고, 그 결과를 바탕으로 유사하거나 반대 성향의 사람과 매칭합니다.

## Running the App

빌드 시스템이 없습니다. 정적 파일 서버로 직접 실행합니다.

```bash
# Python 사용 시
python -m http.server 8000

# Node.js 사용 시
npx serve .
```

Firebase SDK를 CDN에서 로드하므로 `file://` 직접 열기는 모듈 CORS 오류가 발생합니다. 반드시 로컬 서버를 통해 접근하세요.

## Architecture

### Page Flow

```
index.html → auth.html → quiz.html → result.html → match.html
```

- 각 페이지는 `onAuthStateChanged`로 로그인 상태를 확인
- 로그인 + 설문 완료 시 `match.html`로 리다이렉트, 로그인만 된 경우 `quiz.html`로 이동
- `auth.html`은 `?tab=signup` 쿼리로 회원가입 탭 자동 활성화

### Firebase

`js/firebase-config.js`에서 세 서비스를 초기화하고 export합니다:

| export | 서비스 |
|--------|--------|
| `auth` | Firebase Authentication |
| `db`   | Firestore (사용자 프로필, 설문 결과) |
| `rtdb` | Realtime Database (매칭/채팅용) |

Firebase SDK는 `https://www.gstatic.com/firebasejs/12.14.0/` CDN에서 ES 모듈로 로드합니다. `import`할 때 반드시 같은 버전 URL을 사용하세요.

### Firestore 데이터 구조

`users/{uid}`:
- `nickname`, `age`, `gender`, `bio`, `showCompass`, `createdAt` — 회원가입 시 저장
- `x`, `y` — 설문 완료 시 추가 (range: `-1.0 ~ +1.0`)
- `x`, `y`가 존재하면 설문 완료로 판단 (`auth.js:19`)

### 설문 점수 계산 (`js/quiz.js`)

- 12문항, 7점 척도 (1=그렇다, 7=그렇지 않다)
- `reverse: true` 문항은 `v = 8 - v`로 반전
- 정규화: `(v - 4) / 3` → 범위 `-1.0 ~ +1.0`
- x축 6문항 평균 → `x` (진보↔보수), y축 6문항 평균 → `y` (권위↔자유)
- 결과를 Firestore에 저장 후 `result.html`로 이동

### result.js의 주의사항

`js/result.js`는 `type="module"`이 **아닌** 일반 script이며, Firestore 대신 `localStorage('quizResult')`에서 점수를 읽습니다. 현재 `quiz.js`는 Firestore에만 저장하므로, result 페이지에 점수를 전달하려면 `quiz.js`에서 localStorage 저장을 추가하거나 result.js를 Firestore를 읽도록 수정해야 합니다.

### CSS

단일 파일 `css/style.css`가 모든 페이지를 담당합니다. 페이지별로 `<body>` class(`landing-page`, `auth-page`, `match-page`, `result-page`)로 스코프를 구분합니다.

CSS 변수(`--red`, `--blue`, `--gradient` 등)는 `:root`에 정의되어 있습니다.

### 개발자 단축키

모든 페이지에서 **F1** 키를 누르면 강제 로그아웃되고 `index.html`로 이동합니다 (개발 편의용).
