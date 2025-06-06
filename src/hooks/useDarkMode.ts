import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On initial load, check localStorage for the theme preference
    const storedTheme = localStorage.getItem("theme");

    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      // If no theme is stored, default to system preference or light mode
      const prefersDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDarkMode) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
      // Store the default preference
      localStorage.setItem("theme", prefersDarkMode ? "dark" : "light");
    }
  }, []); // Empty dependency array means this effect runs once on mount

  const toggle = () => {
    const newIsDark = !isDark; // Toggle based on current state
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return { isDark, toggle };
}