# AskPDF — Chat with your PDFs (RAG)

A **Retrieval-Augmented Generation (RAG)** chat application. Upload a PDF and ask
questions about it — answers are grounded **strictly in the uploaded document**.
The model retrieves the most relevant chunks of your PDF and is instructed to
refuse anything it can't find in that context, so it won't hallucinate answers
from outside the file.

## Features

### 📄 Chat with your PDF
Upload a PDF and ask questions in natural language. The app embeds the document,
retrieves the most relevant passages for each question, and answers using only
that context — streamed back token-by-token in real time.

### 🙋 Guest mode (no sign-up required)
Jump straight into a chat without an account. Guests get the full experience;
their data is scoped to the browser session. Sign in with Clerk anytime to keep a
persistent history across visits.

### 💾 Auto-saved chat history
Every completed exchange is written straight to the database — no "Save" button
needed. Browse past conversations, continue them, or start a new one from the
sidebar. The active conversation is highlighted.

### 🔐 Optional authentication
Sign up / sign in with Clerk (email + verification code). Authenticated users get
history that persists across sessions and devices.

### 🧠 Grounded, no-hallucination answers
Retrieval is filtered per-user and per-chat, so results never leak across users,
chats, or other PDFs. If the answer isn't in the retrieved context, the model
says so instead of making something up.

## Preview
![askpdf](https://github.com/user-attachments/assets/6ddd62dc-6514-4d56-b084-9784b5474ddc)

## 🛠️ How It Works

The app runs **two independent pipelines**:

### 1. Ingestion (on PDF upload — `/api/upload`)
`PDFLoader` extracts the text → `RecursiveCharacterTextSplitter` splits it into
chunks (size 1000, overlap 200) → each chunk is embedded with Google Gemini
(`gemini-embedding-001`) and stored in **Pinecone**, tagged with
`{ userId, chatId, pdfId }` metadata.

### 2. Query (on each question — `/api/chat`)
The question is rephrased into a standalone question (history-aware retriever) →
embedded → Pinecone runs a filtered similarity search and returns the top-10
matching chunks → those chunks are "stuffed" into the prompt as context →
Gemini (`gemini-2.5-flash`) generates the answer, **grounded only in that
context**, and streams it back to the UI.

> Embeddings/vectors are used only to *find* the right PDF chunks; the chunks'
> original *text* is what gets sent to the LLM — the model never sees a vector.

📖 A deep dive into the full flow, data model, and RAG internals lives in
[`docs/RAG-PIPELINE.md`](docs/RAG-PIPELINE.md).

## 📦 Tech Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| Auth | Clerk (`@clerk/nextjs`) — **optional**, guests allowed |
| Database | MongoDB via Mongoose |
| Vector store | Pinecone |
| Embeddings | Google Gemini `gemini-embedding-001` |
| LLM | Google Gemini `gemini-2.5-flash` (streaming + non-streaming) |
| Orchestration | LangChain (history-aware retriever + stuff-documents chain) |
| Streaming | Vercel AI SDK (`@ai-sdk/react` `useChat` + `LangChainAdapter`) |
| Client state | Redux Toolkit |
| Styling | Tailwind CSS + Radix UI / ShadCN |
| Deployment | Docker, Docker Compose, GitHub Actions CI/CD |

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/BharateshPoojary/llm-model.git
cd llm-model
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set environment variables
Create a `.env` file in the root of the project with the following keys:
```bash
# MongoDB URI
MONGODB_URI="mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE_NAME>"

# Gemini API Key (embeddings + LLM)
GEMINI_API_KEY="<YOUR_GEMINI_API_KEY>"

# Pinecone API Key (vector store)
PINECONE_API_KEY="<YOUR_PINECONE_API_KEY>"

# Clerk (Auth) Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="<YOUR_CLERK_PUBLISHABLE_KEY>"
CLERK_SECRET_KEY="<YOUR_CLERK_SECRET_KEY>"
```

### 4. Run the app
```bash
npm run dev
```
Visit: http://localhost:3000

## 🐳 Running with Docker

The app ships with a multi-stage `Dockerfile` (standalone Next.js output,
non-root user) and a `compose.yml`. Secrets are read from your `.env` file —
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is inlined at build time, the rest are
injected at runtime.

```bash
# Build and run the app
docker compose up --build

# Optionally spin up a local MongoDB alongside it
docker compose --profile local-db up
```

## 🚀 Deployment (CI/CD)

A GitHub Actions workflow (`.github/workflows/cicd.yml`) runs on every push to
`master`:

1. **Lint & Build** — fail fast before building an image.
2. **Build & Push** — build the Docker image and push it to Docker Hub (with
   registry layer caching).
3. **Deploy** — SSH into the VM and roll out the new image via `docker compose`.

## 📫 Contributing
Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

## 📄 License
This project is open-source under the [MIT License](LICENSE).

---

> **NOTE:** This assistant only answers questions about the content of the PDF you
> upload. It is deliberately constrained to the retrieved document context and
> will decline questions outside of it.
