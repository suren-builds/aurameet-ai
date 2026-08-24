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
  // Use a singleton pattern attached to global to persist across hot reloads in dev
  if (!(global as any).embeddingPipeline) {
    (global as any).embeddingPipeline = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return (global as any).embeddingPipeline;
}

// Function to chunk transcript roughly by paragraphs/sentences
function chunkText(text: string, maxTokens = 500) {
  // Simple heuristic: split by double newlines or sentences, keeping them under ~500 chars
  const chunks = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
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

    // 1. Upload Audio
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { error: uploadError } = await supabase.storage
      .from('meeting-audio')
      .upload(fileName, file);

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // 2. Transcribe Audio
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3",
    });
    const transcript = transcription.text;

    // 3. Generate Summary & Extraction
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: `You are an expert executive assistant. Analyze the meeting transcript and extract intelligence.
          You MUST respond with a valid JSON object matching this exact schema:
          {
            "summary": "Detailed executive summary string",
            "productivity_score": 85,
            "sentiment": "positive",
            "action_items": [
              {
                "id": "unique_string",
                "task": "Task description",
                "assignee": "Name or Unassigned",
                "priority": "High",
                "status": "Pending"
              }
            ]
          }
          Ensure output is strictly valid JSON.`
        },
        {
          role: "user",
          content: `Transcript:\n\n${transcript}`
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    let rawText = completion.choices[0]?.message?.content || "{}";
    rawText = rawText.replace(/```json/i, "").replace(/```/g, "").trim();
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch (e) {
      throw new Error("Invalid JSON response from LLM");
    }

    // 4. INSERT new meeting
    const { data: meetingData, error: insertError } = await supabase
      .from('meetings')
      .insert({ 
        user_id: user.id,
        title: file.name,
        audio_url: fileName,
        transcript: transcript,
        summary: parsedResult.summary, 
        action_items: parsedResult.action_items,
        productivity_score: parsedResult.productivity_score,
        sentiment: parsedResult.sentiment
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // 5. VECTOR DB: Chunk and Embed Transcript
    try {
      const extractor = await getPipeline();
      const chunks = chunkText(transcript);
      
      const insertPromises = chunks.map(async (chunkStr) => {
        // Generate embedding (384 dimensions for all-MiniLM-L6-v2)
        const output = await extractor(chunkStr, { pooling: 'mean', normalize: true });
        const embeddingArray = Array.from(output.data);
        
        return supabase.from('meeting_chunks').insert({
          meeting_id: meetingData.id,
          content: chunkStr,
          embedding: embeddingArray
        });
      });

      await Promise.all(insertPromises);
      console.log(`Successfully embedded ${chunks.length} chunks for meeting ${meetingData.id}`);
    } catch (embeddingError) {
      console.error("Embedding generation failed, but meeting was saved:", embeddingError);
      // We don't throw here to avoid failing the overall request if embeddings fail
    }

    return NextResponse.json({ success: true, meetingId: meetingData.id, ...parsedResult });
  } catch (error: any) {
    console.error("Summarize API error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}