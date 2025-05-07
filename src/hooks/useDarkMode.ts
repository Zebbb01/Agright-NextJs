import { useEffect, useState } from "react"

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const classList = document.documentElement.classList
    const darkPreference = localStorage.getItem("theme") === "dark"

    setIsDark(classList.contains("dark") || darkPreference)
  }, [])

  const toggle = () => {
    const classList = document.documentElement.classList
    const isDark = classList.toggle("dark")
    localStorage.setItem("theme", isDark ? "dark" : "light")
    setIsDark(isDark)
  }

  return { isDark, toggle }
}
