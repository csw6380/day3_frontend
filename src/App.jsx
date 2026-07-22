import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  // --- 기존 상태들 ---
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

  // --- 새로 추가된 상태: 다크모드/화이트모드 ---
  const [isDarkMode, setIsDarkMode] = useState(true) // 기본값을 다크모드로 설정

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

  // 날짜 포맷팅 함수 (2026.6.25 형태)
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
  }

  // 시간 포맷팅 함수 (오후 8:04 형태)
  const formatTime = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  }

  // 앱 전체를 감싸는 div에 다크/라이트 모드 클래스 부여
  return (
    <div className={`app-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <div className="app-container">
        
        {/* 상단 헤더 & 모드 전환 버튼 */}
        <header className="top-header">
          <h4 className="sub-title">MY CHATS</h4>
          <div className="header-actions">
            <button className="theme-toggle-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? '☀️ 화이트모드' : '🌙 다크모드'}
            </button>
          </div>
        </header>

        {/* ==== [상세 보기 모드 (채팅방 스타일)] ==== */}
        {selectedMessage ? (
          <div className="chat-room-view">
            <div className="chat-header">
              <button className="back-btn" onClick={handleBackToList}>←</button>
              <h2>{selectedMessage.title}</h2>
            </div>

            <div className="chat-message-list">
              {/* 원본 게시글을 첫 번째 메시지로 표시 */}
              <div className="message-row">
                <div className="message-sender">{selectedMessage.name}</div>
                <div className="message-content-wrapper">
                  <div className="message-bubble original-post">{selectedMessage.content}</div>
                  <div className="message-time">
                    {formatDate(selectedMessage.created_at)}<br/>
                    {formatTime(selectedMessage.created_at)}
                  </div>
                </div>
              </div>

              {/* 댓글들을 이어지는 메시지로 표시 */}
              {comments.map((c) => (
                <div className="message-row" key={c.id}>
                  <div className="message-sender reply-sender">{c.name}</div>
                  <div className="message-content-wrapper">
                    <div className="message-bubble">{c.content}</div>
                    <div className="message-time">
                      {formatDate(c.created_at)}<br/>
                      {formatTime(c.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 댓글(메시지) 입력창 */}
            <div className="chat-input-area">
              <input value={commentName} onChange={(e) => setCommentName(e.target.value)} placeholder="이름" className="input-name" />
              <input value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="메시지를 입력하세요..." className="input-content" />
              <button onClick={handleCommentSubmit} className="send-btn">전송</button>
            </div>
          </div>
        ) : (
          /* ==== [기본 목록 모드 (채팅 목록 스타일)] ==== */
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
              <input value={content} onChange={(e) => setContent(e.target.value)} placeholder="첫 메시지 내용" />
              <button onClick={handleSubmit} className="primary-btn">+</button>
            </div>

            <ul className="chat-list">
              {messages.map((msg) => {
                // 안전장치: title이나 name이 null일 경우 기본값 설정
               const safeTitle = msg.title || '제목 없음';
               const safeName = msg.name || '알 수 없음';

               return (
                 <li key={msg.id} className="chat-item" onClick={() => handleSelectMessage(msg)}>
                    <div className="chat-avatar">
                     {safeTitle.charAt(0)} {/* 이제 무조건 값이 있으므로 에러가 안 남! */}
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