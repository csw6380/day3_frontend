import { useEffect, useState, useRef } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// ==== 커스텀 드롭다운(선택창) 컴포넌트 ====
const CustomSelect = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 💡 [추가] 앱이 처음 열리거나 새로고침될 때 토큰을 확인하여 자동 로그인 처리
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}` // Header에 토큰을 포함시켜 전달
        }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('토큰이 만료되었거나 유효하지 않습니다.');
        })
        .then((data) => {
          setCurrentUser(data.user); // 유효한 토큰이면 사용자 정보 복원
        })
        .catch(() => {
          // 만료되었거나 유효하지 않은 토큰이면 삭제 처리
          localStorage.removeItem('token');
          setCurrentUser(null);
        });
    }
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
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 💡 [수정완료] 로그인 및 회원가입 상태를 App 컴포넌트 내부로 이동
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  const [signupForm, setSignupForm] = useState({
    email: '', name: '', nickname: '', password: '', passwordConfirm: ''
  })
  
  const [loginForm, setLoginForm] = useState({
    email: '', password: ''
  })

  const fetchMessages = () => {
    const query = new URLSearchParams({ search: searchQuery, sort: sortBy, order: sortOrder }).toString();
    fetch(`${API_URL}/messages?${query}`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(() => {
      fetchMessages()
    }, 3000)
    return () => clearInterval(interval)
  }, [searchQuery, sortBy, sortOrder])

  const handleSubmit = () => {
    // 💡 로그인 여부 확인
    if (!currentUser) return alert('로그인 후 이용해주세요.');
    if (!title || !content) return alert('제목과 내용을 모두 입력해주세요.');
    
    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 💡 name 필드에 직접 입력값이 아닌 로그인된 유저의 닉네임을 넣습니다.
      body: JSON.stringify({ title, name: currentUser.nickname, content }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchMessages()
        setTitle('')
        setContent('') // 💡 name 상태는 더 이상 사용하지 않으므로 초기화 불필요
        setIsModalOpen(false)
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
    // 💡 로그인 여부 확인
    if (!currentUser) return alert('로그인 후 이용해주세요.');
    if (!commentContent) return alert('댓글 내용을 입력해주세요.');

    fetch(`${API_URL}/messages/${selectedMessage.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 💡 name 필드에 로그인된 유저의 닉네임 할당
      body: JSON.stringify({ name: currentUser.nickname, content: commentContent }),
    })
      .then((res) => res.json())
      .then((newComment) => {
        setComments([...comments, newComment])
        setCommentContent('') // 💡 commentName 상태는 더 이상 사용하지 않으므로 초기화 불필요
      })
  }

  // ==== 회원가입 처리 로직 ====
  // ==== [수정] 진짜 서버와 연동된 회원가입 처리 ====
  const handleSignup = async () => {
    const { email, name, nickname, password, passwordConfirm } = signupForm;

    if (!email || !name || !nickname || !password || !passwordConfirm) {
      return alert('모든 항목을 입력해주세요.');
    }
    if (!email.endsWith('@gsm.hs.kr')) {
      return alert('@gsm.hs.kr 이메일 계정만 가입할 수 있습니다.');
    }
    if (password !== passwordConfirm) {
      return alert('비밀번호가 일치하지 않습니다.');
    }

    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, nickname, password })
      });
      const data = await response.json();

      if (!response.ok) {
        return alert(data.error); // 서버에서 보낸 에러 메시지 띄우기
      }

      alert(data.message); // 가입 완료 메시지
      setIsSignupModalOpen(false);
      setIsLoginModalOpen(true); // 가입 성공 시 바로 로그인 창 띄우기
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }

  // ==== [수정] 진짜 서버와 연동된 로그인 처리 ====
  // ==== [수정] 로그인 처리 (토큰 저장 로직 추가) ====
  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) return alert('이메일과 비밀번호를 입력해주세요.');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await response.json();

      if (!response.ok) {
        return alert(data.error);
      }

      // 💡 [추가] 브라우저에 JWT 토큰 저장
      localStorage.setItem('token', data.token);

      setCurrentUser(data.user);
      setIsLoginModalOpen(false);
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      alert('서버와 통신 중 오류가 발생했습니다.');
    }
  }

  // ==== [수정] 로그아웃 처리 (토큰 삭제 로직 추가) ====
  const handleLogout = () => {
    // 💡 [추가] 저장되어 있던 토큰 삭제
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

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
            {currentUser ? (
              <div className="user-info">
                <span className="user-nickname">{currentUser.nickname}님</span>
                <button className="auth-btn" onClick={handleLogout}>로그아웃</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="auth-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
                <button className="auth-btn highlight" onClick={() => setIsSignupModalOpen(true)}>회원가입</button>
              </div>
            )}
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
                {/* 💡 기존의 닉네임 입력창(<input value={commentName}... />) 삭제 */}
                <input 
                  value={commentContent} 
                  onChange={(e) => setCommentContent(e.target.value)} 
                  placeholder={currentUser ? "댓글을 남겨보세요..." : "로그인 후 댓글을 작성할 수 있습니다."} 
                  className="input-content" 
                  disabled={!currentUser} /* 로그인이 안 되어있으면 입력창 비활성화 */
                />
                <button onClick={handleCommentSubmit} className="send-btn" disabled={!currentUser}>
                  등록
                </button>
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
              <button 
                className="primary-btn write-btn" 
                onClick={() => {
                  if (!currentUser) {
                    alert('로그인이 필요합니다. 먼저 로그인해 주세요!');
                    setIsLoginModalOpen(true);
                    return;
                  }
                  setIsModalOpen(true);
                }}
              >
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
                {/* 💡 기존의 닉네임 입력창(<input value={name}... />) 삭제 */}
                <textarea 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)} 
                  placeholder="게시글 내용을 작성해주세요..." 
                  rows="8"
                />
              </div>
              <div className="modal-footer">
                {/* 💡 비로그인 상태 시 안내 경고문 표시 (선택 사항) */}
                {!currentUser && (
                  <span style={{ color: '#ff6b6b', fontSize: '13px', marginRight: 'auto' }}>
                    ⚠️ 로그인이 필요합니다.
                  </span>
                )}
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>취소</button>
                <button 
                  className="primary-btn" 
                  onClick={handleSubmit}
                  /* 💡 [핵심] !currentUser 조건을 추가하여 로그인 안 되어있으면 입력칸을 다 채워도 비활성화 */
                  disabled={!currentUser || !title || !content}
                >
                  {currentUser ? '게시글 등록' : '로그인 필요'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==== [회원가입 모달] ==== */}
        {isSignupModalOpen && (
          <div className="modal-overlay" onClick={() => setIsSignupModalOpen(false)}>
            <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
              <h2>회원가입</h2>
              <div className="modal-body">
                <input 
                  type="email" 
                  placeholder="이메일 (@gsm.hs.kr)" 
                  value={signupForm.email} 
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})} 
                />
                <input 
                  type="text" 
                  placeholder="이름 (실명)" 
                  value={signupForm.name} 
                  onChange={(e) => setSignupForm({...signupForm, name: e.target.value})} 
                />
                <input 
                  type="text" 
                  placeholder="사용할 닉네임" 
                  value={signupForm.nickname} 
                  onChange={(e) => setSignupForm({...signupForm, nickname: e.target.value})} 
                />
                <input 
                  type="password" 
                  placeholder="비밀번호" 
                  value={signupForm.password} 
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})} 
                />
                <input 
                  type="password" 
                  placeholder="비밀번호 확인" 
                  value={signupForm.passwordConfirm} 
                  onChange={(e) => setSignupForm({...signupForm, passwordConfirm: e.target.value})} 
                />
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsSignupModalOpen(false)}>취소</button>
                <button className="primary-btn" onClick={handleSignup}>가입하기</button>
              </div>
            </div>
          </div>
        )}

        {/* ==== [로그인 모달] ==== */}
        {isLoginModalOpen && (
          <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
            <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
              <h2>로그인</h2>
              <div className="modal-body">
                <input 
                  type="email" 
                  placeholder="이메일" 
                  value={loginForm.email} 
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} 
                />
                <input 
                  type="password" 
                  placeholder="비밀번호" 
                  value={loginForm.password} 
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                />
              </div>
              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setIsLoginModalOpen(false)}>취소</button>
                <button className="primary-btn" onClick={handleLogin}>로그인</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App