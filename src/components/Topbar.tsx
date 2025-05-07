'use client'

import { useDarkMode } from '@/hooks/useDarkMode'
import { Moon, Sun } from 'lucide-react'

export default function Topbar({ title }: { title: string }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <div className="bg-green-600 text-white p-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={toggle}
        className="bg-white text-green-600 hover:bg-green-100 rounded-full p-2 transition"
        aria-label="Toggle dark mode"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  )
}
