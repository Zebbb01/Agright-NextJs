"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

import { ChartConfig, ChartContainer } from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#22c55e",
  },
  mobile: {
    label: "Mobile",
    color: "#4ade80",
  },
} satisfies ChartConfig

export default function ChartPanel() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="month" stroke="var(--foreground)" />
          <YAxis stroke="var(--foreground)" />
          <Tooltip />
          <Bar dataKey="desktop" fill={chartConfig.desktop.color} radius={4} />
          <Bar dataKey="mobile" fill={chartConfig.mobile.color} radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
