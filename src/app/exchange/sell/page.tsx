'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { formatCurrency } from '@/utils/formatters'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

type Payee = {
  id: string
  name: string
  bankName?: string | null
  accountNumber?: string | null
  ifsc?: string | null
  upiId?: string | null
  createdAt?: string
  updatedAt?: string
}

type PayeeListResponse = {
  payees: Payee[]
}

type PayeeCreateResponse = {
  payee: Payee
}

type PayeeFormState = {
  accountNumber: string
  accountName: string
  bankName: string
  ifsc: string
  upiId: string
  displayName: string
}

type SellOrderBank = {
  accountHolderName?: string | null
  accountNumber?: string | null
  bankName?: string | null
  ifsc?: string | null
  upiId?: string | null
}

type SellOrderHistoryEntry = {
  status: string
  timestamp: string
  actor?: string
  note?: string
  txId?: string
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

type SellOrderListResponse = {
  sellOrders: SellOrder[]
}

type SellOrderCreateResponse = {
  sellOrder: SellOrder
}

const FALLBACK_RATE = 99
const HISTORY_LIMIT = 50

function SellPageContent() {
  useProtectedRoute()

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const viewParam = searchParams.get('view')

  const { user, settings, isLoading, isAuthenticated, refreshProfile } = useAuth()

  const [screen, setScreen] = useState<'sell' | 'selectPayee' | 'addPayee' | 'history'>('sell')
  const [payees, setPayees] = useState<Payee[]>([])
  const [selectedPayeeId, setSelectedPayeeId] = useState<string | null>(null)
  const [isPayeesLoading, setIsPayeesLoading] = useState<boolean>(true)
  const [isSavingPayee, setIsSavingPayee] = useState<boolean>(false)
  const [deletingPayeeId, setDeletingPayeeId] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [history, setHistory] = useState<SellOrder[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null)
  const INITIAL_FORM: PayeeFormState = useMemo(
    () => ({
      accountNumber: '',
      accountName: '',
      bankName: '',
      ifsc: '',
      upiId: '',
      displayName: '',
    }),
    []
  )
  const [form, setForm] = useState<PayeeFormState>(INITIAL_FORM)

  const baseRate = useMemo(() => Number(settings?.baseRate ?? FALLBACK_RATE), [settings?.baseRate])
  const availableBalance = useMemo(() => Number(user?.balance ?? 0), [user?.balance])
  const parsedAmount = useMemo(() => {
    const numeric = Number(amount)
    return Number.isFinite(numeric) ? numeric : 0
  }, [amount])
  const grossInrEstimate = useMemo(() => parsedAmount * baseRate, [parsedAmount, baseRate])
  const estimatedFeeInr = useMemo(() => {
    if (parsedAmount <= 0 || grossInrEstimate <= 0) return 0
    const percentageFee = grossInrEstimate * 0.01
    const minimumFee = parsedAmount < 1000 ? 100 : 0
    const appliedFee = Math.max(percentageFee, minimumFee)
    return Math.min(grossInrEstimate, appliedFee)
  }, [grossInrEstimate, parsedAmount])
  const estimatedNetInr = useMemo(() => {
    const net = grossInrEstimate - estimatedFeeInr
    return net > 0 ? net : 0
  }, [estimatedFeeInr, grossInrEstimate])

  const selectedPayee = useMemo(
    () => (selectedPayeeId ? payees.find(payee => payee.id === selectedPayeeId) ?? null : null),
    [payees, selectedPayeeId]
  )

  const insufficientBalance = parsedAmount > availableBalance
  const canConfirm = parsedAmount > 0 && !insufficientBalance && !!selectedPayee
  const isConfirmDisabled = !canConfirm || isSubmitting

  const clearViewParam = useCallback(() => {
    if (!viewParam) return
    const params = new URLSearchParams(searchParams.toString())
    params.delete('view')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }, [viewParam, searchParams, router, pathname])

  const navigateToScreen = useCallback(
    (next: typeof screen) => {
      setScreen(next)
      setError(null)
      if (viewParam) {
        clearViewParam()
      }
    },
    [clearViewParam, viewParam]
  )

  const fetchPayees = useCallback(async () => {
    setIsPayeesLoading(true)
    try {
      const { data } = await apiClient.get<PayeeListResponse>('/user/payees')
      setPayees(data.payees ?? [])
    } catch (err) {
      console.error('Failed to load beneficiaries', err)
    } finally {
      setIsPayeesLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true)
    try {
      const { data } = await apiClient.get<SellOrderListResponse>('/user/sell-orders', {
        params: { limit: HISTORY_LIMIT },
      })
      setHistory(data.sellOrders ?? [])
    } catch (err) {
      console.error('Failed to load sell history', err)
    } finally {
      setIsHistoryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory().catch(() => null)
  }, [fetchHistory])

  useEffect(() => {
    fetchPayees().catch(() => null)
  }, [fetchPayees])

  useEffect(() => {
    if (!selectedPayeeId && payees.length) {
      setSelectedPayeeId(payees[0].id)
      return
    }

    if (selectedPayeeId && !payees.some(payee => payee.id === selectedPayeeId)) {
      setSelectedPayeeId(payees[0]?.id ?? null)
    }
  }, [payees, selectedPayeeId])

  useEffect(() => {
    if (!viewParam) return

    if (viewParam === 'history') {
      setScreen('history')
    } else if (viewParam === 'bank') {
      setScreen('selectPayee')
    } else if (viewParam === 'add-payee') {
      setScreen('addPayee')
    }
  }, [viewParam])

  const handleAddPayee = useCallback(async () => {
    const accountNumber = form.accountNumber.trim()
    const accountName = form.accountName.trim()
    const ifsc = form.ifsc.trim()
    const upiId = form.upiId.trim()
    const bankName = form.bankName.trim()
    const displayName = form.displayName.trim()

    const hasBankDetails = Boolean(accountNumber && ifsc && accountName)
    const hasUpi = Boolean(upiId)

    if (!hasBankDetails && !hasUpi) {
      setError('Add bank account details or a UPI ID to save the beneficiary')
      return
    }

    setIsSavingPayee(true)
    setError(null)

    const payload = {
      name: hasBankDetails ? accountName : displayName || undefined,
      bankName: bankName || undefined,
      accountNumber: hasBankDetails ? accountNumber : undefined,
      ifsc: hasBankDetails ? ifsc.toUpperCase() : undefined,
      upiId: hasUpi ? upiId : undefined,
    }

    try {
      const { data } = await apiClient.post<PayeeCreateResponse>('/user/payees', payload)
      const newPayee = data.payee
      if (newPayee) {
        setPayees(prev => {
          const existing = prev.filter(item => item.id !== newPayee.id)
          return [newPayee, ...existing]
        })
        setSelectedPayeeId(newPayee.id)
      }
      setForm({ ...INITIAL_FORM })
      navigateToScreen('selectPayee')
      await Promise.allSettled([refreshProfile(), fetchPayees()])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save beneficiary'
      setError(message)
    } finally {
      setIsSavingPayee(false)
    }
  }, [INITIAL_FORM, fetchPayees, form, navigateToScreen, refreshProfile])

  const handleDeletePayee = useCallback(
    async (payeeId: string) => {
      setDeletingPayeeId(payeeId)
      setError(null)
      try {
        await apiClient.delete(`/user/payees/${payeeId}`)
        setPayees(prev => {
          const updated = prev.filter(item => item.id !== payeeId)
          if (selectedPayeeId === payeeId) {
            setSelectedPayeeId(updated[0]?.id ?? null)
          }
          return updated
        })
        await Promise.allSettled([refreshProfile(), fetchPayees()])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to remove beneficiary'
        setError(message)
      } finally {
        setDeletingPayeeId(null)
      }
    },
    [fetchPayees, refreshProfile, selectedPayeeId]
  )

  const handleConfirm = useCallback(async () => {
    if (!selectedPayee) {
      setError('Select or add a beneficiary before confirming')
      return
    }

    if (isConfirmDisabled) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload = {
      amount: parsedAmount,
      rate: baseRate,
      bankDetails: {
        accountHolderName: selectedPayee.name || selectedPayee.upiId || undefined,
        accountNumber: selectedPayee.accountNumber ?? undefined,
        bankName: selectedPayee.bankName ?? undefined,
        ifsc: selectedPayee.ifsc ? selectedPayee.ifsc.toUpperCase() : undefined,
        upiId: selectedPayee.upiId ?? undefined,
      },
    }

    try {
      const { data } = await apiClient.post<SellOrderCreateResponse>('/user/sell-orders', payload)
      setAmount('')
      await Promise.allSettled([refreshProfile(), fetchHistory()])
      router.push(`/exchange/sell/order?orderId=${data.sellOrder.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create sell order'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [baseRate, fetchHistory, isConfirmDisabled, parsedAmount, refreshProfile, router, selectedPayee])

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Preparing exchange" />
  }

  if (screen === 'sell') {
    return (
      <App>
        <Header
          title="Sell USDT"
          onBack={() => router.back()}
          rightIcon="solar:clock-circle-bold"
          onRight={() => navigateToScreen('history')}
        />

        <div className="px-4 space-y-4">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Beneficiary details</p>
              <button
                onClick={() => navigateToScreen('selectPayee')}
                className="text-xs text-primary uppercase tracking-wide flex items-center gap-1"
              >
                <Icon icon="solar:user-plus-bold" className="text-sm" />
                Manage
              </button>
            </div>

            {isPayeesLoading && !payees.length ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Loading beneficiaries…
              </div>
            ) : payees.length ? (
              <div className="space-y-2">
                {payees.map(payee => {
                  const isActive = payee.id === selectedPayeeId
                  return (
                    <button
                      key={payee.id}
                      onClick={() => {
                        setSelectedPayeeId(payee.id)
                        setError(null)
                      }}
                      className={`w-full rounded-xl p-4 flex items-center justify-between border transition-colors ${
                        isActive
                          ? 'border-primary bg-primary/10'
                          : 'border-white/10 bg-[#0e1628] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <Image
                          src={payee.upiId ? '/upi.svg' : '/bank.png'}
                          alt="payment method"
                          width={28}
                          height={28}
                        />
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{payee.name || 'Beneficiary'}</p>
                          <p className="text-xs text-white/60">
                            {payee.upiId || maskAccount(payee.accountNumber ?? undefined) || 'Details pending'}
                          </p>
                        </div>
                      </div>
                      {isActive && <Icon icon="solar:check-circle-bold" className="text-xl text-primary" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-white/50">
                No saved beneficiaries yet. Add bank or UPI details to continue.
              </div>
            )}
          </section>

          <section className="rounded-xl bg-[#0e1628] p-4 space-y-2">
            <p className="text-xs uppercase tracking-wide text-white/40">Selected beneficiary</p>
            {selectedPayee ? (
              <div className="space-y-1 text-sm">
                <Row label="Name" value={selectedPayee.name || selectedPayee.upiId || '—'} />
                {selectedPayee.upiId && <Row label="UPI ID" value={selectedPayee.upiId} />}
                {selectedPayee.accountNumber && (
                  <Row label="Account" value={maskAccount(selectedPayee.accountNumber)} />
                )}
                {selectedPayee.bankName && <Row label="Bank" value={selectedPayee.bankName} />}
                {selectedPayee.ifsc && <Row label="IFSC" value={selectedPayee.ifsc} />}
              </div>
            ) : (
              <p className="text-xs text-white/50">Select a beneficiary to review their details here.</p>
            )}
          </section>

          <section>
            <p className="text-sm mb-1">Sell amount</p>
            <div className="flex items-center gap-2 border-b border-white/20 py-2">
              <input
                value={amount}
                onChange={event => {
                  setAmount(event.target.value.replace(/[^0-9.]/g, ''))
                  setError(null)
                }}
                placeholder="Enter amount"
                className="w-full bg-[#0e1628] p-3 rounded-lg outline-none"
              />
              <Image src="/money.png" alt="usdt" width={20} height={20} />
              <span className="font-semibold">USDT</span>
            </div>

            <div className="flex justify-between text-xs mt-2">
              <span className="flex items-center gap-1 text-white/60">
                Available
                <Image src="/money.png" alt="usdt" width={14} height={14} />
                {formatCurrency(availableBalance)}
              </span>
              <span className="text-emerald-400 font-semibold">
                ≈ ₹{formatCurrency(grossInrEstimate)}
              </span>
            </div>
            {insufficientBalance && parsedAmount > 0 && (
              <p className="mt-2 text-xs text-red-400">
                Insufficient balance. Enter an amount up to {formatCurrency(availableBalance)} USDT.
              </p>
            )}
          </section>

          <section className="rounded-xl bg-[#0e1628] p-3 text-sm space-y-1">
            <p className="text-xs uppercase tracking-wide text-white/40">Rate reference</p>
            <Row label="Base rate" value={`1 USDT = ₹${baseRate.toFixed(2)}`} />
            <Row label="Estimated payout" value={`₹${formatCurrency(estimatedNetInr)}`} />
            <Row label="Estimated fee" value={`₹${formatCurrency(estimatedFeeInr)}`} />
            
          </section>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`w-full py-4 rounded-full font-semibold transition ${
              isConfirmDisabled
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-emerald-400 text-black hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? 'Processing…' : 'Confirm sell order'}
          </button>

          <p className="text-xs text-white/40">
            Double-check beneficiary details. Incorrect payouts caused by wrong information may not be recoverable.
          </p>
        </div>

        <PageBottomBar active="Exchange" />

        {isSubmitting && <ProcessingOverlay />}
      </App>
    )
  }

  if (screen === 'selectPayee') {
    return (
      <App>
        <Header title="Select beneficiary" onBack={() => navigateToScreen('sell')} />

        <div className="px-4 space-y-4">
          {payees.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-white/50">
              {isPayeesLoading ? 'Loading beneficiaries…' : 'No beneficiaries saved yet.'}
            </div>
          )}

          {payees.map(payee => {
            const isActive = payee.id === selectedPayeeId
            return (
              <div
                key={payee.id}
                className={`rounded-xl p-4 flex justify-between items-center border ${
                  isActive ? 'border-primary bg-primary/10' : 'border-white/10 bg-[#0e1628]'
                }`}
              >
                <button
                  className="flex items-center gap-3 text-left"
                  onClick={() => {
                    setSelectedPayeeId(payee.id)
                    navigateToScreen('sell')
                    setError(null)
                  }}
                >
                  <Image
                    src={payee.upiId ? '/upi.svg' : '/bank.png'}
                    alt="type"
                    width={28}
                    height={28}
                  />
                  <div>
                    <p className="font-semibold">{payee.name || payee.upiId || 'Beneficiary'}</p>
                    <p className="text-xs text-white/60">
                      {payee.upiId || maskAccount(payee.accountNumber ?? undefined) || 'Account pending'}
                    </p>
                  </div>
                </button>

                <div className="flex items-center gap-3">
                  {isActive && <Icon icon="solar:check-circle-bold" className="text-primary text-lg" />}
                  <button
                    type="button"
                    className="text-red-400 disabled:text-white/30"
                    onClick={() => handleDeletePayee(payee.id)}
                    disabled={deletingPayeeId === payee.id}
                  >
                    {deletingPayeeId === payee.id ? (
                      <Icon icon="solar:loading-3-linear" className="text-lg animate-spin" />
                    ) : (
                      <Icon icon="solar:trash-bin-trash-bold" className="text-lg" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}

          <p className="text-xs text-center text-white/40">Need another beneficiary? Add one below.</p>
        </div>

        <BottomButton
          label="+ Add bank account / UPI"
          onClick={() => {
            setForm({ ...INITIAL_FORM })
            setError(null)
            navigateToScreen('addPayee')
          }}
        />
      </App>
    )
  }

  if (screen === 'addPayee') {
    const hasBankDetails =
      form.accountNumber.trim() !== '' &&
      form.ifsc.trim() !== '' &&
      form.accountName.trim() !== ''
    const hasUpi = form.upiId.trim() !== ''
    const canSubmit = hasBankDetails || hasUpi
    const saveDisabled = !canSubmit || isSavingPayee

    return (
      <App>
        <Header title="Add beneficiary" onBack={() => navigateToScreen('selectPayee')} />

        <div className="px-4 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Image src="/bank.png" alt="bank" width={28} height={28} />
              Bank details
            </div>

            <Input
              label="Account number"
              value={form.accountNumber}
              onChange={value => setForm(prev => ({ ...prev, accountNumber: value }))}
            />
            <Input
              label="Account holder name"
              value={form.accountName}
              onChange={value => setForm(prev => ({ ...prev, accountName: value }))}
            />
            <Input
              label="Bank name (optional)"
              value={form.bankName}
              onChange={value => setForm(prev => ({ ...prev, bankName: value }))}
            />
            <Input
              label="IFSC"
              value={form.ifsc}
              onChange={value => setForm(prev => ({ ...prev, ifsc: value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/40">OR</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Image src="/upi.svg" alt="upi" width={28} height={28} />
              UPI details
            </div>

            <Input
              label="UPI ID"
              value={form.upiId}
              onChange={value => setForm(prev => ({ ...prev, upiId: value }))}
            />
            <Input
              label="Display name (optional)"
              value={form.displayName}
              onChange={value => setForm(prev => ({ ...prev, displayName: value }))}
            />
          </div>

          <button
            disabled={saveDisabled}
            onClick={handleAddPayee}
            className={`w-full py-4 rounded-full font-semibold transition ${
              saveDisabled ? 'bg-white/20 text-white/50' : 'bg-black text-white'
            }`}
          >
            {isSavingPayee ? 'Saving…' : 'Save beneficiary'}
          </button>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <p className="text-xs text-white/40">
            We recommend verifying account details with a test transfer before submitting large orders.
          </p>
        </div>
      </App>
    )
  }

  return (
    <App>
      <Header
        title="Sell history"
        onBack={() => navigateToScreen('sell')}
        rightIcon="solar:refresh-circle-bold"
        onRight={() => fetchHistory().catch(() => null)}
      />

      <div className="px-4 space-y-3">
        {isHistoryLoading && !history.length && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Loading history…
          </div>
        )}

        {history.length === 0 && !isHistoryLoading ? (
          <div className="rounded-xl border border-dashed border-white/20 p-4 text-xs text-white/50">
            Sell orders will appear here once you submit a conversion.
          </div>
        ) : (
          history.map(order => {
            const expanded = expandedHistoryId === order.id
            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                onClick={() => setExpandedHistoryId(expanded ? null : order.id)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    setExpandedHistoryId(expanded ? null : order.id)
                  }
                }}
                className={`w-full text-left rounded-xl px-4 py-3 bg-[#0e1628] border transition ${
                  expanded ? 'border-primary/60' : 'border-white/10'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{formatCurrency(order.amountUsdt)} USDT</p>
                    {order.netInr !== null && (
                      <p className="text-xs text-emerald-400">₹{formatCurrency(order.netInr)}</p>
                    )}
                    <p className="text-xs text-white/50">{formatDateTime(order.createdAt)}</p>
                  </div>
                  <Icon
                    icon={expanded ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                    className="text-white/50"
                  />
                </div>

                {expanded && (
                  <div className="mt-3 border-t border-white/10 pt-3 text-xs text-white/60 space-y-1">
                    <p className="text-white/70">Status: {order.status}</p>
                    <p>Beneficiary: {getBeneficiaryLabel(order)}</p>
                    {order.txId && <p>Transaction ID: {order.txId}</p>}
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-white/80 transition hover:border-primary hover:text-primary"
                      onClick={event => {
                        event.stopPropagation()
                        router.push(`/exchange/sell/order?orderId=${order.id}`)
                      }}
                    >
                      View details
                      <Icon icon="solar:alt-arrow-right-bold" className="text-xs" />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </App>
  )
}

export default function SellPage() {
  return (
    <Suspense fallback={<SellPageFallback />}>
      <SellPageContent />
    </Suspense>
  )
}

/* ---------------- HELPERS ---------------- */

const App = ({ children }: { children: React.ReactNode }) => (
  <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
    <div className="w-full max-w-[420px] min-h-screen pb-28 bg-[#0b1220]">
      {children}
    </div>
  </main>
)

const Header = ({
  title,
  onBack,
  rightIcon,
  onRight,
}: {
  title: string
  onBack?: () => void
  rightIcon?: string
  onRight?: () => void
}) => (
  <header className="px-5 py-4 flex items-center justify-between">
    {onBack ? (
      <Icon icon="solar:alt-arrow-left-bold" className="text-2xl cursor-pointer" onClick={onBack} />
    ) : (
      <div />
    )}
    <p className="font-semibold">{title}</p>
    {rightIcon ? (
      <Icon icon={rightIcon} className="text-xl cursor-pointer" onClick={onRight} />
    ) : (
      <div />
    )}
  </header>
)

const BottomButton = ({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) => (
  <div className="fixed bottom-20 left-0 right-0 px-4 lg:static lg:px-0">
    <button
      onClick={onClick}
      className="w-full py-4 rounded-full bg-black font-semibold lg:max-w-sm lg:mx-auto"
    >
      {label}
    </button>
  </div>
)

const Input = ({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) => (
  <div>
    <p className="text-sm mb-1">{label}</p>
    <input
      value={value}
      onChange={event => onChange(event.target.value)}
      className="w-full bg-[#0e1628] p-3 rounded-lg outline-none"
    />
  </div>
)

const Row = ({
  label,
  value,
}: {
  label: string
  value: string
}) => (
  <div className="flex justify-between text-sm">
    <span className="text-white/50">{label}</span>
    <span className="text-white/90">{value}</span>
  </div>
)

const ProcessingOverlay = () => (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <span className="h-12 w-12 rounded-full border-2 border-white/20 border-t-primary animate-spin" />
      <p className="text-sm text-white/70">Submitting order…</p>
    </div>
  </div>
)

const SellPageFallback = () => (
  <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
    <div className="w-full max-w-[420px] min-h-screen pb-28 bg-[#0b1220] flex items-center justify-center">
      <div className="w-full px-6 space-y-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-16 rounded-2xl bg-white/10 animate-pulse" />
        ))}
      </div>
    </div>
  </main>
)

const formatDateTime = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getBeneficiaryLabel = (order: SellOrder) => {
  const bank = order.bank ?? order.history?.[0]?.bank
  if (bank && typeof bank === 'object') {
    const bankRecord = bank as Record<string, unknown>
    const upi = typeof bankRecord.upiId === 'string' ? bankRecord.upiId : null
    const account = typeof bankRecord.accountNumber === 'string' ? bankRecord.accountNumber : null
    const accountHolder = typeof bankRecord.accountHolderName === 'string' ? bankRecord.accountHolderName : null
    if (upi) return `${accountHolder ? `${accountHolder} · ` : ''}${upi}`
    if (account) return `${accountHolder ? `${accountHolder} · ` : ''}${maskAccount(account)}`
  }
  return order.destination ?? 'Beneficiary pending'
}

const maskAccount = (value?: string) => {
  if (!value) return '—'
  return value
}
