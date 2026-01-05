'use client'

import { Icon } from '@iconify/react'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import LoadingOverlay from '@/components/shared/LoadingOverlay'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'
import { formatCurrency } from '@/utils/formatters'

const FINAL_STATUSES = ['COMPLETED', 'REJECTED', 'FAILED'] as const

type FinalStatus = (typeof FINAL_STATUSES)[number]

type SellOrderBank = {
  accountHolderName?: string | null
  accountNumber?: string | null
  bankName?: string | null
  ifsc?: string | null
  upiId?: string | null
}

export default function SellOrderPage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading sell order" />}>
      <SellOrderContent />
    </Suspense>
  )
}

type SellOrderHistoryEntry = {
  status: string
  timestamp: string
  actor?: string | null
  note?: string | null
  txId?: string | null
  bank?: SellOrderBank | null
}

type SellOrder = {
  id: string
  amountUsdt: number
  status: string
  destination: string | null
  createdAt: string
  txId: string | null
  rateInr: number | null
  grossInr: number | null
  netInr: number | null
  feeAmount: number | null
  feePercent: number | null
  bank?: SellOrderBank | null
  history?: SellOrderHistoryEntry[]
}

type SellOrderResponse = {
  sellOrder: SellOrder
}

type StatusTheme = {
  title: string
  description: string
  icon: string
  cardBg: string
  cardBorder: string
  iconBg: string
  iconColor: string
  titleColor: string
  descriptionColor: string
}

function SellOrderContent() {
  useProtectedRoute()

  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const { isAuthenticated, isLoading, refreshProfile } = useAuth()

  const [order, setOrder] = useState<SellOrder | null>(null)
  const [isFetching, setIsFetching] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(
    async (options: { background?: boolean } = {}) => {
      if (!orderId) {
        setError('Missing sell order reference')
        setIsFetching(false)
        return
      }

      if (options.background) {
        setIsRefreshing(true)
      } else {
        setIsFetching(true)
      }

      try {
        const { data } = await apiClient.get<SellOrderResponse>(`/user/sell-orders/${orderId}`)
        setOrder(data.sellOrder)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load sell order'
        setError(message)
      } finally {
        if (options.background) {
          setIsRefreshing(false)
        } else {
          setIsFetching(false)
        }
      }
    },
    [orderId]
  )

  useEffect(() => {
    fetchOrder().catch(() => null)
  }, [fetchOrder])

  useEffect(() => {
    if (!orderId) return
    if (!order) return

    if (FINAL_STATUSES.includes(order.status as FinalStatus)) {
      return
    }

    const interval = window.setInterval(() => {
      fetchOrder({ background: true }).catch(() => null)
    }, 12_000)

    return () => window.clearInterval(interval)
  }, [fetchOrder, order, orderId])

  useEffect(() => {
    if (!order) return
    if (FINAL_STATUSES.includes(order.status as FinalStatus)) {
      refreshProfile().catch(() => null)
    }
  }, [order, refreshProfile])

  const statusTheme: StatusTheme = useMemo(() => {
    const status = order?.status ?? 'PENDING'
    const reason = order?.history?.find(h => h.status === status)?.note ?? null

    switch (status) {
      case 'COMPLETED':
        return {
          title: 'Payout released',
          description: 'We’ve transferred INR to your selected beneficiary. Track it from your statements.',
          icon: 'solar:check-circle-bold',
          cardBg: 'bg-emerald-500/15',
          cardBorder: 'border-emerald-500/40',
          iconBg: 'bg-emerald-500/25',
          iconColor: 'text-emerald-300',
          titleColor: 'text-emerald-100',
          descriptionColor: 'text-emerald-100/80',
        }
      case 'REJECTED':
        return {
          title: 'Sell order rejected',
          description: reason
            ? `The desk rejected this request: ${reason}`
            : 'Funds remain in your trading balance. Contact support if you need clarification.',
          icon: 'solar:close-circle-bold',
          cardBg: 'bg-red-500/15',
          cardBorder: 'border-red-500/40',
          iconBg: 'bg-red-500/20',
          iconColor: 'text-red-300',
          titleColor: 'text-red-100',
          descriptionColor: 'text-red-100/80',
        }
      case 'FAILED':
        return {
          title: 'Sell order failed',
          description: 'Something broke while processing the payout. Your balance has been untouched.',
          icon: 'solar:danger-triangle-bold',
          cardBg: 'bg-amber-500/12',
          cardBorder: 'border-amber-500/40',
          iconBg: 'bg-amber-500/20',
          iconColor: 'text-amber-300',
          titleColor: 'text-amber-100',
          descriptionColor: 'text-amber-100/80',
        }
      case 'PROCESSING':
        return {
          title: 'Desk is processing',
          description: 'Your request has been handed to the OTC desk. Expect INR in your account shortly.',
          icon: 'solar:clock-circle-bold',
          cardBg: 'bg-sky-500/10',
          cardBorder: 'border-sky-400/40',
          iconBg: 'bg-sky-500/20',
          iconColor: 'text-sky-300',
          titleColor: 'text-sky-100',
          descriptionColor: 'text-sky-100/80',
        }
      default:
        return {
          title: 'Awaiting desk review',
          description: 'Our team is validating the order details before pushing INR to your bank or UPI account.',
          icon: 'solar:clock-circle-bold',
          cardBg: 'bg-primary/15',
          cardBorder: 'border-primary/40',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          titleColor: 'text-white',
          descriptionColor: 'text-white/80',
        }
    }
  }, [order])

  const formattedStatus = useMemo(() => order?.status?.replace(/_/g, ' ') ?? 'PENDING', [order?.status])
  const showFinalCta = useMemo(
    () => (order ? FINAL_STATUSES.includes(order.status as FinalStatus) : false),
    [order]
  )

  const beneficiarySummary = useMemo(() => {
    const bank = order?.bank ?? null
    if (!bank) return null

    if (bank.upiId) {
      return {
        lines: [
          bank.accountHolderName ? `${bank.accountHolderName}` : null,
          bank.upiId,
        ].filter(Boolean) as string[],
        icon: '/upi.svg',
        type: 'UPI',
      }
    }

    if (bank.accountNumber) {
      return {
        lines: [
          bank.accountHolderName ? `${bank.accountHolderName}` : null,
          bank.accountNumber,
          bank.bankName ? `${bank.bankName}${bank.ifsc ? ` · ${bank.ifsc}` : ''}` : bank.ifsc ?? null,
        ].filter(Boolean) as string[],
        icon: '/bank.png',
        type: 'Bank account',
      }
    }

    return null
  }, [order?.bank])

  const history = order?.history ?? []

  if (isLoading || !isAuthenticated || isFetching) {
    return <LoadingOverlay label="Loading sell order" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen bg-[#0b1220] pb-28">
        <header className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <Icon
            icon="solar:alt-arrow-left-bold"
            className="text-2xl cursor-pointer"
            onClick={() => router.push('/exchange/sell')}
          />
          <div className="flex-1 text-center">
            <p className="font-semibold text-lg">Sell order</p>
            {order && <p className="text-xs text-white/50">Order #{order.id.slice(0, 6).toUpperCase()}</p>}
          </div>
          <button
            onClick={() => fetchOrder({ background: true }).catch(() => null)}
            className="flex items-center gap-1 text-xs text-primary font-semibold disabled:opacity-50"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Icon icon="solar:loading-3-linear" className="animate-spin text-sm" /> Refreshing
              </>
            ) : (
              <>
                <Icon icon="solar:refresh-circle-bold" className="text-base" /> Refresh
              </>
            )}
          </button>
        </header>

        <div className="px-4 py-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {order && (
            <>
              <section className={`rounded-xl border px-5 py-6 space-y-4 text-sm transition ${statusTheme.cardBorder} ${statusTheme.cardBg}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-11 w-11 rounded-full flex items-center justify-center ${statusTheme.iconBg}`}>
                    <Icon icon={statusTheme.icon} className={`${statusTheme.iconColor} text-2xl`} />
                  </span>
                  <div>
                    <p className={`font-semibold ${statusTheme.titleColor}`}>{statusTheme.title}</p>
                    <p className={`text-xs leading-relaxed ${statusTheme.descriptionColor}`}>{statusTheme.description}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-black/20 p-4 space-y-3">
                  <InfoRow label="Order ID" value={order.id} copyValue={order.id} />
                  <InfoRow label="USDT sold" value={`${formatCurrency(order.amountUsdt)} USDT`} />
                  {order.rateInr !== null && <InfoRow label="Locked rate" value={`₹${formatCurrency(order.rateInr)} / USDT`} />}
                  {order.grossInr !== null && <InfoRow label="Gross amount" value={`₹${formatCurrency(order.grossInr)}`} />}
                  {order.feeAmount !== null && (
                    <InfoRow
                      label="Fees"
                      value={`₹${formatCurrency(order.feeAmount)}${order.feePercent ? ` (${order.feePercent.toFixed(2)}%)` : ''}`}
                    />
                  )}
                  {order.netInr !== null && <InfoRow label="Payout amount" value={`₹${formatCurrency(order.netInr)}`} emphasize />}
                  <InfoRow label="Status" value={formattedStatus} />
                  <InfoRow label="Created" value={formatDateTime(order.createdAt)} />
                  {order.txId && <InfoRow label="Reference" value={order.txId} copyValue={order.txId} />}
                </div>
              </section>

              {beneficiarySummary && (
                <section className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 rounded-full bg-black/30 flex items-center justify-center">
                      <Icon icon={beneficiarySummary.type === 'UPI' ? 'solar:card-transfer-bold' : 'solar:bank-bold'} className="text-lg text-white/80" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/50">Payout destination</p>
                      <p className="text-sm font-semibold text-white">{beneficiarySummary.type}</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-black/20 p-4 space-y-2 text-sm text-white/80">
                    {beneficiarySummary.lines.map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </section>
              )}

              {history.length > 0 && (
                <section className="rounded-xl border border-white/10 bg-[#0f1729] p-5">
                  <p className="text-sm font-semibold text-white">Timeline</p>
                  <div className="mt-4 space-y-5">
                    {history.map((item, index) => (
                      <div key={`${item.status}-${item.timestamp}-${index}`} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <span className="h-3 w-3 rounded-full bg-primary" />
                          {index !== history.length - 1 && <span className="flex-1 w-px bg-white/10 mt-1" />}
                        </div>
                        <div className="flex-1 space-y-1 text-xs text-white/70">
                          <p className="text-white/90 font-medium">{item.status.replace(/_/g, ' ')}</p>
                          <p>{formatDateTime(item.timestamp)}</p>
                          {item.note && <p className="text-white/60">Note: {item.note}</p>}
                          {item.actor && <p className="text-white/50">By {item.actor}</p>}
                          {item.txId && <p className="text-white/60">TX: {item.txId}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <button
                onClick={() => router.push(showFinalCta ? '/me/statements' : '/exchange/sell')}
                className={`w-full rounded-full font-semibold py-3 transition ${
                  showFinalCta ? 'bg-white text-black hover:bg-white/90' : 'bg-primary text-black hover:brightness-110'
                }`}
              >
                {showFinalCta ? 'View statements' : 'Back to exchange'}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

type InfoRowProps = {
  label: string
  value: string
  emphasize?: boolean
  copyValue?: string
}

const InfoRow = ({ label, value, emphasize = false, copyValue }: InfoRowProps) => (
  <div className="flex items-start justify-between gap-3 text-white/80 text-xs">
    <span className="text-white/50 uppercase tracking-wide">{label}</span>
    <span className={`flex items-center gap-2 text-right break-all ${emphasize ? 'text-emerald-300 text-sm font-semibold' : ''}`}>
      {value}
      {copyValue && (
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(copyValue)}
          className="text-white/40 transition hover:text-white/70"
          aria-label={`Copy ${label}`}
        >
          <Icon icon="solar:copy-bold" className="text-sm" />
        </button>
      )}
    </span>
  </div>
)

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const maskAccount = (value?: string | null) => {
  if (!value) return '—'
  return value
}
