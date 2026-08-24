# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-24

### Added
- Complete rebrand to **AuraMeet AI**.
- Next.js 14 App Router integration.
- Supabase Authentication (GoTrue) integration.
- Supabase PostgreSQL database schemas (`meetings`, `meeting_chunks`).
- Supabase Storage bucket for raw audio files.
- Groq `openai/gpt-oss-120b` LLM integration for Executive Summaries and Action Items.
- Groq `whisper-large-v3` API integration for sub-second ASR transcription.
- Vector Database (`pgvector`) initialization.
- Local embeddings generation via HuggingFace `@xenova/transformers`.
- Retrieval-Augmented Generation (RAG) Chat interface.
- Interactive Kanban Board for Task Management.
- Framer Motion animations and glassmorphism UI.
- Dark/Light mode theme toggling.
- PDF Export functionality.
- Dashboard Meeting management (Delete cascading).

### Fixed
- Next-Themes hydration mismatch.
- Empty payload anonymous sign-in prevention.
- Audio player WaveSurfer canvas resizing.
