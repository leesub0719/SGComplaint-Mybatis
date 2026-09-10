/**
 * 마이페이지 API 호출 헬퍼.
 *
 * Thymeleaf 화면은 <meta name="_csrf">로 토큰을 받지만 정적 SPA는 그럴 수 없어서
 * /api/csrf 를 한 번 호출해 캐싱한 뒤 POST 요청 헤더에 붙인다.
 */

let csrfPromise = null;

/** 서버가 내려준 필드별 오류를 함께 들고 다니는 에러. */
export class ApiError extends Error {
  constructor(message, fieldErrors = {}, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

function loadCsrf() {
  if (!csrfPromise) {
    csrfPromise = fetch('/api/csrf', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new ApiError('보안 토큰을 가져오지 못했습니다.', {}, response.status);
        return response.json();
      })
      .catch((error) => {
        csrfPromise = null;
        throw error;
      });
  }
  return csrfPromise;
}

/** 세션이 끊겨 로그인 페이지로 밀린 경우를 감지한다. */
function assertNotLoggedOut(response) {
  const isLoginRedirect = response.redirected && response.url.includes('/login');
  if (response.status === 401 || isLoginRedirect) {
    window.location.href = '/login';
    throw new ApiError('로그인이 필요합니다.', {}, 401);
  }
}

async function parseJson(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      data?.message || '요청을 처리하지 못했습니다.',
      data?.fieldErrors || {},
      response.status,
    );
  }
  return data;
}

export async function apiGet(url) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  assertNotLoggedOut(response);
  return parseJson(response);
}

export async function apiPost(url, body) {
  const csrf = await loadCsrf();
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(body ?? {}),
  });
  assertNotLoggedOut(response);
  return parseJson(response);
}

/**
 * 휴대전화 인증 API는 {success, message, verificationToken} 형태라
 * 마이페이지 응답 규격과 달라서 별도로 감싼다.
 */
export async function postPhoneVerification(url, body) {
  const data = await apiPost(url, body);
  if (data?.success !== true) {
    throw new ApiError(data?.message || '요청 처리에 실패했습니다.');
  }
  return data;
}
