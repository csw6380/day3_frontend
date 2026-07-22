import { useEffect, useState, useRef } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ==== 커스텀 드롭다운(선택창) 컴포넌트 ====
const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  // 메뉴 바깥 클릭 시 닫히도록 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="custom-select-container" ref={selectRef}>
      <div className="custom-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption ? selectedOption.label : ''}</span>
        <span className="arrow" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>
      {isOpen && (
        <ul className="custom-select-menu">
          {options.map(opt => (
            <li
              key={opt.value}
              className={`custom-select-option ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


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
  
  // 모달 열림/닫힘 상태
  const [isModalOpen, setIsModalOpen] = useState(false)

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
        setIsModalOpen(false) // 등록 후 모달 닫기
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
          <h4 className="sub-title">MY BOARD</h4>
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
          /* ==== [기본 목록 모드] ==== */
          <div className="chat-list-view">
            <div className="board-header">
              <h1>커뮤니티 게시판</h1>
            </div>

            <div className="control-panel">
              <input 
                type="text" 
                placeholder="제목 검색..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="search-input"
              />
              <CustomSelect 
                value={sortBy} 
                onChange={setSortBy} 
                options={[
                  { value: 'created_at', label: '최신 순' },
                  { value: 'title', label: '제목 가나다 순' },
                  { value: 'name', label: '이름 가나다 순' }
                ]}
              />
              <CustomSelect 
                value={sortOrder} 
                onChange={setSortOrder} 
                options={[
                  { value: 'desc', label: '내림차순' },
                  { value: 'asc', label: '오름차순' }
                ]}
              />
              <button className="primary-btn write-btn" onClick={() => setIsModalOpen(true)}>
                ✍️ 새 글 작성
              </button>
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
              {messages.length === 0 && <p className="empty-msg">작성된 게시글이 없습니다.</p>}
            </ul>
          </div>
        )}
        
        {/* ==== [게시글 작성 모달] ==== */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>새 게시글 작성</h2>
                <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
              </div>
              <div className="modal-body">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="게시물 제목을 입력하세요" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="작성자 닉네임" />
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="게시글 내용을 작성해주세요..." 
                  rows="8"
                />
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>취소</button>
                <button className="primary-btn" onClick={handleSubmit}>게시글 등록</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App