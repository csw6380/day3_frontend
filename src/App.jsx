import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  // 1. 게시글 목록 관련 상태
  const [messages, setMessages] = useState([])
  
  // 2. 새 글 작성 폼 상태 (제목 추가)
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')

  // 3. 검색 및 정렬 상태
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at') // created_at, title, name
  const [sortOrder, setSortOrder] = useState('desc') // desc, asc

  // 4. 상세 보기 및 댓글 상태
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [comments, setComments] = useState([])
  const [commentName, setCommentName] = useState('')
  const [commentContent, setCommentContent] = useState('')

  // 백엔드에서 게시글 목록을 가져오는 함수
  const fetchMessages = () => {
    // 검색어와 정렬 기준을 쿼리스트링으로 만들어 백엔드에 요청
    const query = new URLSearchParams({
      search: searchQuery,
      sort: sortBy,
      order: sortOrder
    }).toString();

    fetch(`${API_URL}/messages?${query}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
  }

  // 검색어, 정렬 기준이 바뀔 때마다 즉시 목록 다시 불러오기
  useEffect(() => {
    fetchMessages()
  }, [searchQuery, sortBy, sortOrder])

  // 새 글 등록
  const handleSubmit = () => {
    if (!title || !name || !content) return alert('모든 항목을 입력해주세요.');

    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, name, content }),
    })
      .then((res) => res.json())
      .then(() => {
        // 새 글이 작성되면 정렬 기준에 맞게 다시 목록을 불러옵니다 (즉시 업데이트)
        fetchMessages()
        setTitle('')
        setName('')
        setContent('')
      })
  }

  // 상세 보기 모드 진입 (특정 글 클릭 시)
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg)
    // 해당 글의 댓글 불러오기
    fetch(`${API_URL}/messages/${msg.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
  }

  // 상세 보기에서 뒤로가기
  const handleBackToList = () => {
    setSelectedMessage(null)
    setComments([])
  }

  // 댓글 등록
  const handleCommentSubmit = () => {
    if (!commentName || !commentContent) return alert('댓글 항목을 모두 입력해주세요.');

    fetch(`${API_URL}/messages/${selectedMessage.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: commentName, content: commentContent }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        // 방금 작성한 댓글을 화면 배열 끝에 즉시 추가
        setComments([...comments, newComment])
        setCommentName('')
        setCommentContent('')
      })
  }

  // ==== [화면 렌더링: 상세 보기 모드] ====
  if (selectedMessage) {
    return (
      <div>
        <button onClick={handleBackToList}>← 목록으로 돌아가기</button>
        <hr />
        <h2>{selectedMessage.title}</h2>
        <p><strong>작성자:</strong> {selectedMessage.name}</p>
        <p><strong>작성일:</strong> {new Date(selectedMessage.created_at).toLocaleString()}</p>
        <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
          {selectedMessage.content}
        </div>

        <hr />
        <h3>댓글 ({comments.length})</h3>
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              <strong>{c.name}</strong>: {c.content} <small>({new Date(c.created_at).toLocaleString()})</small>
            </li>
          ))}
        </ul>

        <div>
          <input 
            value={commentName} 
            onChange={(e) => setCommentName(e.target.value)} 
            placeholder="댓글 작성자" 
          />
          <input 
            value={commentContent} 
            onChange={(e) => setCommentContent(e.target.value)} 
            placeholder="댓글 내용" 
          />
          <button onClick={handleCommentSubmit}>댓글 달기</button>
        </div>
      </div>
    )
  }

  // ==== [화면 렌더링: 기본 목록 모드] ====
  return (
    <div>
      <h1>우리 팀 방명록</h1>

      {/* 검색 및 정렬 컨트롤 */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="제목 검색 (입력 즉시 검색)" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">올린 날짜 순</option>
          <option value="title">제목 가나다 순</option>
          <option value="name">이름 가나다 순</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="desc">내림차순</option>
          <option value="asc">오름차순</option>
        </select>
      </div>

      {/* 새 글 작성 폼 */}
      <div style={{ marginBottom: '20px' }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="게시물 제목"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
        />
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용"
        />
        <button onClick={handleSubmit}>게시물 남기기</button>
      </div>

      {/* 게시글 목록 */}
      <ul>
        {messages.map((msg) => (
          <li 
            key={msg.id} 
            onClick={() => handleSelectMessage(msg)}
            style={{ cursor: 'pointer', padding: '10px', borderBottom: '1px solid #eee' }}
          >
            <strong>[{msg.title}]</strong> {msg.name} - {msg.content.substring(0, 20)}... <small>({new Date(msg.created_at).toLocaleDateString()})</small>
          </li>
        ))}
        {messages.length === 0 && <p>게시물이 없습니다.</p>}
      </ul>
    </div>
  )
}

export default App