"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { motion } from "framer-motion";

export default function AuthPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <AuthForm />
      </motion.div>
    </div>
  );
}
