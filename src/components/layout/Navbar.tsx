"use client";

import Link from "next/link";
import { ThemeToggle } from "../ui/ThemeToggle";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full glass-panel"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center glow-effect"
          >
            <span className="text-white font-bold">M</span>
          </motion.div>
          <span className="font-bold text-lg tracking-tight">
            AuraMeet AI <span className="text-primary/70 font-normal">| A Suren&apos;s Build</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/about-platform" className="hover:text-primary transition-colors">
              Platform
            </Link>
            <Link href="/suren-builds" className="hover:text-primary transition-colors">
              Founder
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sign Out
              </motion.button>
            ) : (
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-md bg-primary text-white text-sm font-medium glow-effect hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
