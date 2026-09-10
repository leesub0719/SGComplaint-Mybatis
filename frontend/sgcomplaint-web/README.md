# 통합 React 앱

화면 단위로 나눠 만들었던 React 앱 다섯 개를 하나로 합친 결과물입니다.
접속 경로는 `/app` 이며, 빌드 산출물은 `src/main/resources/static/app` 입니다.

## 왜 합쳤나

전환 초기에는 화면마다 앱을 따로 만들었습니다. 한 화면이 잘못돼도 나머지에
영향이 없고, 기존 Thymeleaf 화면과 나란히 비교할 수 있어서 검증 단계에서는
유리했습니다. 대신 이런 비용이 있었습니다.

- `api.js`가 네 벌로 복제됨 (CSRF 처리를 고치려면 네 곳을 수정)
- 헤더·버튼·테이블 스타일이 앱마다 중복
- 휴대전화 인증 타이머 로직이 마이페이지와 계정 화면에 따로 존재
- `node_modules`를 앱마다 설치, 빌드도 앱마다 실행

전환 대상이 확정된 뒤 하나로 합치면서 위 문제를 정리했습니다.

## 구조

```
src/
├─ App.jsx                    라우트 정의 (BrowserRouter basename="/app")
├─ shared/                    화면 간 공용 모듈
│   ├─ api.js                 CSRF 캐싱 · 세션 만료 감지 · 오류 변환
│   ├─ PhoneVerification.jsx  휴대전화 인증 (마이페이지·계정 공용)
│   ├─ useCountdown.js        인증 타이머 훅
│   ├─ format.js              전화번호·아이디·비밀번호 검증 규칙
│   ├─ Pagination.jsx
│   ├─ PublicLayout.jsx       헤더 · 히어로 · 푸터
│   └─ AdminLayout.jsx        관리자 사이드바
├─ pages/
│   ├─ complaints/            민원 목록 · 작성 (Tiptap 에디터 포함)
│   ├─ mypage/                비밀번호 재확인 · 정보수정
│   ├─ account/               회원가입 3단계 · 아이디찾기 · 비밀번호재설정
│   └─ admin/                 대시보드 · 민원처리 · 회원관리
└─ styles.css
```

## 라우트

| 경로 | 화면 | 권한 |
| --- | --- | --- |
| `/app/complaints` | 민원 목록 | 공개 |
| `/app/complaints/new` | 민원 작성 | 로그인 |
| `/app/mypage` | 정보수정 | 로그인 |
| `/app/account/signup` | 회원가입 | 공개 |
| `/app/account/find-id` | 아이디 찾기 | 공개 |
| `/app/account/reset-password` | 비밀번호 재설정 | 공개 |
| `/app/admin/dashboard` | 대시보드 | ADMIN·MASTER |
| `/app/admin/complaints` | 민원 처리 | ADMIN·MASTER |
| `/app/admin/members` | 회원 관리 | ADMIN·MASTER |

SPA 셸(index.html)은 `SecurityConfig`에서 공개로 두고, 실제 데이터는 모두
`/api/**` 를 거치면서 권한 검사를 받습니다. 로그인이 풀리면 `shared/api.js`가
응답을 보고 `/login`으로 보냅니다.

## 레이아웃은 중첩 라우트로

`PublicLayout`과 `AdminLayout`이 각각 공통 껍데기를 그리고, 하위 라우트가
`<Outlet />` 자리에 들어갑니다. 앱마다 헤더 마크업을 복사하던 것을 대체한
구조입니다.

## 목록 상태는 URL에

민원 목록·회원 관리·대시보드는 필터와 페이지 번호를 `useSearchParams`로
URL 쿼리에 둡니다. 새로고침해도 조건이 유지되고, 뒤로가기가 동작하며,
특정 목록 화면을 링크로 공유할 수 있습니다.

## 실행

Spring Boot를 8080에서 실행한 뒤:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\sgcomplaint-web
npm.cmd install
npm.cmd run dev
```

`http://localhost:5173` 으로 접속합니다.

## 빌드

```powershell
npm.cmd run build
```

Eclipse에서 프로젝트 Refresh(F5) 후 서버를 재시작하면 `/app` 으로 접속됩니다.

## 기존 앱 폴더

`complaint-list-react`, `mypage-profile-react`, `account-react`,
`complaint-form-react`, `admin-react` 는 통합 후 역할이 끝났습니다.
전환 과정을 기록으로 남기려면 그대로 두고, 정리하려면 폴더와 각각의
`React*PageController`, `static/react-*` 산출물을 함께 지우면 됩니다.
