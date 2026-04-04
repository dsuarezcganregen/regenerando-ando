'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line } from 'recharts'

const TEAL = '#0F6E56'
const TEAL_LIGHT = '#1D9E75'
const HERO_BG = '#E1F5EE'
const COLORS = ['#0F6E56','#1D9E75','#2AB88A','#48D1A0','#7BE0BD','#A8ECD6','#D0F5E8']

export function CountryBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40, 200)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 13 }} />
        <Tooltip />
        <Bar dataKey="value" fill={TEAL} radius={[0, 6, 6, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function EcosystemDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} innerRadius={50} outerRadius={90} dataKey="value" nameKey="name" cx="50%" cy="50%">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SystemBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 45, 150)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 13 }} />
        <Tooltip />
        <Bar dataKey="value" fill={TEAL_LIGHT} radius={[0, 6, 6, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function GrowthLine({ data }: { data: { month: string; total: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke={TEAL} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function SizeBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 45, 150)}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" fill={TEAL} radius={[0, 6, 6, 0]} barSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ExpandableSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button onClick={() => setOpen(!open)}
        className="w-full text-center py-3 text-primary font-medium hover:underline">
        {open ? '▲ Ocultar datos adicionales' : '▼ Ver más datos'}
      </button>
      {open && <div className="mt-4 space-y-8">{children}</div>}
    </div>
  )
}
