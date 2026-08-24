"use client";

import { motion } from "framer-motion";
import { Code2, Cpu, GraduationCap, Microchip } from "lucide-react";
import Image from "next/image";

export default function SurenBuilds() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-primary/20 glow-effect flex-shrink-0 bg-card flex items-center justify-center">
            <span className="text-6xl font-bold text-primary">S</span>
          </div>
          
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 glow-text">Suren Sivakumar</h1>
            <h2 className="text-xl text-primary mb-6">Edge AI & Hardware Programming Expert</h2>
            <p className="text-lg text-foreground/80 leading-relaxed">
              I am a passionate developer with a deep interest in Edge AI, computer vision, and hardware programming. 
              Having completed my Bachelor's degree, I am currently pursuing my Master's degree at VIT Vellore. 
              My goal is to bridge the gap between complex AI models and accessible hardware.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6 border-b border-card-border pb-2">Notable Projects</h3>
        
        <div className="space-y-6">
          <ProjectCard 
            title="Raspberry Pi-Based Ambient Intelligence Assistive System"
            description="A complex assistive system built on a Raspberry Pi 4 Model B, integrating computer vision and ambient intelligence to help users interact with their environment seamlessly."
            tags={["Raspberry Pi", "Computer Vision", "Edge AI", "Python"]}
            icon={<Microchip className="w-6 h-6 text-accent" />}
          />
          <ProjectCard 
            title="AuraMeet AI"
            description="A futuristic web platform for meeting transcription and AI summaries, utilizing Groq's high-speed inference."
            tags={["Next.js", "React", "Supabase", "Groq AI", "Tailwind"]}
            icon={<Code2 className="w-6 h-6 text-primary" />}
          />
        </div>

        <div className="mt-16 p-8 glass-panel rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Education</h3>
            <p className="text-foreground/70 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Master's Degree Candidate @ VIT Vellore
            </p>
          </div>
          <Cpu className="w-16 h-16 text-foreground/10" />
        </div>
      </motion.div>
    </div>
  );
}

function ProjectCard({ title, description, tags, icon }: { title: string, description: string, tags: string[], icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded-xl glass-panel group hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-md bg-background border border-card-border">
          {icon}
        </div>
        <div>
          <h4 className="text-xl font-bold mb-2">{title}</h4>
          <p className="text-foreground/70 mb-4">{description}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 text-xs font-medium rounded-md bg-primary/10 text-primary border border-primary/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
