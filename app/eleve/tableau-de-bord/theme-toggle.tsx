"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let isCurrent = true;
    const storedTheme = window.localStorage.getItem("socrato-theme");
    const preferredTheme: Theme = storedTheme === "light" ? "light" : "dark";
    queueMicrotask(() => {
      if (!isCurrent) return;
      setTheme(preferredTheme);
      document.documentElement.dataset.theme = preferredTheme;
    });
    return () => { isCurrent = false; };
  }, []);

  function selectTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("socrato-theme", nextTheme);
  }

  return (
    <div className="theme-switch" role="group" aria-label="Choisir le thème">
      <button type="button" className="theme-option-light" aria-label="Thème clair" title="Thème clair" aria-pressed={theme === "light"} onClick={() => selectTheme("light")}>
        ☀
      </button>
      <button type="button" className="theme-option-dark" aria-label="Thème sombre" title="Thème sombre" aria-pressed={theme === "dark"} onClick={() => selectTheme("dark")}>
        ☾
      </button>
    </div>
  );
}
