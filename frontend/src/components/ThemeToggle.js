import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function applyStoredTheme() {
  const t = localStorage.getItem("mp_theme");
  const dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export default function ThemeToggle({ className = "" }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("mp_theme", next ? "dark" : "light");
    setDark(next);
  };

  return (
    <button
      onClick={toggle}
      data-testid="theme-toggle"
      aria-label="Changer de thème"
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition hover:bg-secondary ${className}`}
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
