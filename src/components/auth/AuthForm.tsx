"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Code, Mail, Globe, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (type === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        
        // If email confirmation is disabled in Supabase, we get a session immediately.
        if (data.session) {
          window.location.href = "/dashboard";
        } else {
          setMessage("Check your email for the confirmation link!");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="p-8 rounded-2xl glass-panel relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      
      <h2 className="text-2xl font-bold mb-6 text-center">Welcome to AuraMeet AI</h2>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
          {error}
        </div>
      )}
      
      {message && (
        <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 border border-green-500/20 rounded-md">
          {message}
        </div>
      )}

      <form className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-foreground/40" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-background border border-card-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleEmailAuth(e, 'login')}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-primary text-white font-medium glow-effect hover:bg-primary/90 transition-colors flex justify-center items-center h-10"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => handleEmailAuth(e, 'signup')}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-card border border-card-border font-medium hover:bg-card/80 transition-colors flex justify-center items-center h-10"
          >
            Sign Up
          </motion.button>
        </div>
      </form>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-card-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0f172a] px-2 text-foreground/60 dark:bg-[rgba(15,23,42,0.6)]">Or continue with</span>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOAuth('google')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-card border border-card-border hover:bg-card/80 transition-colors"
        >
          <Globe className="w-5 h-5 text-red-500" />
          <span>Google</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOAuth('github')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-card border border-card-border hover:bg-card/80 transition-colors"
        >
          <Code className="w-5 h-5" />
          <span>GitHub</span>
        </motion.button>
      </div>
    </div>
  );
}
