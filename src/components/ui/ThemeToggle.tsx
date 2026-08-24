"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-md bg-card border border-card-border"></div>;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-md bg-card border border-card-border hover:bg-card/80 transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 absolute transition-all dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="h-5 w-5 absolute transition-all rotate-90 scale-0 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </motion.button>
  );
}
