"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mic, Zap, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center pt-20 pb-32">
      {/* Hero Section */}
      <section className="container mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6 inline-block">
            Powered by Groq AI
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 glow-text">
            AuraMeet AI
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-10">
            Transcribe, analyze, and extract action items from your meetings at the speed of thought.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-primary text-white text-lg font-semibold glow-effect hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/about-platform">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-card border border-card-border text-foreground text-lg font-semibold hover:bg-card/80 transition-all"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 mt-32">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Mic className="w-8 h-8 text-primary" />}
            title="Instant Transcription"
            description="Upload your meeting audio and get highly accurate text transcripts powered by Whisper."
            delay={0.1}
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-accent" />}
            title="AI Summaries"
            description="Llama 3 rapidly analyzes the transcript to generate concise summaries and highlight key decisions."
            delay={0.2}
          />
          <FeatureCard
            icon={<CheckCircle className="w-8 h-8 text-green-500" />}
            title="Action Items"
            description="Automatically extract tasks and action items so your team knows exactly what to do next."
            delay={0.3}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="p-8 rounded-2xl glass-panel relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
      <div className="mb-6 inline-block p-4 rounded-xl bg-background border border-card-border shadow-lg">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-foreground/70 leading-relaxed">{description}</p>
    </motion.div>
  );
}
