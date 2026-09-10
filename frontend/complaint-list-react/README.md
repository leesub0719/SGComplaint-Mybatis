# React 민원 접수 화면

기존 Thymeleaf `/complaints/new`를 유지하면서 `/react-complaint-new` 경로에
React 버전을 추가했습니다. 로그인이 필요한 화면입니다.

## 백엔드 변경이 거의 없는 이유

`POST /complaints`는 이미 `@ResponseBody` + `ComplaintCreateResponse`로
JSON을 반환하는 API였습니다. 그래서 이번에는 진입점 컨트롤러
(`ReactComplaintFormController`) 하나만 추가했고, 등록 API는 그대로 씁니다.

`@ModelAttribute` + `MultipartFile` 구조라 요청은 JSON이 아니라
`multipart/form-data`로 보냅니다 (`src/api.js`의 `postFormData`).

## 기존 파일과의 대응 관계

| 기존 | React |
| --- | --- |
| `templates/complaint/create.html` | `src/App.jsx` |
| `complaint.js`의 execCommand 에디터 | `src/editor/RichTextEditor.jsx` (Tiptap) |
| `complaint.js`의 DataTransfer 파일 동기화 | `src/components/AttachmentPicker.jsx` |
| `create.html`의 완료 모달 | `src/components/CompleteModal.jsx` |
| 컨트롤러 Model의 분류별 문구 | `src/lib/categories.js` |

## 에디터를 Tiptap으로 바꾸면서 달라진 점

기존 코드는 `contenteditable` + `document.execCommand`를 쓰면서 커서 위치를
`savedEditorRange`에 직접 저장하고 복원해야 했습니다. Tiptap은 문서 상태와
선택 영역을 내부에서 관리하므로 그 코드가 전부 사라졌습니다.

저장되는 HTML도 달라집니다. `execCommand('fontSize', 3)`은 `<font size="3">`
같은 비표준 태그를 만들었지만, Tiptap은 `<span style="font-size: 16px">`을
생성합니다. 서버의 `RichTextSanitizer`가 어떤 태그와 속성을 허용하는지
확인해 보시고, `style` 속성이나 `span` 태그가 걸러진다면 sanitizer 화이트리스트를
조정해야 합니다. **이 부분은 실제로 글을 등록해 보고 확인이 필요합니다.**

글자 크기는 Tiptap에 공식 확장이 없어서 `src/editor/FontSize.js`에
TextStyle 기반으로 직접 만들었습니다.

## 개발 실행

Spring Boot를 8080에서 실행하고 로그인한 뒤:

```powershell
cd C:\workspace\SGComplaint-MyBatis\frontend\complaint-form-react
npm.cmd install
npm.cmd run dev
```

`http://localhost:5176`으로 접속합니다.
`?category=praise` 처럼 쿼리로 분류를 지정할 수 있습니다.

## Spring Boot에 포함해 빌드

```powershell
npm.cmd run build
```

결과는 `src/main/resources/static/react-complaint-new`에 생성되며,
Eclipse에서 프로젝트 Refresh(F5) 후 서버를 재시작하면
`/react-complaint-new`로 접속됩니다.
