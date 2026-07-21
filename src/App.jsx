import { useEffect, useState } from 'react'

import './App.css'

// Vite 환경변수로 API 주소를 관리합니다.
// 로컬: .env, 배포: Vercel의 Environment Variables에 VITE_API_URL 설정
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function App() {
  const [messages, setMessages] = useState([])
  const [name, setName] = useState('')
  const [content, setContent] = useState('')

  // 화면이 뜨면 목록 받아오기
  useEffect(() => {
    fetch(`${API_URL}/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data))
  }, [])

  // 등록 버튼
  const handleSubmit = () => {
    fetch(`${API_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content }),
    })
      .then((res) => res.json())
      .then((newMessage) => {
        // spread: 새 글을 앞에 붙인 '새 배열' (서버 정렬과 일치)
        setMessages([newMessage, ...messages])
        setName('')
        setContent('')
      })
  }

  return (
    <div>
      <h1>우리 팀 방명록</h1>
      <div>
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
        <button onClick={handleSubmit}>남기기</button>
      </div>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            <strong>{msg.name}</strong>: {msg.content}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App