'use client'

import { Icon } from '@iconify/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'

import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import apiClient from '@/lib/api'

interface WithdrawalOrder {
  id: string
  amount: number
  status: string
  destination: string | null
  createdAt: string
  txId?: string | null
  metadata?: {
    network?: string
    label?: string
    reason?: string
    status?: string
  } | null
}

const FINAL_STATUSES = ['COMPLETED', 'REJECTED', 'FAILED']

function WithdrawPendingContent() {
  useProtectedRoute()

  const router = useRouter()
  const searchParams = useSearchParams()
  const withdrawalId = searchParams.get('withdrawalId')
  const { isAuthenticated, isLoading, refreshProfile } = useAuth()

  const [order, setOrder] = useState<WithdrawalOrder | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!withdrawalId) {
      setError('Missing withdrawal reference')
      setIsFetching(false)
      return
    }

    const fetchOrder = async () => {
      try {
        const { data } = await apiClient.get<{ withdrawal: WithdrawalOrder }>(`/user/withdrawals/${withdrawalId}`)
        setOrder(data.withdrawal)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load withdrawal order'
        setError(message)
      } finally {
        setIsFetching(false)
      }
    }

    fetchOrder().catch(() => null)
  }, [withdrawalId])

  useEffect(() => {
    if (!withdrawalId) return

    if (order && FINAL_STATUSES.includes(order.status)) {
      return
    }

    const interval = window.setInterval(() => {
      apiClient
        .get<{ withdrawal: WithdrawalOrder }>(`/user/withdrawals/${withdrawalId}`)
        .then(({ data }) => setOrder(data.withdrawal))
        .catch(() => null)
    }, 12_000)

    return () => window.clearInterval(interval)
  }, [withdrawalId, order])

  useEffect(() => {
    if (!order) return
    if (FINAL_STATUSES.includes(order.status)) {
      refreshProfile().catch(() => null)
    }
  }, [order, refreshProfile])

  const network = order?.metadata?.network ?? 'TRC20'
  const amount = order?.amount ?? 0
  const destination = order?.destination ?? '—'
  const reason = typeof order?.metadata === 'object' ? order?.metadata?.reason ?? null : null
  const status = order?.status ?? 'PENDING'

  const statusTheme = useMemo(() => {
    switch (status) {
      case 'COMPLETED':
        return {
          title: 'Withdrawal sent',
          description: 'We’ve released your USDT to the destination wallet. Check your statements for the ledger entry.',
          icon: 'solar:check-circle-bold',
          cardBg: 'bg-emerald-500/15',
          cardBorder: 'border-emerald-400/60',
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-300',
          titleColor: 'text-emerald-200',
          descriptionColor: 'text-emerald-100/80',
        }
      case 'REJECTED':
        return {
          title: 'Withdrawal rejected',
          description:
            reason
              ? `Your request was rejected: ${reason}`
              : 'The withdrawal was not approved. The blocked funds have been returned to your balance.',
          icon: 'solar:close-circle-bold',
          cardBg: 'bg-red-500/10',
          cardBorder: 'border-red-500/40',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-300',
          titleColor: 'text-red-200',
          descriptionColor: 'text-red-100/80',
        }
      case 'FAILED':
        return {
          title: 'Withdrawal failed',
          description: 'The transaction could not be processed. Please contact support or try again.',
          icon: 'solar:danger-triangle-bold',
          cardBg: 'bg-amber-500/10',
          cardBorder: 'border-amber-500/40',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-300',
          titleColor: 'text-amber-200',
          descriptionColor: 'text-amber-100/80',
        }
      default:
        return {
          title: 'Awaiting admin approval',
          description:
            'Sit tight! Our team reviews withdrawals to keep your funds safe. You’ll get notified once it’s approved.',
          icon: 'solar:clock-circle-bold',
          cardBg: 'bg-emerald-500/10',
          cardBorder: 'border-emerald-400/40',
          iconBg: 'bg-emerald-500/20',
          iconColor: 'text-emerald-300',
          titleColor: 'text-emerald-200',
          descriptionColor: 'text-emerald-100/70',
        }
    }
  }, [status, reason])

  const showFinalCta = FINAL_STATUSES.includes(status)
  const formattedStatus = status.replace(/_/g, ' ')

  if (isLoading || !isAuthenticated || isFetching) {
    return <LoadingOverlay label="Checking withdrawal status" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen bg-[#0b1220] pb-24">
        <header className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <Icon icon="solar:alt-arrow-left-bold" className="text-2xl cursor-pointer" onClick={() => router.push('/exchange')} />
          <div className="flex-1 text-center">
            <p className="font-semibold text-lg">Withdrawal submitted</p>
            {order && <p className="text-xs text-white/50">Order #{order.id.slice(0, 6).toUpperCase()}</p>}
          </div>
          <button
            onClick={() => router.push('/me/statements')}
            className="text-xs text-primary font-semibold"
          >
            Statements
          </button>
        </header>

        <div className="px-4 py-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          <section
            className={`rounded-xl border px-5 py-6 space-y-4 text-sm transition ${statusTheme.cardBorder} ${statusTheme.cardBg}`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-10 w-10 rounded-full flex items-center justify-center ${statusTheme.iconBg}`}>
                <Icon icon={statusTheme.icon} className={`${statusTheme.iconColor} text-2xl`} />
              </span>
              <div>
                <p className={`font-semibold ${statusTheme.titleColor}`}>{statusTheme.title}</p>
                <p className={`text-xs ${statusTheme.descriptionColor}`}>{statusTheme.description}</p>
              </div>
            </div>

            <div className="rounded-lg bg-black/20 p-4 space-y-3">
              <InfoRow label="Amount" value={`${amount.toFixed(2)} USDT`} />
              <InfoRow label="Network" value={network} />
              <InfoRow label="Destination" value={destination} copyable />
              {order?.metadata?.label && <InfoRow label="Label" value={order.metadata.label} />}
              <InfoRow label="Status" value={formattedStatus} />
              {order?.txId && <InfoRow label="Transaction hash" value={order.txId} copyable />}
              {reason && status === 'REJECTED' && <InfoRow label="Review note" value={reason} />}
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3 text-xs text-white/70">
            <p className="font-semibold text-white">What happens next?</p>
            <ul className="space-y-2">
              <li className="flex gap-2">
                <span>•</span> Our admins verify the request matches your account activity.
              </li>
              {status === 'PENDING' ? (
                <li className="flex gap-2">
                  <span>•</span> Once approved, USDT will be sent to your wallet instantly.
                </li>
              ) : (
                <li className="flex gap-2">
                  <span>•</span> Track this decision from your statements for a detailed audit trail.
                </li>
              )}
              <li className="flex gap-2">
                <span>•</span> Any issues? <button onClick={() => router.push('/support')} className="underline text-primary">Contact support</button>.
              </li>
            </ul>
          </section>

          <button
            onClick={() => router.push(showFinalCta ? '/me/statements' : '/exchange')}
            className={`w-full rounded-full font-semibold py-3 transition ${
              showFinalCta ? 'bg-white/90 text-black hover:bg-white' : 'bg-primary text-black hover:brightness-105'
            }`}
          >
            {showFinalCta ? 'View statements' : 'Back to exchange'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default function WithdrawPendingPage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Checking withdrawal status" />}>
      <WithdrawPendingContent />
    </Suspense>
  )
}

const InfoRow = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) => (
  <div className="flex items-start justify-between gap-3 text-white/80">
    <span className="text-white/50">{label}</span>
    <span className="flex items-center gap-2 text-right break-all">
      {value}
      {copyable && value && (
        <Icon
          icon="solar:copy-bold"
          className="text-white/40 cursor-pointer"
          onClick={() => navigator.clipboard.writeText(value)}
        />
      )}
    </span>
  </div>
)
