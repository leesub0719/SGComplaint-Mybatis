import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { apiGet } from './api.js';
import SubHero from './SubHero.jsx';

/**
 * 공개 화면 공통 레이아웃 (헤더 / 서브 히어로 / 푸터).
 *
 * fragments/public-layout.html 의 마크업과 클래스 이름을 그대로 따른다.
 * 스타일시트도 /css/public-layout.css 를 그대로 불러오므로(index.html 참고)
 * 기존 화면과 같은 모양이 나온다. CSS를 다시 만들지 않는 이유다.
 *
 * Thymeleaf 헤더는 PublicLayoutControllerAdvice가 Model에 넣어준
 * isLoggedIn / memberName / isAdmin 으로 로그인 영역을 나눈다.
 * SPA에는 그 Model이 없어서 /api/layout/me 로 같은 정보를 받아온다.
 */
export default function PublicLayout() {
  const { pathname } = useLocation();
  const [member, setMember] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    apiGet('/api/layout/me', { redirectOnExpire: false })
      .then(setMember)
      .catch(() => setMember({ loggedIn: false }));
  }, []);

  // 경로가 바뀌면 열려 있던 메뉴를 닫는다.
  useEffect(() => {
    setOpenMenu(null);
    setNavOpen(false);
  }, [pathname]);

  // 바깥 클릭·ESC로 하위 메뉴 닫기 (public-layout.js와 같은 동작).
  useEffect(() => {
    const onClick = (event) => {
      if (!navRef.current?.contains(event.target)) setOpenMenu(null);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  async function logout() {
    // Thymeleaf 헤더는 CSRF 토큰을 담은 form을 POST 한다.
    // 여기서도 같은 방식으로 실제 폼을 만들어 제출한다.
    const csrf = await fetch('/api/csrf', { credentials: 'same-origin' }).then((r) => r.json());
    const form = document.createElement('form');
    form.method = 'post';
    form.action = '/logout';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = '_csrf';
    input.value = csrf.token;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
  }

  const group = (key, label, items) => (
    <div className={openMenu === key ? 'public-nav-group open' : 'public-nav-group'}>
      <button
        className="public-nav-main-button"
        type="button"
        aria-expanded={openMenu === key}
        onClick={() => setOpenMenu(openMenu === key ? null : key)}
      >
        {label} <span aria-hidden="true">⌄</span>
      </button>
      <div className="public-sub-menu">{items}</div>
    </div>
  );

  return (
    <>
      <header className="public-site-header">
        <div className="public-page-width public-header-inner">
          <a className="public-brand" href="/" aria-label="(주) 서경 마을버스 홈">
            <span className="public-brand-symbol" aria-hidden="true">013</span>
            <span>(주) 서경 마을버스</span>
          </a>

          <button
            className="public-menu-toggle"
            type="button"
            aria-expanded={navOpen}
            aria-controls="public-main-nav"
            onClick={() => setNavOpen(!navOpen)}
          >
            <span className="public-sr-only">메뉴 열기</span>
            <span /><span /><span />
          </button>

          <nav
            id="public-main-nav"
            ref={navRef}
            className={navOpen ? 'public-main-nav open' : 'public-main-nav'}
            aria-label="주요 메뉴"
          >
            <div className="public-primary-menu">
              {group('company', '회사소개', (
                <>
                  <a href="/company/greeting">인사말</a>
                  <a href="/company/history">회사연혁</a>
                  <a href="/company/location">오시는길</a>
                  <a href="/company/organization">조직도</a>
                </>
              ))}
              {group('route', '노선운행안내', (
                <>
                  <a href="/route/village-bus">마을버스</a>
                  <a href="/route/ddokbus">똑버스</a>
                </>
              ))}
              {group('recruit', '채용안내', <a href="/recruit/notices">채용공고</a>)}
              {group('customer', '고객센터', (
                <>
                  <a href="/notices">공지사항</a>
                  <Link to="/complaints?category=PRAISE">칭찬합니다</Link>
                  <Link to="/complaints?category=COMPLAINT">불편합니다</Link>
                  <Link to="/complaints?category=LOST">분실물 문의</Link>
                </>
              ))}
            </div>

            <span className="public-auth-divider" aria-hidden="true" />

            {/* 로그인 상태를 확인하기 전에는 어느 쪽도 그리지 않는다.
                버튼이 나타났다 바뀌는 깜빡임을 막기 위해서다. */}
            {member && !member.loggedIn && (
              <span className="public-auth-actions">
                <a className="public-auth-button public-auth-login" href="/login">로그인</a>
                <Link className="public-auth-button public-auth-signup" to="/account/signup">회원가입</Link>
              </span>
            )}

            {member?.loggedIn && (
              <span className="public-auth-actions public-auth-member">
                <span className="public-login-greeting">
                  <strong>{member.memberName}</strong>님
                </span>
                <span className="public-member-divider" aria-hidden="true" />

                <div className={openMenu === 'member' ? 'public-nav-group public-member-menu open' : 'public-nav-group public-member-menu'}>
                  <button
                    className="public-member-link public-member-menu-button"
                    type="button"
                    aria-expanded={openMenu === 'member'}
                    onClick={() => setOpenMenu(openMenu === 'member' ? null : 'member')}
                  >
                    마이페이지 <span aria-hidden="true">⌄</span>
                  </button>
                  <div className="public-sub-menu public-member-sub-menu">
                    <Link to="/mypage">정보수정</Link>
                    <a href="/mypage/inquiries">문의내역</a>
                  </div>
                </div>

                {member.admin && (
                  <>
                    <span className="public-member-divider" aria-hidden="true" />
                    <Link className="public-member-link public-admin-return-link" to="/admin/dashboard">
                      관리자페이지
                    </Link>
                  </>
                )}

                <span className="public-member-divider" aria-hidden="true" />
                <button className="public-member-link public-auth-logout" type="button" onClick={logout}>
                  로그아웃
                </button>
              </span>
            )}
          </nav>
        </div>
      </header>

      <SubHero pathname={pathname} />

      <Outlet />

      <footer className="public-company-footer">
        <div className="public-page-width public-company-footer-inner">
          <div className="public-footer-brand" aria-label="(주)서경 마을버스">
            <span className="public-footer-brand-mark" aria-hidden="true">013</span>
            <span><strong>SEOKYOUNG</strong><b>(주)서경 마을버스</b></span>
          </div>
          <address className="public-footer-company-information">
            <strong>(주)서경 마을버스</strong>
            <p>
              <a href="tel:0323423223">Tel. 032 342 3223</a>
              <span aria-hidden="true"> / </span>
              <span>Fax. 032 347 0134</span>
            </p>
            <p><a href="mailto:seokyoung_j@naver.com">이메일. seokyoung_j@naver.com</a></p>
            <p>주소 : 경기도 부천시 괴안동 246번지 / 소사동로 197 (주)서경 마을버스</p>
          </address>
          <button
            className="public-footer-top-button"
            type="button"
            aria-label="페이지 맨 위로 이동"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 11 6-6 6 6M12 5v14" /></svg>
          </button>
        </div>
      </footer>
    </>
  );
}
