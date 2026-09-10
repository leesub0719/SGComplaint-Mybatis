import { BrowserRouter, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Complaints from './pages/Complaints.jsx';
import Members from './pages/Members.jsx';

/**
 * 관리자 SPA.
 *
 * 앞의 화면들과 달리 여기서는 react-router를 썼다. 화면이 셋이고 각각 필터·페이징
 * 상태를 URL 쿼리로 들고 있어야 해서(새로고침·뒤로가기·링크 공유) 직접 만든
 * 라우팅으로는 감당하기 어렵다.
 *
 * basename을 주면 라우터가 /react-admin 접두사를 알아서 처리하므로, 각 화면은
 * "/dashboard" 같은 짧은 경로만 알면 된다. 서버 쪽에서는
 * ReactAdminPageController가 하위 경로들을 같은 index.html로 forward 한다.
 */
export default function App() {
  return (
    <BrowserRouter basename="/react-admin">
      <div className="admin-shell">
        <Sidebar />
        <main className="admin-main">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/members" element={<Members />} />
            <Route path="*" element={<p className="message">존재하지 않는 페이지입니다.</p>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function Sidebar() {
  // NavLink는 현재 경로와 일치하면 isActive를 넘겨준다.
  // 기존 화면이 서버에서 activeMenu 모델 속성으로 처리하던 부분이다.
  const linkClass = ({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link');

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <span>013</span>
        <div>
          <strong>서경 마을버스</strong>
          <small>관리자</small>
        </div>
      </div>

      <nav>
        <NavLink className={linkClass} to="/dashboard">대시보드</NavLink>
        <NavLink className={linkClass} to="/complaints">민원 처리</NavLink>
        <NavLink className={linkClass} to="/members">회원 관리</NavLink>
      </nav>

      <div className="sidebar-footer">
        {/* 아직 전환하지 않은 화면은 기존 Thymeleaf 경로로 보낸다. */}
        <a href="/admin/notices">공지 관리</a>
        <a href="/admin/routes">노선 관리</a>
        <a href="/">사이트로 이동</a>
        <a href="/logout">로그아웃</a>
      </div>
    </aside>
  );
}
