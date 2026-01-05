import { Icon } from '@iconify/react'

type MetricCardProps = {
  label: string
  value: string
  delta: string
}

export default function MetricCard({ label, value, delta }: MetricCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition-transform hover:-translate-y-1 hover:border-emerald-400/60 hover:bg-emerald-400/5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-xs text-emerald-400">{delta}</p>
        </div>
        <span className="rounded-xl bg-white/5 p-2 text-emerald-400 transition-colors group-hover:bg-emerald-500/10">
          <Icon icon="solar:chart-bold" className="text-xl" />
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
    </article>
  )
}
