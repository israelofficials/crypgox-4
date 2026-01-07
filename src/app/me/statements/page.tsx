'use client'

import { useMemo } from 'react'
import { Icon } from '@iconify/react'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import LoadingOverlay from '@/components/shared/LoadingOverlay' 
import { formatCurrency } from '@/utils/formatters'

const statusBadgeStyles: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
  CANCELLED: 'bg-zinc-500/10 text-zinc-300 border-zinc-400/30',
  FAILED: 'bg-red-500/10 text-red-300 border-red-400/30',
  SUCCESS: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
}

const statusLabelMap: Record<string, string> = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
  SUCCESS: 'Succeeded',
}

export default function StatementPage() {
  useProtectedRoute()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  const statements = useMemo(() => user?.statements ?? [], [user?.statements])
  const deposits = useMemo(() => user?.deposits ?? [], [user?.deposits])
  const withdrawals = useMemo(() => user?.withdrawals ?? [], [user?.withdrawals])

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Loading statements" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">

        {/* HEADER */}
        <header className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <Icon icon="solar:alt-arrow-left-bold" className="text-2xl" />
          </button>
          <p className="font-semibold text-lg">Statement</p>
        </header>

        <div className="px-4 space-y-5 pb-6">

          {statements.length ? (
            statements.map(statement => {
              const metadata = (statement.metadata ?? {}) as Record<string, unknown>
              const method = typeof metadata.method === 'string' ? metadata.method : null
              const isAdminAdjustment = statement.type === 'ADMIN_BALANCE_ADJUSTMENT'
              const reason = isAdminAdjustment && typeof metadata.reason === 'string' ? metadata.reason : null
              const adjustedBy = isAdminAdjustment && typeof metadata.adjustedBy === 'string' ? metadata.adjustedBy : null

              return (
                <div
                  key={statement.id}
                  className="rounded-xl bg-[#0e1628] p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold flex items-center gap-1">
                        {statement.type.replaceAll('_', ' ')}
                        {method && (
                          <span className="text-xs text-white/50">({method})</span>
                        )}
                        {isAdminAdjustment && adjustedBy && (
                          <span className="text-xs text-white/50">by {adjustedBy}</span>
                        )}
                      </p>
                      <p className="text-xs text-white/50">
                        {new Date(statement.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <p
                      className={`font-semibold text-right ${
                        statement.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {statement.amount >= 0 ? '+' : ''}
                      {formatCurrency(statement.amount)} {user?.currency ?? 'USDT'}
                    </p>
                  </div>
                  
                  {isAdminAdjustment && reason && (
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-xs text-white/60">
                        <span className="text-white/80 font-medium">Reason: </span>
                        {reason}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="rounded-xl bg-[#0e1628] p-4 text-sm text-white/60">
              No statements yet. Your trading history will appear here.
            </div>
          )}

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <p className="font-semibold text-sm">Deposits</p>
              <span className="text-[11px] text-white/40 uppercase tracking-wide">
                Active &amp; completed orders
              </span>
            </header>

            {deposits.length ? (
              <div className="space-y-2">
                {deposits.map(deposit => {
                  const badgeClass = statusBadgeStyles[deposit.status] ?? statusBadgeStyles.PENDING
                  const statusLabel = statusLabelMap[deposit.status] ?? deposit.status

                  return (
                    <div
                      key={deposit.id}
                      className="rounded-xl bg-[#0e1628] border border-white/10 p-4 text-sm flex justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-white">+{formatCurrency(deposit.amount)} USDT</p>
                        <p className="text-xs text-white/50">
                          {new Date(deposit.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {statusLabel}
                        </span>
                        {deposit.txId && (
                          <p className="text-[11px] text-white/40 truncate max-w-[140px]">Txid: {deposit.txId}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[#0e1628] p-4 text-xs text-white/50">
                No deposit activity yet. Create a deposit to see it here.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <p className="font-semibold text-sm">Withdrawals</p>
              <span className="text-[11px] text-white/40 uppercase tracking-wide">
                Pending, failed &amp; completed
              </span>
            </header>

            {withdrawals.length ? (
              <div className="space-y-2">
                {withdrawals.map(withdrawal => {
                  const rawStatus = withdrawal.status?.toUpperCase() ?? 'PENDING'
                  const badgeClass = statusBadgeStyles[rawStatus] ?? statusBadgeStyles.PENDING
                  const statusLabel = statusLabelMap[rawStatus] ?? withdrawal.status

                  return (
                    <div
                      key={withdrawal.id}
                      className="rounded-xl bg-[#0e1628] border border-white/10 p-4 text-sm flex justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-white">-{formatCurrency(withdrawal.amount)} USDT</p>
                        <p className="text-xs text-white/50">
                          {new Date(withdrawal.createdAt).toLocaleString('en-IN')}
                        </p>
                        {withdrawal.destination && (
                          <p className="text-[11px] text-white/50 mt-1 truncate max-w-[180px]">
                            To: {withdrawal.destination}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-[#0e1628] p-4 text-xs text-white/50">
                No withdrawal history yet. Your payouts will appear here.
              </div>
            )}
          </section>

        </div>

        <PageBottomBar active="Me" />
      </div>
    </main>
  )
}
