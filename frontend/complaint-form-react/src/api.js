/**
 * 민원 작성 화면 API 헬퍼.
 *
 * 기존 complaint.js는 <form> 안의 hidden 필드로 CSRF 토큰을 넘겼지만,
 * 정적 SPA에는 그 필드가 없으므로 /api/csrf 로 토큰을 받아 헤더에 넣는다.
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

function assertNotLoggedOut(response) {
  const isLoginRedirect = response.redirected && response.url.includes('/login');
  if (response.status === 401 || isLoginRedirect) {
    throw new ApiError('로그인 시간이 만료되었습니다. 다시 로그인해 주세요.', 401);
  }
}

/**
 * 첨부파일이 있으므로 JSON이 아니라 multipart/form-data로 보낸다.
 * Content-Type은 브라우저가 boundary와 함께 자동으로 붙이므로 직접 지정하지 않는다.
 */
export async function postFormData(url, formData) {
  const csrf = await loadCsrf();
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { [csrf.headerName]: csrf.token, Accept: 'application/json' },
    body: formData,
  });
  assertNotLoggedOut(response);

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('서버 응답을 처리할 수 없습니다. 다시 로그인해 주세요.', response.status);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) {
    throw new ApiError(data?.message || '민원 접수에 실패했습니다.', response.status);
  }
  return data;
}
