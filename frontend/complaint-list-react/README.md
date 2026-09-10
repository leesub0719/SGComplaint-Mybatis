# React 마이페이지 정보수정

기존 Thymeleaf `/mypage/profile`을 유지하면서 회원정보 수정 화면을 React로 분리했습니다.
접속 경로는 `/react-mypage` 입니다.

## 기존 화면과의 대응 관계

| 기존 | React |
| --- | --- |
| `templates/mypage/password-confirm.html` | `src/components/PasswordConfirm.jsx` |
| `templates/mypage/profile.html` | `src/components/ProfileForm.jsx` |
| `static/js/mypage.js`의 휴대전화 인증 부분 | `src/components/PhoneVerification.jsx` |
| `BindingResult` 필드 오류 | API 응답의 `fieldErrors` 맵 |
| `<meta name="_csrf">` | `/api/csrf` 호출 후 헤더 주입 (`src/api.js`) |

## 핵심 학습 포인트

- `App.jsx`: 서버가 내려준 `verified` 플래그 하나로 "비밀번호 재확인 화면 ↔ 수정 폼"을 전환
- `PhoneVerification.jsx`: `setInterval` 타이머를 `useEffect` cleanup으로 정리 (기존 `stopTimer()` 수동 호출 대체)
- `api.js`: CSRF 토큰 캐싱과 세션 만료(로그인 페이지 리다이렉트) 감지를 한 곳에서 처리
- 세션 게이트(`ProfileVerificationSession`)를 서버에서 공유하므로 Thymeleaf 화면과 상태가 어긋나지 않음

## 개발 실행

Spring Boot를 8080 포트에서 먼저 실행한 다음:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\mypage-profile-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5174`로 접속합니다.
로그인 세션이 필요하므로, 먼저 `http://localhost:8080/login`에서 로그인해 두세요.

## Spring Boot에 포함해 빌드

```powershell
npm run build
cd C:\workspace\SGComplaint-MyBatis
.\gradlew.bat clean bootJar
```

빌드 결과는 `src/main/resources/static/react-mypage`에 생성되며,
배포 후 `/react-mypage`로 접속할 수 있습니다.
