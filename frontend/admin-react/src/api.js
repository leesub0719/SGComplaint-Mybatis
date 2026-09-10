/**
 * 관리자 API 헬퍼.
 *
 * 앞서 만든 화면들의 api.js와 같은 구조다(CSRF 토큰 캐싱 + 세션 만료 감지).
 * 세 벌로 중복돼 있으므로, 앱 통합 시 shared/api.js 하나로 합칠 대상이다.
 */

let csrfPromise = null;

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function loadCsrf() {
  if (!csrfPromise) {
    csrfPromise = fetch('/api/csrf', { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new ApiError('보안 토큰을 가져오지 못했습니다.', response.status);
        return response.json();
      })
      .catch((error) => {
        csrfPromise = null;
        throw error;
      });
  }
  return csrfPromise;
}

function checkAccess(response) {
  const isLoginRedirect = response.redirected && response.url.includes('/login');
  if (response.status === 401 || isLoginRedirect) {
    window.location.href = '/login';
    throw new ApiError('로그인이 필요합니다.', 401);
  }
  if (response.status === 403) {
    throw new ApiError('관리자 권한이 필요합니다.', 403);
  }
}

async function parse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || '요청을 처리하지 못했습니다.', response.status);
  }
  return data;
}

export async function apiGet(url) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });
  checkAccess(response);
  return parse(response);
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
  checkAccess(response);
  return parse(response);
}

/** 답변 첨부파일이 있어서 multipart로 보내는 경우. */
export async function postFormData(url, formData) {
  const csrf = await loadCsrf();
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { [csrf.headerName]: csrf.token, Accept: 'application/json' },
    body: formData,
  });
  checkAccess(response);
  return parse(response);
}
