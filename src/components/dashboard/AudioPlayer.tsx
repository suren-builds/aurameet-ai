"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publicUrl, setPublicUrl] = useState<string>("");

  const supabase = createClient();

  useEffect(() => {
    // Get public URL for the audio file
    const { data } = supabase.storage
      .from('meeting-audio')
      .getPublicUrl(audioUrl);
      
    setPublicUrl(data.publicUrl);
  }, [audioUrl, supabase]);

  useEffect(() => {
    if (!containerRef.current || !publicUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#3b82f6', // primary color
      progressColor: '#8b5cf6', // accent color
      cursorColor: '#f8fafc',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 60,
      normalize: true,
    });

    ws.load(publicUrl);

    ws.on('ready', () => setLoading(false));
    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    
    wavesurferRef.current = ws;

    // FIX: Safely destroy the instance to prevent AbortErrors
    return () => {
      try {
        if (ws) {
          ws.unAll();
          ws.destroy();
        }
      } catch (e) {
        // Silently ignore abort errors during fast hot-reloads
      }
    };
  }, [publicUrl]);

  const togglePlay = () => {
    wavesurferRef.current?.playPause();
  };

  const toggleMute = () => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    const currentMuted = ws.getMuted();
    ws.setMuted(!currentMuted);
    setIsMuted(!currentMuted);
  };

  return (
    <div className="w-full p-4 glass-panel rounded-xl flex items-center gap-4">
      <button 
        onClick={togglePlay}
        disabled={loading}
        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary/90 transition-colors glow-effect"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
      </button>

      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 text-xs text-foreground/50">
            Loading waveform...
          </div>
        )}
        <div ref={containerRef} className={`w-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`} />
      </div>

      <button 
        onClick={toggleMute}
        disabled={loading}
        className="p-2 text-foreground/70 hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </button>
    </div>
  );
}