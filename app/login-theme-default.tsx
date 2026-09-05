"use client";

import { useEffect } from "react";

export function LoginThemeDefault() {
  useEffect(() => {
    window.localStorage.setItem("socrato-theme", "dark");
    document.documentElement.dataset.theme = "dark";
  }, []);

  return null;
}
