'use client'

import { Icon } from '@iconify/react'
import { AxiosError } from 'axios'
import QRCode from 'react-qr-code'
import { Suspense, useCallback, useEffect, useMemo, useState, ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import apiClient from '@/lib/api'
import { formatCurrency } from '@/utils/formatters'

type DepositMetadataEvent = {
  status?: string
  actor?: string
  timestamp?: string
  success?: boolean
  txId?: string
}

export default function DepositOrderPage() {
  return (
    <Suspense fallback={<LoadingOverlay label="Loading deposit order" />}>
      <DepositOrderContent />
    </Suspense>
  )
}

type DepositMetadata = {
  depositAddress?: string
  expiresAt?: string
  network?: string
  amount?: number
  events?: DepositMetadataEvent[]
  tronCheck?: {
    success?: boolean
  }
}

type DepositOrder = {
  id: string
  amount: number
  status: string
  txId?: string | null
  network?: string | null
  createdAt: string
  metadata?: DepositMetadata | null
  depositAddress?: string | null
  expiresAt?: string | null
}

const formatCountdown = (totalSeconds: number) => {
  const seconds = Math.max(0, totalSeconds)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-IN', {
    hour12: false,
  })
}

const statusCopyMap: Record<string, string> = {
  PENDING: 'Awaiting your on-chain transfer. Submit the transaction hash once sent.',
  COMPLETED: 'Transfer verified successfully. Funds have been added to your balance.',
  FAILED: 'No matching transfer found for the submitted hash. Please double-check the transaction.',
  CANCELLED: 'You cancelled this deposit order. Start a new order to retry.',
}

const statusStyleMap: Record<string, string> = {
  PENDING: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
  FAILED: 'bg-red-500/10 text-red-300 border-red-400/30',
  CANCELLED: 'bg-zinc-500/10 text-zinc-300 border-zinc-400/30',
}

function DepositOrderContent() {
  useProtectedRoute()

  const router = useRouter()
  const searchParams = useSearchParams()
  const depositId = searchParams.get('depositId')
  const { refreshProfile } = useAuth()

  const [deposit, setDeposit] = useState<DepositOrder | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [txId, setTxId] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const extractErrorMessage = useCallback((err: unknown) => {
    if (err instanceof AxiosError) {
      return (err.response?.data as { message?: string })?.message ?? err.message
    }
    if (err instanceof Error) {
      return err.message
    }
    return 'Unexpected error occurred'
  }, [])

  const fetchDeposit = useCallback(
    async (withSpinner = false) => {
      if (!depositId) return null

      if (withSpinner) {
        setIsInitialLoading(true)
      }

      try {
        const { data } = await apiClient.get<{ deposit: DepositOrder }>(`/user/deposits/${depositId}`)
        setDeposit(data.deposit)
        setError(null)
        return data.deposit
      } catch (err) {
        const message = extractErrorMessage(err)
        setError(message)
        return null
      } finally {
        if (withSpinner) {
          setIsInitialLoading(false)
        }
      }
    },
    [depositId, extractErrorMessage]
  )

  useEffect(() => {
    if (!depositId) {
      setError('Missing deposit reference. Start a new order to continue.')
      setIsInitialLoading(false)
      return
    }

    fetchDeposit(true).catch(() => null)
  }, [depositId, fetchDeposit])

  useEffect(() => {
    if (!deposit?.expiresAt) return

    const target = new Date(deposit.expiresAt).getTime()
    const update = () => {
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000))
      setSecondsLeft(diff)
    }

    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [deposit?.expiresAt])

  useEffect(() => {
    if (!depositId || !deposit || deposit.status !== 'PENDING') {
      return
    }

    const interval = window.setInterval(() => {
      fetchDeposit().catch(() => null)
    }, 15000)

    return () => window.clearInterval(interval)
  }, [depositId, deposit, fetchDeposit])

  useEffect(() => {
    if (!deposit) return
    if (deposit.status === 'COMPLETED') {
      setShowSuccessModal(true)
      const timeout = window.setTimeout(() => {
        setShowSuccessModal(false)
        router.replace('/exchange')
      }, 2500)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [deposit, router])

  const depositAddress = useMemo(() => {
    return deposit?.depositAddress ?? deposit?.metadata?.depositAddress ?? ''
  }, [deposit?.depositAddress, deposit?.metadata?.depositAddress])

  const networkLabel = useMemo(() => {
    return deposit?.network ?? deposit?.metadata?.network ?? 'TRC20'
  }, [deposit?.network, deposit?.metadata?.network])

  const statusBadgeStyles = useMemo(() => {
    if (!deposit) return statusStyleMap.PENDING
    return statusStyleMap[deposit.status] ?? statusStyleMap.PENDING
  }, [deposit])

  const statusDescription = useMemo(() => {
    if (!deposit) return ''
    return statusCopyMap[deposit.status] ?? 'Status update pending.'
  }, [deposit])

  const timelineEvents = useMemo(() => {
    if (!deposit) return [] as DepositMetadataEvent[]
    const base = Array.isArray(deposit.metadata?.events) ? [...deposit.metadata.events] : []

    if (!base.length) {
      return [
        {
          status: 'PENDING',
          timestamp: deposit.createdAt,
        },
      ]
    }

    return base
      .map((event) => ({
        ...event,
        timestamp: event.timestamp ?? deposit.createdAt,
      }))
      .sort((a, b) => {
        const aTime = new Date(a.timestamp ?? '').getTime()
        const bTime = new Date(b.timestamp ?? '').getTime()
        return aTime - bTime
      })
  }, [deposit])

  const formattedAmount = useMemo(() => {
    if (!deposit) return '0.00'
    return formatCurrency(deposit.amount)
  }, [deposit])

  const canVerify = useMemo(() => deposit?.status === 'PENDING', [deposit?.status])
  const canCancel = useMemo(
    () => Boolean(deposit && !['COMPLETED', 'FAILED', 'CANCELLED'].includes(deposit.status)),
    [deposit]
  )

  const handleVerify = useCallback(async () => {
    if (!deposit || !txId.trim()) return

    setIsVerifying(true)
    setActionMessage(null)
    setError(null)

    try {
      const { data } = await apiClient.post<{ deposit: DepositOrder }>(
        `/user/deposits/${deposit.id}/verify`,
        {
          txId: txId.trim(),
        }
      )

      setDeposit(data.deposit)
      setTxId('')
      if (data.deposit.status === 'COMPLETED') {
        setActionMessage('Transfer located and verified successfully.')
      } else {
        setActionMessage('Verification submitted. Waiting for blockchain confirmation…')
      }
      await refreshProfile().catch(() => null)
    } catch (err) {
      const message = extractErrorMessage(err)
      if (message.includes('Verification pending')) {
        setActionMessage('We are still waiting for the network to confirm your transfer. Try again in a minute.')
      } else {
        setError(message)
      }
    } finally {
      setIsVerifying(false)
    }
  }, [deposit, txId, extractErrorMessage, refreshProfile])

  const handleCancel = useCallback(async () => {
    if (!deposit) return

    setIsCancelling(true)
    setError(null)
    setActionMessage(null)

    try {
      const { data } = await apiClient.post<{ deposit: DepositOrder }>(
        `/user/deposits/${deposit.id}/cancel`
      )
      setDeposit(data.deposit)
      setActionMessage('Deposit order cancelled. You can start a new one when ready.')
      await refreshProfile().catch(() => null)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setIsCancelling(false)
    }
  }, [deposit, extractErrorMessage, refreshProfile])

  if (isInitialLoading) {
    return <LoadingOverlay label="Loading deposit order" />
  }

  if (!deposit) {
    return (
      <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
        <div className="w-full max-w-[420px] min-h-screen bg-[#0b1220]">
          <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
            <Icon
              icon="solar:alt-arrow-left-bold"
              className="text-2xl cursor-pointer"
              onClick={() => router.back()}
            />
            <p className="font-semibold">Deposit USDT</p>
            <Icon
              icon="solar:headphones-round-bold"
              className="text-xl text-white/70 cursor-pointer"
              onClick={() => router.push('/support')}
            />
          </header>

          <div className="px-6 py-12 text-center space-y-6">
            <Icon icon="solar:shield-warning-bold" className="mx-auto text-4xl text-yellow-400" />
            <p className="text-sm text-white/70">
              {error ?? 'We could not find this deposit order. Please start a new deposit.'}
            </p>
            <button
              onClick={() => router.push('/exchange/deposit')}
              className="px-4 py-2 rounded-full bg-primary text-black font-semibold"
            >
              Start new deposit
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="relative w-full max-w-[420px] min-h-screen bg-[#0b1220] pb-28">
        <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
          <Icon
            icon="solar:alt-arrow-left-bold"
            className="text-2xl cursor-pointer"
            onClick={() => router.back()}
          />
          <div className="text-center">
            <p className="font-semibold">Deposit USDT</p>
            <p className="text-xs text-white/60">Order #{deposit.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <Icon
            icon="solar:headphones-round-bold"
            className="text-xl text-white/70 cursor-pointer"
            onClick={() => router.push('/support')}
          />
        </header>

        <div className="px-4 pt-5 space-y-6">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeStyles}`}>
              <span className="h-2 w-2 rounded-full bg-current" />
              {deposit.status}
            </span>
            <span className="text-xs text-white/50">Created {formatTimestamp(deposit.createdAt)}</span>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {actionMessage && (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">
              {actionMessage}
            </div>
          )}

          <div className="text-center space-y-4">
            <p className="font-semibold">Scan the QR code and pay</p>
            <div className="bg-white p-3 rounded-xl inline-block">
              <QRCode value={depositAddress || 'TRON'} size={180} />
            </div>

            <div className="flex justify-center items-center gap-2">
              <span className="font-mono text-2xl text-white/70">
                {formatCountdown(secondsLeft)}
              </span>
              <span className="text-sm text-white/50">remaining</span>
            </div>

            <p className="text-xs text-white/60">
              Make sure the on-chain transfer matches the deposit amount exactly.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={txId}
              onChange={(event) => setTxId(event.target.value)}
              placeholder="Enter transaction hash (txid)"
              className="flex-1 bg-[#0e1628] px-4 py-3 rounded-xl outline-none text-sm placeholder:text-white/40"
              disabled={!canVerify || isVerifying}
            />
            <button
              disabled={!canVerify || !txId.trim() || isVerifying}
              onClick={handleVerify}
              className={`px-4 rounded-xl text-sm font-semibold transition-colors ${
                canVerify && txId.trim()
                  ? 'bg-primary text-black hover:bg-primary/90'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              {isVerifying ? 'Verifying…' : 'Verify'}
            </button>
          </div>

          <div className="rounded-xl bg-[#0e1628] p-4 space-y-4 text-sm">
            <InfoRow
              label="Deposit amount"
              value={
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Icon icon="simple-icons:tether" />
                  {formattedAmount} USDT
                </span>
              }
            />

            <InfoBlock label="Deposit address" value={depositAddress || 'Address unavailable'} />

            <div className="bg-yellow-500/10 text-yellow-400 text-xs p-3 rounded-lg">
              Supports <span className="font-semibold">USDT ({networkLabel})</span> only. Double-check the address before sending.
            </div>

            <InfoBlock label="Deposit ID" value={deposit.id} />

            <InfoRow
              label="Network"
              value={
                <span className="flex items-center gap-1">
                  <img src="/tron.svg" className="h-4 w-4" alt="Network" />
                  {networkLabel}
                </span>
              }
            />

            <InfoRow label="Expires at" value={formatTimestamp(deposit.expiresAt)} />
          </div>

          <section className="space-y-2">
            <p className="text-sm font-semibold">Status updates</p>
            <p className="text-xs text-white/60">{statusDescription}</p>
            <div className="space-y-2">
              {timelineEvents.map((event, index) => (
                <div
                  key={`${event.timestamp}-${index}`}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-white">
                      {event.status ?? 'Update'}
                    </span>
                    <span className="text-[10px] text-white/40">{formatTimestamp(event.timestamp)}</span>
                  </div>
                  {event.txId && (
                    <p className="mt-1 break-all">
                      Txid: <span className="text-white/90">{event.txId}</span>
                    </p>
                  )}
                  {event.success !== undefined && (
                    <p className="mt-1">
                      Result: {event.success ? 'Success' : 'Failed'}
                    </p>
                  )}
                  {event.actor && (
                    <p className="mt-1 text-white/50">Actor: {event.actor}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-[#0b1220] px-4 py-3 border-t border-white/10 flex justify-center">
          <button
            onClick={handleCancel}
            disabled={!canCancel || isCancelling}
            className={`w-full max-w-[360px] py-3 rounded-full text-sm font-semibold transition-colors ${
              canCancel && !isCancelling
                ? 'bg-red-600 hover:bg-red-500'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            {isCancelling ? 'Cancelling…' : canCancel ? 'Cancel order' : 'Cancellation unavailable'}
          </button>
        </div>

        {showSuccessModal && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6">
            <div className="w-full max-w-xs rounded-3xl bg-[#0f1a2b] p-6 text-center space-y-4 border border-emerald-400/40 shadow-xl shadow-emerald-500/20">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
                <Icon icon="solar:check-circle-bold" className="text-3xl animate-pulse" />
              </span>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-white">Deposit completed</p>
                <p className="text-sm text-white/70">Funds have been added to your balance. Redirecting…</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

const InfoRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-3">
    <span className="text-white/60">{label}</span>
    <span className="text-right text-white/80">{value}</span>
  </div>
)

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-white/60">{label}</p>
    <div className="flex items-center gap-2">
      <p className="text-sm break-all text-white/80">{value}</p>
      {value && (
        <Icon
          icon="solar:copy-bold"
          className="text-white/50 cursor-pointer"
          onClick={() => navigator.clipboard.writeText(value)}
        />
      )}
    </div>
  </div>
)
