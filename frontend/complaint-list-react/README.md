# React 민원 목록

기존 Thymeleaf `/complaints`를 유지하면서 목록 조회만 React로 분리한 학습용 화면입니다.

## 핵심 학습 포인트

- `App.jsx`: `useState`로 검색 조건과 페이지 상태 관리
- `useEffect`: 조건이 바뀔 때 Spring Boot REST API 호출
- `ComplaintRow`: 반복되는 행을 컴포넌트로 분리
- `/api/public/complaints`: 기존 `ComplaintService`를 재사용하는 JSON API

## 개발 실행

Spring Boot를 8080 포트에서 먼저 실행한 다음:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\complaint-list-react
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

## Spring Boot에 포함해 빌드

```powershell
npm run build
cd C:\workspace\SGComplaint-MyBatis
.\gradlew.bat clean bootJar
```

React 빌드 결과는 `src/main/resources/static/react-complaints`에 생성되며,
배포 후 `/react-complaints/`로 접속할 수 있습니다.
