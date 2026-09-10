import { useCallback, useEffect, useState } from 'react';
import { apiGet } from './api.js';
import PasswordConfirm from './components/PasswordConfirm.jsx';
import ProfileForm from './components/ProfileForm.jsx';

/**
 * 마이페이지 정보수정 SPA.
 *
 * 서버는 /api/mypage/profile 로 "비밀번호 재확인 통과 여부(verified)"를 알려주고,
 * 통과 전에는 개인정보를 내려보내지 않는다. 화면 전환은 그 플래그 하나로 결정된다.
 */
export default function App() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setProfile(await apiGet('/api/mypage/profile'));
    } catch (exception) {
      setError(exception.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/"><span>013</span> (주) 서경 마을버스</a>
        <nav>
          <a href="/mypage/inquiries">나의 문의내역</a>
          <a href="/logout">로그아웃</a>
        </nav>
      </header>

      <section className="hero">
        <p>MY PAGE</p>
        <h1>마이페이지</h1>
      </section>

      <main className="shell">
        <aside className="side-menu">
          <strong>마이페이지</strong>
          <a className="active" href="/react-mypage">정보수정</a>
          <a href="/mypage/inquiries">나의 문의내역</a>
        </aside>

        {loading && <p className="message">회원정보를 불러오는 중입니다.</p>}
        {!loading && error && <p className="message error">{error}</p>}

        {!loading && !error && profile && (
          profile.verified
            ? <ProfileForm profile={profile} onExpired={load} />
            : <PasswordConfirm empId={profile.empId} onVerified={load} />
        )}
      </main>
    </>
  );
}
