<img width="50" height="50" alt="rnb_logo" src="https://github.com/user-attachments/assets/dab02279-d018-43a0-9d6d-a46a75c3bb46" />

# RED&BLUE

**정치 성향 기반 채팅 데이트 서비스**

> 정치 나침반으로 나를 측정하고, 비슷하거나 정반대인 사람을 만나보세요.

🔗  [https://rednblue.netlify.app](https://rednblue.netlify.app)



## 프로젝트 소개

최근 국내 사회 전반에 심화되고 있는 정치적 양극화와 집단 간 갈등을 완화하고, 상호 이해를 도모할 수 있는 새로운 소통의 장을 마련하고자 기획한 정치 성향 기반 매칭·채팅 서비스입니다.

12개 문항의 설문으로 사용자의 정치 성향을 진보-보수(X축), 권위-자유(Y축) 2차원 좌표로 측정하고, 비슷하거나 정반대인 성향의 사람과 매칭되어 1:1 채팅(청문회)을 나눌 수 있습니다. 갈등이 더 심해지는데 기여할 것 같아서 실효성이 의심되지만 재밌기 때문에 만들었습니더



## 주요 기능

| 기능 | 설명 |
|------|------|
| 회원가입 / 로그인 | Firebase Authentication 기반 이메일·비밀번호 인증 |
| 성향 설문 | 12개 문항(7단계 척도)으로 정치 성향 좌표 산출 |
| 결과 시각화 | 좌표값에 따라 배경색이 동적으로 변화하는 나침반 결과 화면 |
| 버블 매칭 | 유사/반대 성향 모드 선택 후, 거리 기반 매칭 후보를 버블 형태로 시각화 |
| 필터링 | 성향, 나이 조건으로 매칭 후보 필터링 |
| 실시간 채팅 | Realtime Database 기반 1:1 채팅(청문회) |
| 프로필 관리 | 모달을 통한 닉네임/나이/성별/소개 수정 및 로그아웃 |



## 사용 기술

- **Frontend**: HTML, CSS, JavaScript
- **DB**: Firebase Authentication, Cloud Firestore, Realtime Database
- **배포**: Netlify 





## 데이터 구조 (Firestore)

```
users/{uid}
  ├─ nickname, age, gender, bio
  ├─ createdAt
  ├─ x, y         
  └─ matchMode    

chats/{chatId}
  ├─ members: [uidA, uidB]
  ├─ memberNames
  ├─ createdAt
  ├─ lastMessage
  └─ lastMessageAt

# 실제 채팅 메시지는 Realtime Database에 저장
chats/{chatId}/messages/{msgId}
  ├─ sender, text, createdAt
```

