import { useCallback, useEffect, useState } from 'react';
import { apiGet } from './api.js';
import SignupTerms from './pages/SignupTerms.jsx';
import SignupForm from './pages/SignupForm.jsx';
import SignupComplete from './pages/SignupComplete.jsx';
import FindId from './pages/FindId.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

const BASE = '/react-account';

/**
 * 계정 관련 화면 3종(회원가입 / 아이디 찾기 / 비밀번호 재설정)을 담은 SPA.
 *
 * 라우팅은 react-router 없이 pathname + History API로 처리했다.
 * 화면이 세 개뿐이라 라이브러리를 얹을 이유가 없고, 서버는
 * ReactAccountPageController가 하위 경로 전부를 같은 index.html로 forward 한다.
 */
export default function App() {
  const [path, setPath] = useState(window.location.pathname);

  // 브라우저 뒤로가기 대응
  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState({}, '', to);
    setPath(to);
  }, []);

  if (path.startsWith(`${BASE}/find-id`)) {
    return <Shell active="find-id" navigate={navigate}><FindId /></Shell>;
  }
  if (path.startsWith(`${BASE}/reset-password`)) {
    return <Shell active="reset-password" navigate={navigate}><ResetPassword /></Shell>;
  }
  return <Shell active="signup" navigate={navigate}><Signup /></Shell>;
}

/** 회원가입 3단계를 하나의 상태로 묶는다. */
function Signup() {
  const [stage, setStage] = useState(null); // 'terms' | 'form' | 'complete'
  const [empNo, setEmpNo] = useState(null);
  const [error, setError] = useState('');

  // 서버 세션에 이미 유효한 동의 증적이 있으면 STEP 2부터 시작한다.
  useEffect(() => {
    apiGet('/api/signup/state')
      .then((state) => setStage(state.agreed ? 'form' : 'terms'))
      .catch((exception) => setError(exception.message));
  }, []);

  if (error) return <p className="message error">{error}</p>;
  if (!stage) return <p className="message">잠시만 기다려 주세요.</p>;

  if (stage === 'complete') return <SignupComplete empNo={empNo} />;
  if (stage === 'form') {
    return (
      <SignupForm
        onComplete={(createdEmpNo) => { setEmpNo(createdEmpNo); setStage('complete'); }}
        onAgreementExpired={() => setStage('terms')}
      />
    );
  }
  return <SignupTerms onAgreed={() => setStage('form')} />;
}

function Shell({ active, navigate, children }) {
  const tab = (key, label, to) => (
    <button
      type="button"
      className={active === key ? 'tab is-active' : 'tab'}
      onClick={() => navigate(to)}
    >
      {label}
    </button>
  );

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/"><span>013</span> (주) 서경 마을버스</a>
        <a href="/login">로그인</a>
      </header>

      <section className="hero">
        <p>ACCOUNT</p>
        <h1>계정 관리</h1>
      </section>

      <main className="shell">
        <nav className="tabs">
          {tab('signup', '회원가입', `${BASE}/signup`)}
          {tab('find-id', '아이디 찾기', `${BASE}/find-id`)}
          {tab('reset-password', '비밀번호 재설정', `${BASE}/reset-password`)}
        </nav>
        {children}
      </main>
    </>
  );
}
