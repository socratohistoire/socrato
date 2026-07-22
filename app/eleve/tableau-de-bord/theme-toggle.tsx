"use client";

import { useEffect } from "react";

export function ThemeToggle() {
  useEffect(() => {
    const stored = window.localStorage.getItem("socrato-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = stored ?? (prefersDark ? "dark" : "light");
  }, []);

  function selectTheme(theme: "light" | "dark") {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("socrato-theme", theme);
  }

  return (
    <div className="theme-switch" role="group" aria-label="Choisir le thème">
      <button type="button" className="theme-option-light" onClick={() => selectTheme("light")}>
        ☀ Clair
      </button>
      <button type="button" className="theme-option-dark" onClick={() => selectTheme("dark")}>
        ☾ Sombre
      </button>
    </div>
  );
}
