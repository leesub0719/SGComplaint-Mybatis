import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './shared/PublicLayout.jsx';
import AdminLayout from './shared/AdminLayout.jsx';

import ComplaintList from './pages/complaints/List.jsx';
import ComplaintNew from './pages/complaints/New.jsx';
import MyPage from './pages/mypage/MyPage.jsx';
import Account from './pages/account/Account.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminComplaints from './pages/admin/Complaints.jsx';
import AdminMembers from './pages/admin/Members.jsx';

/**
 * 통합 SPA.
 *
 * 전환 초기에는 화면 단위로 앱을 따로 만들었다(react-complaints, react-mypage,
 * react-account, react-complaint-new, react-admin). 화면별로 독립 배포·롤백이
 * 가능하다는 장점이 있었지만, api.js와 스타일이 네 벌로 복제되고 node_modules도
 * 앱마다 따로 설치해야 했다.
 *
 * 전환 대상이 확정된 뒤 하나로 합쳤다. 이제 빌드도 한 번, 산출물도 static/app
 * 한 곳이다. 서버에서는 ReactAppController가 SPA 경로를 모두 index.html로
 * forward 한다.
 *
 * 레이아웃은 중첩 라우트로 처리한다. 공개 화면은 PublicLayout(헤더/히어로/푸터),
 * 관리자 화면은 AdminLayout(사이드바)을 공유하고, 각 페이지는 본문만 그린다.
 */
export default function App() {
  return (
    <BrowserRouter basename="/app">
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Navigate to="/complaints" replace />} />
          <Route path="/complaints" element={<ComplaintList />} />
          <Route path="/complaints/new" element={<ComplaintNew />} />
          <Route path="/mypage" element={<MyPage />} />
          {/* 회원가입·아이디찾기·비밀번호재설정은 한 컴포넌트가 탭으로 처리한다. */}
          <Route path="/account/:tab" element={<Account />} />
          <Route path="/account" element={<Navigate to="/account/signup" replace />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="members" element={<AdminMembers />} />
        </Route>

        <Route path="*" element={<p className="message">존재하지 않는 페이지입니다.</p>} />
      </Routes>
    </BrowserRouter>
  );
}
