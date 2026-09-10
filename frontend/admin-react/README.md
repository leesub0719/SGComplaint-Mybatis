# React 관리자 화면

기존 Thymeleaf `/admin/**`을 유지하면서 `/react-admin` 경로에 관리자 SPA를
추가했습니다. ADMIN 또는 MASTER 권한이 필요합니다.

## 전환 범위

| 화면 | 상태 |
| --- | --- |
| 대시보드 | 전환 완료 (`/react-admin/dashboard`) |
| 민원 처리 | 전환 완료 (`/react-admin/complaints`) |
| 회원 관리 | 전환 완료 (`/react-admin/members`) |
| 공지 관리 | 기존 Thymeleaf 유지 |
| 파트너·노선 관리 | 기존 Thymeleaf 유지 |
| 메인 배너 관리 | 기존 Thymeleaf 유지 |

전환하지 않은 화면은 목록 조회 + 저장/삭제라는 같은 패턴이라, 위 세 화면과
동일한 방식(서비스 재사용 + JSON 컨트롤러 추가)으로 확장할 수 있습니다.
사이드바 하단에서 기존 화면으로 이동합니다.

## 이 앱만 react-router를 쓰는 이유

앞서 전환한 화면들(마이페이지, 계정, 민원 작성)은 화면이 한두 개라
`pathname` 확인만으로 충분했습니다. 관리자 화면은 셋이고 각각 필터·검색어·
페이지 번호를 URL에 유지해야 해서 라우터가 필요합니다.

`useSearchParams`로 검색 조건을 URL 쿼리에 두면 이런 것들이 됩니다.

- 새로고침해도 필터가 유지됨
- 브라우저 뒤로가기로 이전 검색 조건으로 복귀
- "확인중 민원 목록" 같은 특정 화면을 링크로 공유

기존 화면은 권한 변경 폼에 검색 조건을 hidden 필드로 다시 실어 보내고
리다이렉트해야 했는데, 그 처리가 전부 사라집니다.

## 사용하는 API

`AdminApiController`(`/api/admin/**`)를 새로 만들었습니다. 기존
`AdminComplaintService`, `AdminMemberService`를 그대로 호출하고 결과만
JSON으로 돌려주므로 비즈니스 로직 중복은 없습니다.

- `GET /api/admin/dashboard?status=&page=`
- `GET /api/admin/complaints?status=`
- `POST /api/admin/complaints/{no}` — 답변 등록 (multipart, 첨부파일 포함)
- `GET /api/admin/complaint-statuses`
- `GET /api/admin/members?memberStatus=&memberRole=&keyword=&page=`
- `POST /api/admin/members/{empNo}/role`

## 개발 실행

Spring Boot를 8080에서 실행하고 관리자 계정으로 로그인한 뒤:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\admin-react
npm.cmd install
npm.cmd run dev
```

`http://localhost:5177`로 접속합니다.

## 빌드

```powershell
npm.cmd run build
```

결과는 `src/main/resources/static/react-admin`에 생성됩니다.
Eclipse에서 Refresh(F5) 후 서버를 재시작하면 `/react-admin`으로 접속됩니다.
