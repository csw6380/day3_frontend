import { useState, useEffect } from 'react'
import './App.css'   // ⚠️ 이 줄이 있어야 App.css 스타일이 적용됩니다

function App() {
  const API_URL = "https://team-00-back.onrender.com";

  // 방명록 목록 (서버에서 받아와 채움)
  const [messages, setMessages] = useState([])

  // 입력폼 2칸
  const [name, setName] = useState("")
  const [content, setContent] = useState("")

  // 꾸미기용 상태 (기능이 아니라 화면 연출용)
  const [theme, setTheme] = useState("light")        // 라이트/다크 토글
  const [removingId, setRemovingId] = useState(null) // 삭제될 때 사라지는 애니메이션

  // 화면이 뜬 다음 목록 받아오기
  useEffect(() => {
    fetch(`${API_URL}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
  }, [])

  // 등록 버튼(또는 Enter)을 누르면 실행
  const handleSubmit = () => {
    if (!name.trim() || !content.trim()) return   // 빈 메모가 생기지 않게 막기

    fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    })
      .then((res) => res.json())
      .then((newMessage) => {
        // 새 글을 맨 앞에 붙인 '새 배열'로 교체 (state는 직접 못 바꾼다)
        setMessages([newMessage, ...messages])
        setName("")
        setContent("")
      })
  }

  // 삭제 버튼을 누르면 실행
  const handleDelete = (id) => {
    setRemovingId(id)   // 해당 카드에 '사라지는' 애니메이션 클래스가 붙음

    fetch(`${API_URL}/messages/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        // 애니메이션(0.3s)이 끝난 뒤 목록에서 실제로 제거
        setTimeout(() => {
          setMessages((prev) => prev.filter((msg) => msg.id !== id))
          setRemovingId(null)
        }, 300)
      })
  }

  // --- 화면 연출용 작은 도우미들 (새 데이터/API 없이 이미 있는 값만 가공) ---

  // 이름 → 포스트잇 색 톤 (같은 사람은 항상 같은 색)
  const toneOf = (who) => {
    let sum = 0
    for (const ch of who ?? "") sum += ch.codePointAt(0)
    return sum % 6
  }

  // 이름 첫 글자 (아바타에 표시)
  const initialOf = (who) => (who?.trim()?.[0] ?? "?").toUpperCase()

  // created_at → "3분 전" 같은 상대 시간
  const timeAgo = (iso) => {
    if (!iso) return ""
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (diff < 60) return "방금 전"
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    return `${Math.floor(diff / 86400)}일 전`
  }

  return (
    <div className="app" data-theme={theme}>
      <div className="board">
        <header className="board__head">
          <div className="board__titles">
            <h1 className="board__title">우리 팀 방명록</h1>
            <p className="board__subtitle">한 마디씩 남겨주세요 ✿</p>
          </div>
          <div className="board__meta">
            <span className="count">{messages.length}개의 메모</span>
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="라이트/다크 전환"
              type="button"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </header>

        {/* 입력폼 — Enter로도 등록되도록 form 사용 */}
        <form
          className="compose"
          onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
        >
          <input
            className="compose__name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
          />
          <input
            className="compose__content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 적어주세요"
          />
          <button className="compose__submit" type="submit">남기기</button>
        </form>

        {messages.length === 0 ? (
          <div className="empty">아직 메모가 없어요. 첫 메모를 남겨보세요! 📝</div>
        ) : (
          <ul className="notes">
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={
                  `note note--${toneOf(msg.name)}` +
                  (removingId === msg.id ? " note--removing" : "")
                }
              >
                <span className="note__tape" aria-hidden="true" />
                <button
                  className="note__delete"
                  onClick={() => handleDelete(msg.id)}
                  aria-label="삭제"
                  type="button"
                >
                  ×
                </button>

                <div className="note__head">
                  <span className="note__avatar">{initialOf(msg.name)}</span>
                  <span className="note__name">{msg.name}</span>
                </div>

                <p className="note__content">{msg.content}</p>

                {msg.created_at && (
                  <time className="note__time">{timeAgo(msg.created_at)}</time>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App