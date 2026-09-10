import { NavLink, Outlet } from 'react-router-dom';

/**
 * 관리자 화면 레이아웃 (사이드바 + 본문).
 *
 * NavLink가 현재 경로와 일치하면 isActive를 넘겨준다.
 * 기존 Thymeleaf 화면이 서버에서 activeMenu 모델 속성으로 처리하던 부분이다.
 */
export default function AdminLayout() {
  const linkClass = ({ isActive }) => (isActive ? 'nav-link is-active' : 'nav-link');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>013</span>
          <div>
            <strong>서경 마을버스</strong>
            <small>관리자</small>
          </div>
        </div>

        <nav>
          <NavLink className={linkClass} to="/admin/dashboard">대시보드</NavLink>
          <NavLink className={linkClass} to="/admin/complaints">민원 처리</NavLink>
          <NavLink className={linkClass} to="/admin/members">회원 관리</NavLink>
        </nav>

        <div className="sidebar-footer">
          {/* 아직 전환하지 않은 관리자 화면은 기존 Thymeleaf 경로로 보낸다. */}
          <a href="/admin/notices">공지 관리</a>
          <a href="/admin/routes">노선 관리</a>
          <a href="/admin/partners">파트너 관리</a>
          <a href="/">사이트로 이동</a>
          <a href="/logout">로그아웃</a>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
