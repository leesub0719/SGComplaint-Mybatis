# React 계정 화면 (회원가입 / 아이디 찾기 / 비밀번호 재설정)

기존 Thymeleaf 화면을 그대로 두고 `/react-account` 경로에 SPA를 추가했습니다.

| 경로 | 화면 | 대체한 기존 파일 |
| --- | --- | --- |
| `/react-account/signup` | 회원가입 3단계 | `member/signup-terms.html`, `member/signup.html`, `member/signup-complete.html` + `signup-terms.js`, `signup.js` |
| `/react-account/find-id` | 아이디 찾기 3단계 | `member/find-id.html` + `find-id.js` |
| `/react-account/reset-password` | 비밀번호 재설정 5단계 | `member/reset-password.html` + `reset-password.js` |

## 사용하는 API

계정 찾기/비밀번호 재설정은 기존 `AccountRecoveryController`(`/api/account-recovery/**`)를
그대로 재사용합니다. 이번에 새로 만든 것은 회원가입 API뿐입니다.

- `GET /api/signup/state` — 약관 동의를 이미 마쳤는지 확인 (새로고침해도 단계 유지)
- `POST /api/signup/terms` — 1단계 약관 동의
- `POST /api/signup` — 2단계 회원정보 저장
- `GET /api/members/check-id` — 아이디 중복확인 (기존 API 그대로)
- `GET /api/csrf` — SPA용 CSRF 토큰

## 핵심 학습 포인트

- `App.jsx`: react-router 없이 `pathname` + History API만으로 화면 3개를 라우팅
- `lib/useCountdown.js`: `find-id.js`/`reset-password.js`/`mypage.js`에 세 번 중복돼 있던
  인증 타이머를 커스텀 훅 하나로 통합
- `FindId.jsx` / `ResetPassword.jsx`: `data-step` 속성과 `hidden` 토글로 하던 단계 전환을
  `step` 상태값 하나로 대체
- `data/agreements.js`: 템플릿에 하드코딩돼 있던 약관 본문을 데이터로 분리

## 개발 실행

Spring Boot를 8080 포트에서 먼저 실행한 다음:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\account-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5175`로 접속합니다. 로그인 없이 사용하는 화면입니다.

## Spring Boot에 포함해 빌드

```powershell
npm run build
cd C:\workspace\SGComplaint-MyBatis
.\gradlew.bat clean bootJar
```

빌드 결과는 `src/main/resources/static/react-account`에 생성됩니다.
