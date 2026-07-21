# Guestbook Front Starter

## Setup

1. Node.js 설치
   - Node.js 18 이상 버전을 사용하세요.

2. 프로젝트 의존성 설치

```bash
npm install
```

3. 개발 서버 실행

```bash
npm run dev
```

4. 빌드

```bash
npm run build
```

5. 빌드 결과 미리보기

```bash
npm run preview
```

## 주요 명령어

- `npm run dev` — 개발 서버 실행
- `npm run build` — 프로덕션 빌드 생성
- `npm run preview` — 빌드된 결과 미리보기
- `npm run lint` — ESLint 검사

## API 주소 설정

1. 로컬에서 환경변수 파일 만들기

```bash
cp .env.example .env
```

2. `.env` 파일에서 실제 API 주소로 수정

```env
VITE_API_URL=http://localhost:3000
```

3. Vercel 배포 시 환경변수 설정

- Vercel 프로젝트의 Settings → Environment Variables에서
- 이름: `VITE_API_URL`
- 값: 실제 백엔드 URL(예: `https://your-backend.vercel.app`)

> Vite는 `VITE_` 접두사가 붙은 환경변수만 클라이언트에서 사용할 수 있습니다.
