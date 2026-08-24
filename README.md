# AuraMeet AI 🎙️

AuraMeet AI is a production-grade, AI-powered meeting intelligence platform. It seamlessly transcribes meeting audio, generates actionable executive summaries, extracts structured tasks, and uses a Retrieval-Augmented Generation (RAG) Vector Database to allow users to contextually chat with their past meetings.

## ✨ Key Features
- **Ultra-Fast Transcription**: Uses OpenAI's `whisper-large-v3` via Groq for highly accurate, sub-second audio transcription.
- **AI Executive Summaries**: Powered by `gpt-oss-120b`, automatically pulling out Key Decisions, Sentiments, and Productivity Scores.
- **Interactive Action Items**: Extracts assigning tasks into a dynamic, interactive Kanban board.
- **Vector DB & RAG Chat**: Slices transcripts into semantic chunks, creates `all-MiniLM-L6-v2` embeddings, and stores them in Supabase `pgvector` for hyper-accurate, context-aware Q&A against past meetings.
- **Breathtaking UI/UX**: Built with Next.js App Router, Tailwind CSS, and Framer Motion for a stunning, futuristic dark-mode experience.

## 🛠️ Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (Node.js)
- **Database & Auth**: Supabase (PostgreSQL, Storage Buckets, GoTrue Auth, pgvector)
- **AI Models**: Groq API (Whisper, GPT-OSS) & HuggingFace Transformers.js
- **Audio Processing**: WaveSurfer.js

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com) account (Free Tier)
- A [Groq](https://groq.com) API Key (Free Tier)

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/aurameet-ai.git
   cd aurameet-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup:**
   Run the included `supabase.sql` file in your Supabase SQL Editor to instantly provision the tables, RLS policies, Storage buckets, and pgvector functions.

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to view the app!

## 📜 License
This project is licensed under the MIT License.
