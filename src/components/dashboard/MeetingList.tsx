"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, FileAudio, FileText, ArrowRight, TrendingUp, Activity } from "lucide-react";

export function MeetingList() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setMeetings(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-xl bg-card border border-card-border animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 p-8 rounded-xl glass-panel">
        <FileAudio className="w-12 h-12 text-foreground/20 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No intelligence gathered yet</h3>
        <p className="text-foreground/60">Upload your first audio file above to initialize the AuraMeet pipeline.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {meetings.map((meeting, i) => (
        <motion.div
          key={meeting.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Link href={`/dashboard/meeting/${meeting.id}`}>
            <div className="p-6 rounded-xl glass-panel group hover:border-primary/50 transition-all h-full flex flex-col cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full group-hover:bg-primary/10 transition-colors"></div>
              
              <h4 className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {meeting.title}
              </h4>
              
              <div className="flex items-center gap-4 text-xs text-foreground/60 mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(meeting.created_at).toLocaleDateString()}
                </span>
                
                {meeting.productivity_score && (
                  <span className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-3 h-3" /> Score: {meeting.productivity_score}/100
                  </span>
                )}
                
                {meeting.sentiment && (
                  <span className={`flex items-center gap-1 capitalize font-medium
                    ${meeting.sentiment === 'positive' ? 'text-green-500' : 
                      meeting.sentiment === 'negative' ? 'text-red-500' : 'text-blue-500'}
                  `}>
                    <Activity className="w-3 h-3" /> {meeting.sentiment}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-foreground/70 line-clamp-3 mb-4 flex-1">
                {meeting.summary ? meeting.summary : "Processing intelligence..."}
              </p>
              
              <div className="flex items-center justify-between text-sm font-medium text-primary mt-auto">
                <span>View Intelligence</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
