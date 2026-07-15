import './App.css'   // ⚠️ 이 줄을 지우면 App.css가 통째로 무시됩니다 (Day 1의 그 버그!)

// App — 오늘 방명록 화면을 완성할 곳
//
// 만들 것 (Day 1 + Day 2 조립):
// 1) useState로 방명록 목록 state          ← 백엔드가 안 끝났으면? 명세서의 JSON 모양대로 더미 배열 먼저!
// 2) useEffect + fetch로 GET /messages     ← Day 2 포켓몬과 같은 패턴, 주소만 우리 서버(localhost:3000)
// 3) map으로 목록 렌더링                    ← key 잊으면 콘솔이 알려준다 (F12)
// 4) 입력폼 (이름, 내용)                    ← Day 1 입력폼과 동일 코드
// 5) 등록 버튼 → POST → 응답으로 받은 새 글을 목록에 추가
//    ← 여기서 새 문법 하나 등장: setList([...list, newItem]) — 수업에서 설명합니다

function App() {
  return (
    <div>
      <h1>우리 팀 방명록</h1>
    </div>
  )
}

export default App