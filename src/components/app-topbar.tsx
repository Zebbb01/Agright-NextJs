'use client'

import { useDarkMode } from '@/hooks/useDarkMode'
import { Moon, Sun } from 'lucide-react'

export default function Topbar({ title }: { title: string }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <div className="bg-sidebar text-sidebar-foreground p-4 flex w-full items-center justify-between sticky top-0 z-10">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={toggle}
        className="bg-sidebar text-sidebar-foreground hover:bg-[var(--sidebar-hover)] rounded-full p-2 transition"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  )
}
