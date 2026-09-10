import { useEffect, useState } from 'react';

const categories = [
  ['ALL', '전체'],
  ['PRAISE', '칭찬합니다'],
  ['COMPLAINT', '불편합니다'],
  ['LOST', '분실물 문의'],
];

function ComplaintRow({ item }) {
  return (
    <tr>
      <td>{item.complaintNo}</td>
      <td><span className={`badge category-${item.categoryCode.toLowerCase()}`}>{item.categoryLabel}</span></td>
      <td><span className={`badge status-${item.statusCode.toLowerCase()}`}>{item.statusLabel}</span></td>
      <td className="title">🔒 {item.title}</td>
      <td>{item.maskedWriterName}</td>
      <td>{item.registeredDate}</td>
    </tr>
  );
}

export default function App() {
  const [category, setCategory] = useState('ALL');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ category, keyword, page: String(page) });
    setLoading(true);
    setError('');

    fetch(`/api/public/complaints?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('민원 목록을 불러오지 못했습니다.');
        return response.json();
      })
      .then(setData)
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [category, keyword, page]);

  function changeCategory(nextCategory) {
    setCategory(nextCategory);
    setPage(0);
  }

  function search(event) {
    event.preventDefault();
    setKeyword(keywordInput.trim());
    setPage(0);
  }

  return (
    <>
      <header className="header">
        <a className="brand" href="/"><span>013</span> (주) 서경 마을버스</a>
        <a href="/complaints">기존 Thymeleaf 화면 보기</a>
      </header>

      <section className="hero">
        <p>React learning page</p>
        <h1>고객의 소리를 들려주세요</h1>
        <span>민원 목록 기능만 React 컴포넌트로 분리했습니다.</span>
      </section>

      <main>
        <section className="board">
          <div className="toolbar">
            <nav aria-label="민원 분류">
              {categories.map(([value, label]) => (
                <button key={value} className={category === value ? 'active' : ''} onClick={() => changeCategory(value)}>
                  {label}
                </button>
              ))}
            </nav>
            <form onSubmit={search}>
              <input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder="제목 검색" />
              <button type="submit">검색</button>
            </form>
          </div>

          <p className="meta">총 <strong>{data?.totalElements ?? 0}</strong>건</p>
          {loading && <p className="message">목록을 불러오는 중입니다.</p>}
          {error && <p className="message error">{error}</p>}
          {!loading && !error && (
            <div className="table-wrap">
              <table>
                <thead><tr><th>번호</th><th>분류</th><th>진행상황</th><th>제목</th><th>작성자</th><th>등록일</th></tr></thead>
                <tbody>
                  {data.items.map((item) => <ComplaintRow key={item.complaintNo} item={item} />)}
                  {data.items.length === 0 && <tr><td colSpan="6" className="message">검색 결과가 없습니다.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          <div className="footer-actions">
            <div className="pagination">
              <button disabled={!data || data.first} onClick={() => setPage((value) => value - 1)}>이전</button>
              <span>{data && data.totalPages > 0 ? `${data.page + 1} / ${data.totalPages}` : '0 / 0'}</span>
              <button disabled={!data || data.last} onClick={() => setPage((value) => value + 1)}>다음</button>
            </div>
            <a className="write" href="/complaints/new">글쓰기</a>
          </div>
        </section>
      </main>
    </>
  );
}
