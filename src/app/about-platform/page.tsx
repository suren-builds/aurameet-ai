"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Server, Shield, Zap } from "lucide-react";

export default function AboutPlatform() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-8 glow-text">About AuraMeet AI</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none mb-16 text-foreground/80">
          <p className="text-xl leading-relaxed mb-6">
            AuraMeet AI is a next-generation platform designed to transform how we interact with meeting recordings. 
            By leveraging cutting-edge open-source AI models served through Groq's ultra-fast LPU inference engine, 
            we provide near-instantaneous processing of your audio.
          </p>
          <p className="text-xl leading-relaxed">
            Our mission is to eliminate the friction of post-meeting follow-ups. Stop taking notes and start engaging 
            in the conversation, knowing that AuraMeet AI is capturing every decision and action item.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <InfoCard
            icon={<Zap className="w-6 h-6 text-yellow-500" />}
            title="Groq AI Integration"
            description="Powered by Groq's LPU architecture, AuraMeet AI uses whisper-large-v3 for transcription and llama-3.3-70b-versatile for reasoning, ensuring blazing fast results."
          />
          <InfoCard
            icon={<Shield className="w-6 h-6 text-green-500" />}
            title="Secure Storage"
            description="Your audio files and transcripts are securely stored using Supabase, featuring row-level security so only you can access your data."
          />
          <InfoCard
            icon={<BrainCircuit className="w-6 h-6 text-primary" />}
            title="Interactive Agent"
            description="Don't just read the summary—chat with it. Our AI agent allows you to ask specific questions about any past meeting."
          />
          <InfoCard
            icon={<Server className="w-6 h-6 text-accent" />}
            title="Next.js App Router"
            description="Built on a modern React foundation with server-side rendering for optimal performance and SEO."
          />
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl glass-panel">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg bg-background border border-card-border shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}
