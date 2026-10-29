# RAAZ AI — One AI. Many Possibilities.

A premium, full-stack AI chatbot powered by Google Gemini, built with Next.js 15, TypeScript, and Tailwind CSS.

---

## ✨ Features

| Feature | Description |
|---|---|
| **6 AI Modes** | Smart Chat, Study, Creator, Coding, RAAZ Mystery, Writing |
| **Streaming responses** | Real-time token streaming from Gemini API |
| **Markdown rendering** | Code blocks, tables, lists, bold, italic |
| **Chat history** | Stored locally in browser — never on the server |
| **Multi-language** | English, Hindi (हिंदी), Marathi (मराठी) |
| **Response styles** | Concise, Detailed, Friendly, Creative |
| **Stop generation** | Cancel streaming mid-response |
| **Copy & Regenerate** | Copy any response or regenerate the last one |
| **Rate limiting** | 20 req/min per IP (server-side) |
| **Privacy-first** | API key server-only; no chat data stored on server |

---

## 🛠️ Prerequisites

- **Node.js** ≥ 18.17 — [Download](https://nodejs.org)
- **Google Gemini API key** — [Get one free](https://aistudio.google.com/app/apikey)

---

## 🚀 Local Development Setup

### 1. Clone or open the project folder

```bash
cd "RAAZ AI"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
# Copy the example file
copy .env.example .env.local     # Windows
cp .env.example .env.local       # macOS/Linux
```

Edit `.env.local` and fill in your key:

```env
GEMINI_API_KEY=AIza...your_real_key_here
GEMINI_MODEL=gemini-1.5-flash
```

> **Never commit `.env.local`** — it is in `.gitignore`.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build

```bash
npm run build
npm start
```

Fix any TypeScript/ESLint errors before deploying.

---

## ☁️ Vercel Deployment

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `GEMINI_API_KEY` → your API key
- `GEMINI_MODEL` → `gemini-1.5-flash` (or your preferred model)

### Option B — Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. In **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your key
   - `GEMINI_MODEL` = `gemini-1.5-flash`
4. Click **Deploy**.

> ⚠️ Never add real API keys to `.env.example` or any committed file.

---

## 📁 Project Structure

```
raaz-ai/
├── app/
│   ├── api/chat/route.ts   # POST /api/chat — Gemini integration
│   ├── globals.css         # Brand design system
│   ├── layout.tsx          # Root layout + fonts + SEO
│   └── page.tsx            # Main page — state orchestration
├── components/
│   ├── ChatArea.tsx        # Message list + input + streaming
│   ├── Header.tsx          # Logo + mode pill + controls
│   ├── MessageBubble.tsx   # Markdown-rendered message bubble
│   ├── ModeSelector.tsx    # Mode chip bar
│   ├── PromptChips.tsx     # Suggested prompts (per mode)
│   ├── SettingsPanel.tsx   # Language + style + privacy
│   ├── Sidebar.tsx         # Full sidebar with history
│   └── TypingIndicator.tsx # Animated loading dots
├── lib/
│   ├── modes.ts            # Mode metadata + system prompts
│   ├── types.ts            # TypeScript interfaces
│   └── utils.ts            # Helpers: ID, localStorage, validation
├── .env.example            # Variable names only — no secrets
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🤖 AI Modes

| Mode | System Instruction Focus |
|---|---|
| ✦ Smart Chat | General knowledge, brainstorming, Q&A |
| 📚 Study Mode | Tutoring, quizzes, revision notes, math |
| 🎬 Creator Mode | YouTube scripts, hooks, content calendars |
| 💻 Coding Mode | Debug, explain, teach programming |
| 🔮 RAAZ Mystery | Interactive fiction with branching paths |
| ✍️ Writing Mode | Rewrite, translate, summarize, improve |

---

## 🔐 Security Notes

- `GEMINI_API_KEY` is read **only** in `app/api/chat/route.ts` — never exposed to the browser.
- User inputs are validated (length, empty check, format).
- Rate limiting: 20 requests/minute per IP.
- No conversation data is logged or stored on the server.

---

## 📜 Privacy

Chat history is stored only in your browser's `localStorage`. It is never sent to RAAZ AI servers. You can delete it anytime from **Settings → Clear All Chat History**.

Conversations are processed by Google Gemini to generate responses. See [Google's privacy policy](https://policies.google.com/privacy).

---

## 🧩 Customization

- **Add a new mode**: Add an entry to `MODES` in `lib/modes.ts` and a system prompt in `MODE_SYSTEM_PROMPTS`.
- **Change the model**: Update `GEMINI_MODEL` in your `.env.local` or Vercel environment variables.
- **Change colors**: Edit `tailwind.config.js` and `app/globals.css`.

---

## 📝 License

MIT — free to use, modify, and distribute.
