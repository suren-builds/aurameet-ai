import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Helper for local embeddings
async function getPipeline() {
  const { pipeline } = await import('@xenova/transformers');
  if (!(global as any).embeddingPipeline) {
    (global as any).embeddingPipeline = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return (global as any).embeddingPipeline;
}

export async function POST(req: Request) {
  try {
    const { meetingId, transcript, message, history } = await req.json();

    if (!meetingId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
            } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id')
      .eq('id', meetingId)
      .eq('user_id', user.id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // RAG: Retrieval Augmented Generation
    let contextText = transcript || "No transcript available.";
    
    try {
      // 1. Embed the user's question
      const extractor = await getPipeline();
      const output = await extractor(message, { pooling: 'mean', normalize: true });
      const queryEmbedding = Array.from(output.data);

      // 2. Perform Cosine Similarity Search via RPC
      const { data: chunks, error: matchError } = await supabase.rpc('match_meeting_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.2, // Lower threshold for more recall
        match_count: 5,       // Top 5 most relevant chunks
        p_meeting_id: meetingId
      });

      if (!matchError && chunks && chunks.length > 0) {
        // If we found relevant chunks, construct a hyper-specific context
        contextText = chunks.map((c: any) => c.content).join("\n\n---\n\n");
        console.log(`[RAG] Retrieved ${chunks.length} chunks for query: "${message}"`);
      } else {
        console.log("[RAG] No chunks found or error, falling back to full transcript.");
      }
    } catch (ragError) {
      console.error("[RAG] Pipeline failed, falling back to full transcript:", ragError);
    }

    // Prepare messages for Groq
    const messages = [
      {
        role: "system",
        content: `You are an AI assistant helping a user understand a past meeting. Use the following context (which may be specific chunks of the transcript or the full transcript) to answer the user's questions. If the answer is not in the context, say so.\n\nContext:\n${contextText}`
      },
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: messages as any,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
