import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { meetingId, audioPath, append } = await req.json();

    if (!meetingId || !audioPath) {
      return NextResponse.json({ error: 'Missing meetingId or audioPath' }, { status: 400 });
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

    // Download the chunk from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('meeting-audio')
      .download(audioPath);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return NextResponse.json({ error: 'Failed to download audio chunk' }, { status: 500 });
    }

    const file = new File([fileData], 'audio.mp3', { type: fileData.type || 'audio/mp3' });

    // Call Groq Whisper API
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      response_format: "text",
    });

    const transcriptText = transcription as unknown as string;

    // Get current transcript if appending
    let newTranscript = transcriptText;
    if (append) {
      const { data: meeting } = await supabase
        .from('meetings')
        .select('transcript')
        .eq('id', meetingId)
        .single();
        
      if (meeting && meeting.transcript) {
        newTranscript = meeting.transcript + " " + transcriptText;
      }
    }

    // Update meeting with transcript
    const { error: updateError } = await supabase
      .from('meetings')
      .update({ transcript: newTranscript })
      .eq('id', meetingId)
      .eq('user_id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, text: transcriptText });
  } catch (error: any) {
    console.error("Transcription API error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
