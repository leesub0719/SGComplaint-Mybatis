import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiGet } from '../../shared/api.js';

const CATEGORIES = [
  ['ALL', '전체'],
  ['PRAISE', '칭찬합니다'],
  ['COMPLAINT', '불편합니다'],
  ['LOST', '분실물 문의'],
];

/**
 * 민원 목록.
 *
 * 통합 전 complaint-list-react의 App.jsx가 원본이다. 달라진 점은 두 가지다.
 *  - 헤더·히어로 마크업을 PublicLayout으로 뺐다.
 *  - 검색 조건과 페이지를 useState가 아니라 URL 쿼리에 둔다.
 *    새로고침·뒤로가기·링크 공유에서 목록 상태가 유지된다.
 */
export default function ComplaintList() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || 'ALL';
  const keyword = params.get('keyword') || '';
  const page = Number(params.get('page') || 0);

  const [keywordInput, setKeywordInput] = useState(keyword);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setKeywordInput(keyword); }, [keyword]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    const query = new URLSearchParams({ category, keyword, page: String(page) });
    fetch(`/api/public/complaints?${query}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('민원 목록을 불러오지 못했습니다.');
        return response.json();
      })
      .then(setData)
      .catch((exception) => {
        if (exception.name !== 'AbortError') setError(exception.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, keyword, page]);

  const update = (patch) => setParams({ category, keyword, page: '0', ...patch });

  return (
    <main className="page">
      <section className="board">
        <div className="toolbar">
          <nav aria-label="민원 분류">
            {CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={category === value ? 'chip is-active' : 'chip'}
                onClick={() => update({ category: value })}
              >
                {label}
              </button>
            ))}
          </nav>

          <form
            className="search"
            onSubmit={(event) => {
              event.preventDefault();
              update({ keyword: keywordInput.trim() });
            }}
          >
            <input
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              placeholder="제목 검색"
            />
            <button type="submit">검색</button>
          </form>
        </div>

        <p className="meta">총 <strong>{data?.totalElements ?? 0}</strong>건</p>

        {loading && <p className="message">목록을 불러오는 중입니다.</p>}
        {error && <p className="message error">{error}</p>}

        {!loading && !error && data && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>번호</th><th>분류</th><th>진행상황</th>
                  <th>제목</th><th>작성자</th><th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.complaintNo}>
                    <td>{item.complaintNo}</td>
                    <td>
                      <span className={`badge category-${item.categoryCode.toLowerCase()}`}>
                        {item.categoryLabel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge status-${item.statusCode.toLowerCase()}`}>
                        {item.statusLabel}
                      </span>
                    </td>
                    <td className="title">
                      {/* 상세는 비밀글 인증이 필요해 기존 Thymeleaf 화면을 그대로 쓴다. */}
                      <a href={`/complaints/view/${item.complaintNo}`}>🔒 {item.title}</a>
                    </td>
                    <td>{item.maskedWriterName}</td>
                    <td>{item.registeredDate}</td>
                  </tr>
                ))}
                {data.items.length === 0 && (
                  <tr><td colSpan="6" className="message">검색 결과가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="board-footer">
          <div className="pagination">
            <button
              type="button"
              disabled={!data || data.first}
              onClick={() => setParams({ category, keyword, page: String(page - 1) })}
            >
              이전
            </button>
            <span>{data && data.totalPages > 0 ? `${data.page + 1} / ${data.totalPages}` : '0 / 0'}</span>
            <button
              type="button"
              disabled={!data || data.last}
              onClick={() => setParams({ category, keyword, page: String(page + 1) })}
            >
              다음
            </button>
          </div>
          <Link
            className="write"
            to={`/complaints/new?category=${category === 'ALL' ? 'COMPLAINT' : category}`}
          >
            글쓰기
          </Link>
        </div>
      </section>
    </main>
  );
}
