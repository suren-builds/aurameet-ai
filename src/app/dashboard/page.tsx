"use client";

import { motion } from "framer-motion";
import { UploadArea } from "@/components/dashboard/UploadArea";
import { MeetingList } from "@/components/dashboard/MeetingList";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const handleUploadComplete = (id: string) => {
    router.push(`/dashboard/meeting/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="mb-12">
          <UploadArea onUploadComplete={handleUploadComplete} />
        </div>

        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          Recent Meetings
          <span className="h-px flex-1 bg-gradient-to-r from-card-border to-transparent ml-4"></span>
        </h2>
        
        <MeetingList />
      </motion.div>
    </div>
  );
}
