'use client'

import { useEffect } from 'react'
import MetricCard from '@/components/Admin/MetricCard'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

const formatCurrency = (value: number, currency: 'USDT' | 'INR' = 'USDT') => {
  if (!Number.isFinite(value)) return '0'
  const formatted = value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  return currency === 'USDT' ? `${formatted} USDT` : `₹${formatted}`
}

export default function AdminDashboardPage() {
  const {
    metrics,
    fetchMetrics,
    isMetricsLoading,
    settings,
    fetchSettings,
    isSettingsLoading,
  } = useAdminAuth()

  useEffect(() => {
    if (!metrics) {
      fetchMetrics().catch(() => null)
    }
  }, [metrics, fetchMetrics])

  useEffect(() => {
    if (!settings) {
      fetchSettings().catch(() => null)
    }
  }, [settings, fetchSettings])

  const cards = metrics
    ? [
        {
          label: 'Total users',
          value: metrics.totalUsers.toLocaleString('en-IN'),
          delta: 'Last sync just now',
        },
        {
          label: 'Total USDT balance (ledger)',
          value: formatCurrency(metrics.totalUsdt, 'USDT'),
          delta: 'Ledger snapshot',
        },
        {
          label: 'Total INR owed / paid',
          value: formatCurrency(metrics.totalInr, 'INR'),
          delta: 'Closing balance',
        },
        {
          label: 'Pending withdrawals',
          value: `${metrics.pendingWithdrawals} requests`,
          delta: 'Awaiting review',
        },
        {
          label: 'Pending deposits',
          value: `${metrics.pendingDeposits} awaiting`,
          delta: 'Awaiting confirmations',
        },
        {
          label: 'Pending sell orders',
          value: `${metrics.pendingSellOrders.toLocaleString('en-IN')} open`,
          delta: 'OTC desk queue',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Overview</p>
        <h1 className="text-3xl font-semibold">Platform health snapshot</h1>
        <p className="text-sm text-white/60">
          Monitor real-time platform metrics across liquidity, settlements, and customer activity.
        </p>
      </header>

      {(isMetricsLoading || isSettingsLoading) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
          Loading latest metrics…
        </div>
      )}

      {!isMetricsLoading && !isSettingsLoading && metrics && (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(card => (
              <MetricCard key={card.label} {...card} />
            ))}
          </section>

          {settings && (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-white/40">Configuration</p>
                <h2 className="text-xl font-semibold text-white">Current trading controls</h2>
                <p className="text-sm text-white/60">
                  These values sync with the exchange UI for base pricing and referral rewards.
                </p>
              </header>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">Base rate</p>
                  <p className="mt-1 text-2xl font-semibold text-white">₹{settings.baseRate.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">Invite commission</p>
                  <p className="mt-1 text-2xl font-semibold text-white">₹{settings.inviteCommission.toFixed(2)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                  <p className="text-xs uppercase tracking-wide text-white/40">Wallets active</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{settings.depositAddresses.length}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Pricing tiers</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {settings.pricingTiers.map((tier) => (
                    <div key={tier.range} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
                      <p className="font-semibold text-white">{tier.range}</p>
                      <p className="text-xs text-white/60">Display: {tier.markup}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 text-xs text-white/40">
                Last updated {settings.updatedAt ? new Date(settings.updatedAt).toLocaleString('en-IN') : '—'}
              </p>
            </section>
          )}
        </>
      )}

      {!isMetricsLoading && !metrics && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-sm text-red-200">
          Unable to load metrics. Please retry shortly.
        </div>
      )}
    </div>
  )
}
