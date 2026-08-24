# System Architecture

Below is the technical architecture for AuraMeet AI, mapping the flow of data from the client UI, through our Next.js API layer, and out to our respective AI and Database microservices.

```mermaid
graph TD
    %% Styling
    classDef frontend fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef backend fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#fff;
    classDef database fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef ai fill:#701a75,stroke:#d946ef,stroke-width:2px,color:#fff;

    %% Nodes
    Client["Client UI (Next.js & Tailwind)"]:::frontend
    API["Next.js Server (API Routes)"]:::backend
    
    subgraph Supabase
        Auth["GoTrue Auth"]:::database
        DB["PostgreSQL (Meetings Table)"]:::database
        Vector["pgvector (Meeting Chunks)"]:::database
        Storage["Storage Buckets (Audio)"]:::database
    end
    
    subgraph External AI
        GroqWhisper["Groq: whisper-large-v3"]:::ai
        GroqLLM["Groq: gpt-oss-120b"]:::ai
        HuggingFace["@xenova (Local Embeddings)"]:::ai
    end

    %% Connections
    Client -->|User Actions & Audio| API
    Client -.->|Direct JWT Login| Auth
    
    API -->|Upload Audio File| Storage
    API -->|Fetch Transcript| GroqWhisper
    API -->|Chunk Transcript| HuggingFace
    
    API -->|Insert JSON Report| DB
    API -->|Insert Vector Embeddings| Vector
    
    API -->|Prompt with Context| GroqLLM
    
    %% RAG Flow
    Vector -.->|Cosine Similarity Search| API
```
