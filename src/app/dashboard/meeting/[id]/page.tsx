"use client";

import { useEffect, useState, use, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";
import { FileText, ListTodo, MessageSquare, Loader2, ArrowLeft, Download, FileJson, BarChart3, TrendingUp, Activity } from "lucide-react";
import Link from "next/link";
import { MeetingChat } from "@/components/dashboard/MeetingChat";
import { AudioPlayer } from "@/components/dashboard/AudioPlayer";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"summary" | "kanban" | "transcript" | "chat">("summary");
  const reportRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchMeeting();
  }, [resolvedParams.id]);

  const fetchMeeting = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();
      
    if (!error && data) {
      setMeeting(data);
    }
    setLoading(false);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#ffffff'
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`AuraMeet-Report-${meeting.title.substring(0,20)}.pdf`);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(meeting, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `AuraMeet-${meeting.title.substring(0,20)}.json`);
    dlAnchorElem.click();
  };

  const exportTXT = () => {
    const txt = `AuraMeet AI Intelligence Report\nTitle: ${meeting.title}\nDate: ${new Date(meeting.created_at).toLocaleString()}\n\n-- SUMMARY --\n${meeting.summary}\n\n-- ACTION ITEMS --\n${meeting.action_items?.map((t:any) => `[${t.status}] ${t.task} (Assignee: ${t.assignee}, Priority: ${t.priority})`).join('\n') || 'None'}\n\n-- TRANSCRIPT --\n${meeting.transcript}`;
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(txt);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `AuraMeet-${meeting.title.substring(0,20)}.txt`);
    dlAnchorElem.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">Meeting not found</h2>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
        <div>
          <Link href="/dashboard" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 text-sm mb-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold glow-text">{meeting.title}</h1>
          <p className="text-sm text-foreground/50 mt-1">
            {new Date(meeting.created_at).toLocaleString()}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={exportTXT} className="px-3 py-1.5 text-sm rounded-lg bg-card border border-card-border hover:bg-card/80 transition-colors">
            TXT
          </button>
          <button onClick={exportJSON} className="px-3 py-1.5 text-sm rounded-lg bg-card border border-card-border hover:bg-card/80 transition-colors flex items-center gap-1">
            <FileJson className="w-4 h-4" /> JSON
          </button>
          <button onClick={exportPDF} className="px-4 py-1.5 text-sm rounded-lg bg-primary text-white glow-effect hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>
      
      {/* Analytics Dashboard Strip */}
      {meeting.productivity_score && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 shrink-0">
          <MetricCard icon={<TrendingUp />} label="Productivity Score" value={`${meeting.productivity_score}/100`} color="text-primary" />
          <MetricCard icon={<Activity />} label="Sentiment Analysis" value={meeting.sentiment} color="text-green-500" capitalize />
          <MetricCard icon={<ListTodo />} label="Action Items" value={meeting.action_items?.length || 0} color="text-accent" />
          <MetricCard icon={<BarChart3 />} label="Status" value="Indexed" color="text-blue-400" />
        </div>
      )}

      {/* Audio Player */}
      {meeting.audio_url && (
        <div className="mb-6 shrink-0">
          <AudioPlayer audioUrl={meeting.audio_url} />
        </div>
      )}

      <div className="flex gap-4 mb-6 shrink-0 border-b border-card-border overflow-x-auto pb-2">
        <TabButton active={activeTab === "summary"} onClick={() => setActiveTab("summary")} icon={<FileText className="w-4 h-4" />} label="Executive Summary" />
        <TabButton active={activeTab === "kanban"} onClick={() => setActiveTab("kanban")} icon={<ListTodo className="w-4 h-4" />} label="Kanban Board" />
        <TabButton active={activeTab === "transcript"} onClick={() => setActiveTab("transcript")} icon={<BarChart3 className="w-4 h-4" />} label="Raw Transcript" />
        <TabButton active={activeTab === "chat"} onClick={() => setActiveTab("chat")} icon={<MessageSquare className="w-4 h-4" />} label="AuraMeet Chat" />
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "summary" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full overflow-y-auto pr-4">
            <div ref={reportRef} className="p-8 rounded-xl glass-panel relative">
              <div className="absolute top-8 right-8 text-foreground/20 pointer-events-none">
                <span className="font-bold text-4xl">AuraMeet AI</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-card-border pb-4">
                <FileText className="w-6 h-6 text-primary" /> Executive Summary
              </h3>
              {meeting.summary ? (
                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {meeting.summary}
                </div>
              ) : (
                <p className="text-foreground/50 italic">Summary is still generating or failed.</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "kanban" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
             <KanbanBoard initialTasks={meeting.action_items || []} />
          </motion.div>
        )}

        {activeTab === "transcript" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full overflow-y-auto pr-4">
            <div className="p-6 rounded-xl glass-panel">
              <h3 className="text-xl font-bold mb-4">Raw Transcript (Whisper Sub-Second Alignment)</h3>
              {meeting.transcript ? (
                <div className="text-foreground/70 leading-loose whitespace-pre-wrap font-mono text-sm">
                  {meeting.transcript}
                </div>
              ) : (
                <p className="text-foreground/50 italic">Transcript not available.</p>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "chat" && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="h-full">
             <MeetingChat meetingId={meeting.id} transcript={meeting.transcript || ""} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-primary text-white glow-effect' : 'text-foreground/60 hover:text-foreground hover:bg-card'}`}>
      {icon} {label}
    </button>
  );
}

function MetricCard({ icon, label, value, color, capitalize }: { icon: React.ReactNode, label: string, value: string | number, color: string, capitalize?: boolean }) {
  return (
    <div className="p-4 rounded-xl glass-panel flex flex-col items-center justify-center text-center">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className={`text-xl font-bold mb-1 ${capitalize ? 'capitalize' : ''}`}>{value}</div>
      <div className="text-xs text-foreground/60 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}
