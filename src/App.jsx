import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const [messages, setMessages] = useState([])
  const [title, setTitle] = useState('')
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [comments, setComments] = useState([])
  const [commentName, setCommentName] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)

  const fetchMessages = () => {
    const query = new URLSearchParams({ search: searchQuery, sort: sortBy, order: sortOrder }).toString();
    fetch(`${API_URL}/messages?${query}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
  }

  useEffect(() => {
    fetchMessages()
  }, [searchQuery, sortBy, sortOrder])

  const handleSubmit = () => {
    if (!title || !name || !content) return alert('모든 항목을 입력해주세요.');
    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, name, content }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchMessages()
        setTitle('')
        setName('')
        setContent('')
      })
  }

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg)
    fetch(`${API_URL}/messages/${msg.id}/comments`)
      .then((res) => res.json())
      .then((data) => setComments(data))
  }

  const handleBackToList = () => {
    setSelectedMessage(null)
    setComments([])
  }

  const handleCommentSubmit = () => {
    if (!commentName || !commentContent) return alert('댓글 항목을 모두 입력해주세요.');
    fetch(`${API_URL}/messages/${selectedMessage.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: commentName, content: commentContent }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        setComments([...comments, newComment])
        setCommentName('')
        setCommentContent('')
      })
  }

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  }

  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  }

  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="app-container">
        
        <header className="top-header">
          <h4 className="sub-title">MY CHATS</h4>
          <div className="header-actions">
            <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? '☀️ 화이트모드' : '🌙 다크모드'}
            </button>
          </div>
        </header>

        {/* ==== [게시판 상세 보기 모드] ==== */}
        {selectedMessage ? (
          <div className="article-view">
            <div className="article-header">
              <button className="back-btn" onClick={handleBackToList}>← 목록으로 돌아가기</button>
              <h2 className="article-title">{selectedMessage.title || '제목 없음'}</h2>
              <div className="article-meta">
                <span className="article-author">{selectedMessage.name || '알 수 없음'}</span>
                <span className="article-date">
                  {formatDate(selectedMessage.created_at)} {formatTime(selectedMessage.created_at)}
                </span>
              </div>
            </div>

            <div className="article-body">
              {selectedMessage.content}
            </div>

            <div className="comments-section">
              <h3 className="comments-count">댓글 {comments.length}</h3>
              <ul className="comments-list">
                {comments.map((c) => (
                  <li key={c.id} className="comment-item">
                    <div className="comment-author">{c.name}</div>
                    <div className="comment-content">{c.content}</div>
                    <div className="comment-date">
                      {formatDate(c.created_at)} {formatTime(c.created_at)}
                    </div>
                  </li>
                ))}
                {comments.length === 0 && <p className="empty-msg">아직 작성된 댓글이 없습니다.</p>}
              </ul>

              <div className="comment-input-area">
                <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="닉네임" className="input-name" />
                <input value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="댓글을 남겨보세요..." className="input-content" />
                <button onClick={handleCommentSubmit} className="send-btn">등록</button>
              </div>
            </div>
          </div>
        ) : (
          /* ==== [기본 목록 모드 (리스트 유지)] ==== */
          <div className="chat-list-view">
            <div className="board-header">
              <h1>저장된 채팅</h1>
            </div>

            <div className="control-panel">
              <input type="text" placeholder="제목 검색..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="created_at">최신 순</option>
                <option value="title">제목 가나다 순</option>
                <option value="name">이름 가나다 순</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>

            <div className="create-panel">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="채팅방(게시물) 제목" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="작성자 이름" />
              <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="게시글 내용" />
              <button onClick={handleSubmit} className="primary-btn">+</button>
            </div>

            <ul className="chat-list">
              {messages.map((msg) => {
                const safeTitle = msg.title || '제목 없음';
                const safeName = msg.name || '알 수 없음';
                
                return (
                  <li key={msg.id} className="chat-item" onClick={() => handleSelectMessage(msg)}>
                    <div className="chat-avatar">
                      {safeTitle.charAt(0)}
                    </div>
                    <div className="chat-info">
                      <div className="chat-title">{safeTitle}</div>
                      <div className="chat-preview">{safeName}</div>
                    </div>
                    <div className="chat-meta">
                      <div className="chat-date">{formatDate(msg.created_at)}</div>
                    </div>
                  </li>
                )
              })}
              {messages.length === 0 && <p className="empty-msg">개설된 채팅방이 없습니다.</p>}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default App