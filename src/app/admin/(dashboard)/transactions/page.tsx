'use client'

import { Icon } from '@iconify/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { formatCurrency } from '@/utils/formatters'
import { getPresetRange, DateRangePreset } from '@/utils/dateRanges'

type TabKey = 'deposits' | 'sellOrders' | 'withdrawals'

const TAB_CONFIG: Array<{ key: TabKey; label: string }> = [
  { key: 'deposits', label: 'Deposits' },
  { key: 'sellOrders', label: 'Sell orders' },
  { key: 'withdrawals', label: 'Withdrawals' },
]

const LIMIT_OPTIONS = [50, 100, 200] as const

const placeholderMap: Record<TabKey, string> = {
  deposits: 'Search deposits by ID, user, phone, or network',
  sellOrders: 'Search sell orders by ID, user, or metadata',
  withdrawals: 'Search withdrawals by ID, user, or destination',
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
  actor?: string | null
  note?: string | null
  txId?: string | null
}

type SellOrderMetadata = {
  status?: string | null
  amountUsdt?: number | null
  rateInr?: number | null
  grossInr?: number | null
  netInr?: number | null
  feeAmount?: number | null
  feePercent?: number | null
  payoutInr?: number | null
  adminNote?: string | null
  reason?: string | null
  txId?: string | null
  bank?: SellOrderBank | null
  history?: SellOrderHistoryEntry[]
} & Record<string, unknown>

const toCleanString = (value: unknown): string | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : null
  }
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed ? trimmed : null
  }
  return null
}

const normalizeBankDetails = (input: unknown): SellOrderBank | null => {
  if (!input || typeof input !== 'object') return null
  const root = input as Record<string, unknown>
  const candidates: Record<string, unknown>[] = []

  const pushCandidate = (value: unknown) => {
    if (value && typeof value === 'object') {
      candidates.push(value as Record<string, unknown>)
    }
  }

  pushCandidate(root['bank'])
  pushCandidate(root['beneficiary'])
  candidates.push(root)

  const extract = (keys: string[]): string | null => {
    for (const candidate of candidates) {
      for (const key of keys) {
        const result = toCleanString(candidate[key])
        if (result) return result
      }
    }
    return null
  }

  const accountHolderName = extract(['accountHolderName', 'beneficiaryName', 'name', 'accountName'])
  const bankName = extract(['bankName', 'bank'])
  const accountNumber = extract(['accountNumber', 'accountNo', 'account_number'])
  const ifsc = extract(['ifsc', 'ifscCode', 'ifsc_code'])
  const upiId = extract(['upiId', 'upi', 'upi_id'])

  if (!accountHolderName && !bankName && !accountNumber && !ifsc && !upiId) {
    return null
  }

  return {
    accountHolderName,
    bankName,
    accountNumber,
    ifsc,
    upiId,
  }
}

const SELL_ORDER_FINAL_STATUSES = new Set<string>(['COMPLETED', 'REJECTED', 'FAILED'])
const WITHDRAWAL_FINAL_STATUSES = new Set<string>(['COMPLETED', 'REJECTED', 'FAILED'])

const CopyButton = ({
  value,
  label,
  size = 'default',
}: {
  value: string
  label: string
  size?: 'default' | 'compact'
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      })
      .catch(() => {
        setCopied(false)
      })
  }, [value])

  const sizeClasses =
    size === 'compact'
      ? 'h-5 w-5'
      : 'h-7 w-7'

  const iconClass = size === 'compact' ? 'text-[9px]' : 'text-sm'

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`flex items-center justify-center rounded-full bg-white/10 text-white/60 transition hover:bg-white/20 hover:text-white ${sizeClasses}`}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied!' : label}
    >
      <Icon icon={copied ? 'solar:check-circle-bold' : 'solar:copy-bold'} className={iconClass} />
    </button>
  )
}

type SummaryItem = {
  label: string
  value: string
  secondary?: string | null
}

type DetailItem = {
  label: string
  primary: string
  secondary?: string | string[] | null
  copyValue?: string
  mono?: boolean
}

const DetailList = ({ items }: { items: DetailItem[] }) => {
  if (!items.length) return null

  return (
    <div className="space-y-3">
      {items.map(({ label, primary, secondary, copyValue, mono }, index) => {
        const extra = secondary
          ? (Array.isArray(secondary) ? secondary : [secondary]).filter(
              (value): value is string => Boolean(value)
            )
          : []

        return (
          <div
            key={`${label}-${index}`}
            className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-[2px] sm:px-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`break-all text-sm font-semibold text-white ${
                    mono ? 'font-mono text-xs tracking-tight text-white/70' : ''
                  }`}
                >
                  {primary}
                </span>
                {copyValue ? <CopyButton value={copyValue} label={`Copy ${label}`} /> : null}
              </div>
            </div>
            {extra.length ? (
              <ul className="mt-2 space-y-1 text-xs text-white/50">
                {extra.map((value, extraIndex) => (
                  <li key={`${label}-secondary-${extraIndex}`} className="break-all">
                    {value}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

const buildBankSummary = (bank: SellOrderBank | null | undefined) => {
  if (!bank) return null

  const { accountHolderName, bankName, accountNumber, ifsc, upiId } = bank
  const secondary: string[] = []

  if (bankName) secondary.push(`Bank: ${bankName}`)
  if (accountNumber) secondary.push(`Account: ${accountNumber}`)
  if (ifsc) secondary.push(`IFSC: ${ifsc.toUpperCase()}`)
  if (upiId) secondary.push(`UPI: ${upiId}`)

  if (!accountHolderName && !secondary.length) {
    return null
  }

  const copyValue = [
    accountHolderName ? `Name: ${accountHolderName}` : null,
    ...secondary,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    primary: accountHolderName || (bankName ? `Bank: ${bankName}` : '—'),
    secondary,
    copyValue,
  }
}

const toSearchString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    return value.map(toSearchString).join(' ')
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).toLowerCase()
    } catch (error) {
      return ''
    }
  }
  return String(value).toLowerCase()
}

const matchesSearch = (fields: unknown[], query: string) => {
  const search = query.trim().toLowerCase()
  if (!search) return true
  return fields.some((field) => toSearchString(field).includes(search))
}

const formatStatusLabel = (status?: string | null) => {
  if (!status) return '—'
  return status
    .toString()
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const extractMetadataNumber = (
  metadata: Record<string, unknown> | undefined,
  keys: string[]
): number | null => {
  if (!metadata) return null
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) return parsed
    }
  }
  return null
}

const parseSellOrderMetadata = (raw: Record<string, unknown> | undefined): SellOrderMetadata => {
  if (!raw || typeof raw !== 'object') return {}
  const metadata = raw as SellOrderMetadata
  const bank = normalizeBankDetails(metadata.bank ?? raw)
  const history = Array.isArray(metadata.history)
    ? (metadata.history.filter(item => item && typeof item === 'object') as SellOrderHistoryEntry[])
    : []

  return {
    ...metadata,
    bank,
    history,
  }
}

const extractMetadataString = (
  metadata: Record<string, unknown> | undefined,
  keys: string[]
): string | null => {
  if (!metadata) return null
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return null
}

export default function AdminTransactionsPage() {
  const {
    transactions,
    fetchTransactions,
    isTransactionsLoading,
    error,
    clearError,
    approveWithdrawal,
    rejectWithdrawal,
    completeSellOrder,
    rejectSellOrder,
  } = useAdminAuth()

  const [activeTab, setActiveTab] = useState<TabKey>('deposits')
  const [query, setQuery] = useState('')
  const [limit, setLimit] = useState<typeof LIMIT_OPTIONS[number]>(LIMIT_OPTIONS[0])
  const [actioningWithdrawalId, setActioningWithdrawalId] = useState<string | null>(null)
  const [actioningSellOrderId, setActioningSellOrderId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [rangePreset, setRangePreset] = useState<DateRangePreset>('today')

  const rangeParams = useMemo(() => getPresetRange(rangePreset), [rangePreset])

  useEffect(() => {
    fetchTransactions({ limit, ...rangeParams }).catch(() => null)
  }, [fetchTransactions, limit, rangeParams])

  const deposits = transactions?.deposits ?? []
  const sellOrders = transactions?.sellOrders ?? []
  const withdrawals = transactions?.withdrawals ?? []

  const filteredDeposits = useMemo(() => {
    if (!query.trim()) return deposits
    return deposits.filter((item) =>
      matchesSearch(
        [
          item.id,
          item.userName,
          item.userPhone,
          item.status,
          item.txId,
          item.network,
          item.amount,
          item.notes,
        ],
        query
      )
    )
  }, [deposits, query])

  const filteredSellOrders = useMemo(() => {
    if (!query.trim()) return sellOrders
    return sellOrders.filter((item) =>
      matchesSearch(
        [
          item.id,
          item.userName,
          item.userPhone,
          item.entryType,
          item.metadata?.status,
          item.amount,
          Object.values(item.metadata ?? {}),
        ],
        query
      )
    )
  }, [sellOrders, query])

  const filteredWithdrawals = useMemo(() => {
    if (!query.trim()) return withdrawals
    return withdrawals.filter((item) =>
      matchesSearch(
        [
          item.id,
          item.userName,
          item.userPhone,
          item.status,
          item.destination,
          item.amount,
          item.txId,
        ],
        query
      )
    )
  }, [withdrawals, query])

  const handleRefresh = useCallback(() => {
    fetchTransactions({ limit, ...rangeParams }).catch(() => null)
  }, [fetchTransactions, limit, rangeParams])

  const handleLimitChange = useCallback(
    (value: number) => {
      if (error) clearError()
      setLimit(value as typeof LIMIT_OPTIONS[number])
    },
    [clearError, error]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      if (error) clearError()
      setQuery(value)
    },
    [clearError, error]
  )

  const handleTabChange = useCallback((key: TabKey) => {
    setActiveTab(key)
  }, [])

  useEffect(() => {
    if (!actionMessage) return
    const timer = window.setTimeout(() => setActionMessage(null), 3000)
    return () => window.clearTimeout(timer)
  }, [actionMessage])

  const handleWithdrawalApprove = useCallback(
    async (withdrawalId: string) => {
      if (actioningWithdrawalId) return

      const txId = window.prompt('Enter blockchain transaction hash (optional):') ?? undefined

      setActioningWithdrawalId(withdrawalId)
      setActionMessage(null)
      try {
        const result = (await approveWithdrawal(withdrawalId, txId ? { txId } : {})) as {
          id: string
          status?: string
        }
        await fetchTransactions({ limit, ...rangeParams }).catch(() => null)
        setActionMessage(`Withdrawal ${result?.id ?? withdrawalId} marked as completed.`)
      } catch (err) {
        // handled by context
      } finally {
        setActioningWithdrawalId(null)
      }
    },
    [actioningWithdrawalId, approveWithdrawal, fetchTransactions, limit, rangeParams]
  )

  const handleWithdrawalReject = useCallback(
    async (withdrawalId: string) => {
      if (actioningWithdrawalId) return

      const reason = window.prompt('Provide a reason for rejection:', 'Rejected by administrator') ?? undefined

      setActioningWithdrawalId(withdrawalId)
      setActionMessage(null)
      try {
        const result = (await rejectWithdrawal(withdrawalId, reason ? { reason } : {})) as {
          id: string
          status?: string
        }
        await fetchTransactions({ limit, ...rangeParams }).catch(() => null)
        setActionMessage(`Withdrawal ${result?.id ?? withdrawalId} marked as rejected.`)
      } catch (err) {
        // handled by context
      } finally {
        setActioningWithdrawalId(null)
      }
    },
    [actioningWithdrawalId, fetchTransactions, limit, rangeParams, rejectWithdrawal]
  )

  const countByTab = useMemo(
    () => ({
      deposits: deposits.length,
      sellOrders: sellOrders.length,
      withdrawals: withdrawals.length,
    }),
    [deposits.length, sellOrders.length, withdrawals.length]
  )

  const lastUpdatedAt = useMemo(() => {
    const timestamps = [
      ...deposits.map((item) => item.createdAt),
      ...sellOrders.map((item) => item.createdAt),
      ...withdrawals.map((item) => item.createdAt),
    ].filter(Boolean)

    if (!timestamps.length) return null

    const latest = timestamps.reduce((acc, current) => {
      if (!acc) return current
      return new Date(current) > new Date(acc) ? current : acc
    }, timestamps[0])

    return latest ?? null
  }, [deposits, sellOrders, withdrawals])

  return (
    <section className="space-y-8">
      <header className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Ledger</p>
          <h1 className="text-3xl font-semibold">Transactions monitor</h1>
          <p className="text-sm text-white/60">
            Audit real settlement flows spanning deposits, conversions, and outbound releases.
          </p>
          <p className="text-xs text-white/40">
            Last synced&nbsp;
            <span className="font-medium text-white/60">{formatDateTime(lastUpdatedAt)}</span>
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative w-full">
            <Icon icon="solar:magnifer-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={placeholderMap[activeTab]}
              className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {TAB_CONFIG.map((tab) => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabChange(tab.key)}
                    className={`rounded-2xl border px-4 py-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                      active
                        ? 'border-emerald-400/80 bg-emerald-500/15 text-emerald-50 shadow-[0_8px_30px_rgba(16,185,129,0.15)]'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                    type="button"
                  >
                    <span className="text-xs uppercase tracking-wide text-white/40">{tab.label}</span>
                    <div className="mt-3 flex items-end justify-between">
                      <p className="text-2xl font-semibold text-white">{countByTab[tab.key]}</p>
                      <Icon icon="solar:alt-arrow-right-bold" className="text-lg text-white/30" />
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full max-w-xs sm:w-44">
                <select
                  value={rangePreset}
                  onChange={(event) => setRangePreset(event.target.value as DateRangePreset)}
                  aria-label="Filter transactions by date range"
                  className="w-full appearance-none rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option value="all" className="bg-[#0b1220] text-white">
                    All time
                  </option>
                  <option value="today" className="bg-[#0b1220] text-white">
                    Today
                  </option>
                  <option value="3d" className="bg-[#0b1220] text-white">
                    Last 3 days
                  </option>
                  <option value="7d" className="bg-[#0b1220] text-white">
                    7 days
                  </option>
                  <option value="30d" className="bg-[#0b1220] text-white">
                    30 days
                  </option>
                </select>
                <Icon icon="solar:alt-arrow-down-bold" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-base text-white/50" />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(event) => handleLimitChange(Number(event.target.value))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {LIMIT_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[#0b1220] text-white">
                      {option} rows
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleRefresh}
                  disabled={isTransactionsLoading}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Icon
                    icon="solar:refresh-circle-bold"
                    className={`text-lg ${isTransactionsLoading ? 'animate-spin text-emerald-300' : 'text-emerald-200'}`}
                  />
                  {isTransactionsLoading ? 'Refreshing' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {actionMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          <p>{actionMessage}</p>
          <button
            onClick={() => setActionMessage(null)}
            className="rounded-full border border-emerald-500/30 bg-emerald-500/20 p-1 text-emerald-200 transition hover:bg-emerald-500/30"
            aria-label="Dismiss message"
          >
            <Icon icon="solar:close-circle-bold" className="text-lg" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          <p>{error}</p>
          <button
            onClick={clearError}
            className="rounded-full border border-red-500/30 bg-red-500/20 p-1 text-red-100 transition hover:bg-red-500/30"
            aria-label="Dismiss error"
          >
            <Icon icon="solar:close-circle-bold" className="text-lg" />
          </button>
        </div>
      )}

      {activeTab === 'deposits' && (
        <section className="space-y-4">
          <SectionHeading
            icon="solar:download-square-bold"
            title="Deposits (USDT)"
            description="Track inbound crypto top-ups and reconcile ledger accruals."
          />
          {isTransactionsLoading && !deposits.length ? (
            <LoadingState message="Fetching the latest deposits…" />
          ) : filteredDeposits.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDeposits.map((deposit) => {
                const depositBank = normalizeBankDetails(deposit.notes)
                const depositBankSummary = buildBankSummary(depositBank)
                const summaryItems: SummaryItem[] = [
                  {
                    label: 'User',
                    value: deposit.userName,
                    secondary: deposit.userPhone || null,
                  },
                  {
                    label: 'Amount',
                    value: `${formatCurrency(deposit.amount)} USDT`,
                  },
                  {
                    label: 'Created',
                    value: formatDateTime(deposit.createdAt),
                  },
                ]

                if (deposit.network) {
                  summaryItems.push({ label: 'Network', value: deposit.network })
                }

                const detailItems: DetailItem[] = []

                if (deposit.txId) {
                  detailItems.push({
                    label: 'Blockchain hash',
                    primary: deposit.txId,
                    copyValue: deposit.txId,
                    mono: true,
                  })
                }

                if (depositBankSummary) {
                  detailItems.push({
                    label: 'Bank details',
                    primary: depositBankSummary.primary,
                    secondary: depositBankSummary.secondary,
                    copyValue: depositBankSummary.copyValue,
                  })
                }

                return (
                  <TransactionCard
                    key={deposit.id}
                    idLabel="Deposit"
                    idValue={deposit.id}
                    status={deposit.status}
                    summaryItems={summaryItems}
                    detailItems={detailItems}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              message={
                query ? 'No deposits match your search query.' : 'No deposit activity has been recorded yet.'
              }
            />
          )}
        </section>
      )}

      {activeTab === 'sellOrders' && (
        <section className="space-y-4">
          <SectionHeading
            icon="solar:transfer-horizontal-bold"
            title="Sell orders (USDT → INR)"
            description="Inspect conversion queue, payout status, and settlement metadata."
          />

          {isTransactionsLoading && !sellOrders.length ? (
            <LoadingState message="Fetching sell-side conversions…" />
          ) : filteredSellOrders.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSellOrders.map((order) => {
                const metadata = parseSellOrderMetadata(order.metadata)
                const metadataRecord = metadata as Record<string, unknown>
                const status = metadata.status || order.entryType
                const amountUsdt = metadata.amountUsdt ?? order.amount
                const grossInr = extractMetadataNumber(metadataRecord, ['grossInr', 'gross_inr']) ?? null
                const netInr = extractMetadataNumber(metadataRecord, ['netInr', 'net_inr', 'payoutInr']) ?? null
                const fee = extractMetadataNumber(metadataRecord, ['feeAmount', 'fee_amount', 'fee']) ?? null
                const rateInr = extractMetadataNumber(metadataRecord, ['rateInr', 'rate_inr']) ?? null
                const reference = metadata.txId || extractMetadataString(metadataRecord, ['reference', 'utr', 'utrNumber'])
                const reason = typeof metadata.reason === 'string' ? metadata.reason : null
                const adminNote = typeof metadata.adminNote === 'string' ? metadata.adminNote : null
                const bankDetails = metadata.bank ?? normalizeBankDetails(metadataRecord)
                const bankSummary = buildBankSummary(bankDetails)
                const history = metadata.history ?? []
                const finalStatus = (status ?? '').toUpperCase()
                const isFinal = SELL_ORDER_FINAL_STATUSES.has(finalStatus)
                const summaryItems: SummaryItem[] = [
                  {
                    label: 'User',
                    value: order.userName,
                    secondary: order.userPhone || null,
                  },
                  {
                    label: 'Trade',
                    value: `${formatCurrency(amountUsdt)} USDT`,
                    secondary:
                      rateInr !== null ? `Rate ₹${formatCurrency(rateInr)} / USDT` : null,
                  },
                ]

                if (netInr !== null) {
                  summaryItems.push({
                    label: 'Net payout',
                    value: `₹${formatCurrency(netInr)}`,
                    secondary: reference ? `Ref ${reference}` : null,
                  })
                }

                summaryItems.push({
                  label: 'Created',
                  value: formatDateTime(order.createdAt),
                })

                const detailItems: DetailItem[] = []

                if (grossInr !== null || fee !== null) {
                  detailItems.push({
                    label: 'Gross settlement',
                    primary: grossInr !== null ? `₹${formatCurrency(grossInr)}` : '—',
                    secondary:
                      fee !== null ? `Fee ₹${formatCurrency(fee)}` : undefined,
                  })
                }

                if (reference && netInr === null) {
                  detailItems.push({
                    label: 'Reference',
                    primary: reference,
                    copyValue: reference,
                    mono: true,
                  })
                }

                if (bankSummary) {
                  detailItems.push({
                    label: 'Bank details',
                    primary: bankSummary.primary,
                    secondary: bankSummary.secondary,
                    copyValue: bankSummary.copyValue,
                  })
                }

                const extraContent = (
                  <>
                    {(reason || adminNote) && (
                      <div className="rounded-2xl bg-red-500/15 px-4 py-3 text-xs text-red-100 shadow-sm shadow-black/10 ring-1 ring-red-400/20">
                        {reason ? (
                          <p className="font-medium text-red-200">Reason: <span className="font-normal text-red-100">{reason}</span></p>
                        ) : null}
                        {adminNote ? (
                          <p className="mt-1 text-red-100/80">
                            <span className="font-medium text-red-200">Admin note: </span>
                            {adminNote}
                          </p>
                        ) : null}
                      </div>
                    )}
                    {history.length ? <TransactionTimeline entries={history} /> : null}
                  </>
                )

                return (
                  <TransactionCard
                    key={order.id}
                    idLabel="Sell order"
                    idValue={order.id}
                    status={status}
                    summaryItems={summaryItems}
                    detailItems={detailItems}
                    extraContent={extraContent}
                    actions={
                      <>
                        <button
                          onClick={async () => {
                            if (actioningSellOrderId) return
                            const txId = window.prompt('Enter bank transaction reference (optional):') ?? undefined
                            setActioningSellOrderId(order.id)
                            setActionMessage(null)
                            try {
                              await completeSellOrder(order.id, txId ? { txId } : {})
                              await fetchTransactions({ limit, ...rangeParams }).catch(() => null)
                              setActionMessage(`Sell order ${order.id.slice(0, 6).toUpperCase()} marked as completed.`)
                            } catch (err) {
                              // handled by context
                            } finally {
                              setActioningSellOrderId(null)
                            }
                          }}
                          disabled={
                            actioningSellOrderId === order.id || isFinal || status === 'COMPLETED'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon icon="solar:check-circle-bold" />
                          {actioningSellOrderId === order.id ? 'Updating…' : 'Mark complete'}
                        </button>

                        <button
                          onClick={async () => {
                            if (actioningSellOrderId) return
                            const reasonInput = window.prompt('Provide a rejection reason:', 'Rejected by administrator') ?? undefined
                            const noteInput = window.prompt('Add an optional admin note (visible to user):') ?? undefined
                            setActioningSellOrderId(order.id)
                            setActionMessage(null)
                            try {
                              await rejectSellOrder(order.id, {
                                reason: reasonInput || undefined,
                                note: noteInput || undefined,
                              })
                              await fetchTransactions({ limit, ...rangeParams }).catch(() => null)
                              setActionMessage(`Sell order ${order.id.slice(0, 6).toUpperCase()} marked as rejected.`)
                            } catch (err) {
                              // handled by context
                            } finally {
                              setActioningSellOrderId(null)
                            }
                          }}
                          disabled={
                            actioningSellOrderId === order.id || isFinal || status === 'REJECTED'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon icon="solar:close-circle-bold" />
                          {actioningSellOrderId === order.id ? 'Updating…' : 'Reject'}
                        </button>
                      </>
                    }
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              message={
                query
                  ? 'No sell orders matched your filters.'
                  : 'Conversion orders will appear here once users sell USDT.'
              }
            />
          )}
        </section>
      )}

      {activeTab === 'withdrawals' && (
        <section className="space-y-4">
          <SectionHeading
            icon="solar:upload-square-bold"
            title="Withdrawals (USDT)"
            description="Monitor outbound wallet releases and settlement confirmations."
          />

          {isTransactionsLoading && !withdrawals.length ? (
            <LoadingState message="Fetching withdrawal queue…" />
          ) : filteredWithdrawals.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredWithdrawals.map((withdrawal) => {
                const notes = (withdrawal.notes ?? {}) as Record<string, unknown>
                const network = typeof notes.network === 'string' ? notes.network : null
                const fee = typeof notes.fee === 'number' ? notes.fee : null
                const finalStatus = (withdrawal.status ?? '').toUpperCase()
                const isFinal = WITHDRAWAL_FINAL_STATUSES.has(finalStatus)
                const summaryItems: SummaryItem[] = [
                  {
                    label: 'Amount',
                    value: `${formatCurrency(withdrawal.amount)} USDT`,
                  },
                  {
                    label: 'User',
                    value: withdrawal.userName,
                    secondary: withdrawal.userPhone || null,
                  },
                  {
                    label: 'Created',
                    value: formatDateTime(withdrawal.createdAt),
                  },
                ]

                const detailItems: DetailItem[] = []

                if (fee !== null) {
                  detailItems.push({
                    label: 'Fee',
                    primary: `${formatCurrency(fee)} USDT`,
                  })
                }

                if (network) {
                  detailItems.push({ label: 'Network', primary: network })
                }

                if (withdrawal.destination) {
                  detailItems.push({
                    label: 'Destination',
                    primary: withdrawal.destination,
                    copyValue: withdrawal.destination,
                    mono: true,
                  })
                }

                if (withdrawal.txId) {
                  detailItems.push({
                    label: 'Blockchain hash',
                    primary: withdrawal.txId,
                    copyValue: withdrawal.txId,
                    mono: true,
                  })
                }

                return (
                  <TransactionCard
                    key={withdrawal.id}
                    idLabel="Withdrawal"
                    idValue={withdrawal.id}
                    status={withdrawal.status}
                    summaryItems={summaryItems}
                    detailItems={detailItems}
                    actions={
                      <>
                        <button
                          onClick={() => handleWithdrawalApprove(withdrawal.id)}
                          disabled={
                            actioningWithdrawalId === withdrawal.id ||
                            isFinal ||
                            withdrawal.status === 'COMPLETED'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon icon="solar:check-circle-bold" />
                          {actioningWithdrawalId === withdrawal.id ? 'Updating…' : 'Mark complete'}
                        </button>
                        <button
                          onClick={() => handleWithdrawalReject(withdrawal.id)}
                          disabled={
                            actioningWithdrawalId === withdrawal.id ||
                            isFinal ||
                            withdrawal.status === 'REJECTED'
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/70 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Icon icon="solar:close-circle-bold" />
                          {actioningWithdrawalId === withdrawal.id ? 'Updating…' : 'Reject'}
                        </button>
                      </>
                    }
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState
              message={
                query
                  ? 'No withdrawals matched your search.'
                  : 'Outbound withdrawals will appear once initiated.'
              }
            />
          )}
        </section>
      )}
    </section>
  )
}

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
    {message}
  </div>
)

const SectionHeading = ({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) => (
  <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <div className="flex items-center gap-2 text-white">
        <span className="rounded-xl bg-emerald-500/10 p-2 text-emerald-300">
          <Icon icon={icon} className="text-lg" />
        </span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-white/60 md:mt-1">{description}</p>
    </div>
  </header>
)

const StatusBadge = ({ status }: { status?: string | null }) => {
  const palette = getStatusPalette(status)
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${palette.bg} ${palette.text} ${palette.ring}`}
    >
      <span className={`h-2 w-2 rounded-full ${palette.dot}`} />
      {formatStatusLabel(status)}
    </span>
  )
}

const getStatusPalette = (status?: string | null) => {
  const normalized = (status ?? '').toString().toUpperCase()
  if (['VERIFIED', 'COMPLETED', 'PAID', 'SENT', 'APPROVED', 'SUCCESS', 'SETTLED'].includes(normalized)) {
    return {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-100',
      ring: 'ring-emerald-400/30',
      dot: 'bg-emerald-300',
    }
  }
  if ([
    'PENDING',
    'PENDING_PAYOUT',
    'REQUESTED',
    'PROCESSING',
    'IN_PROGRESS',
    'QUEUED',
  ].includes(normalized)) {
    return {
      bg: 'bg-amber-500/15',
      text: 'text-amber-100',
      ring: 'ring-amber-400/30',
      dot: 'bg-amber-300',
    }
  }
  if (['REJECTED', 'FAILED', 'CANCELLED', 'BLOCKED', 'ERROR'].includes(normalized)) {
    return {
      bg: 'bg-red-500/15',
      text: 'text-red-100',
      ring: 'ring-red-400/30',
      dot: 'bg-red-300',
    }
  }
  return {
    bg: 'bg-white/10',
    text: 'text-white/70',
    ring: 'ring-white/20',
    dot: 'bg-white/60',
  }
}

const LoadingState = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70">
    <Icon icon="solar:refresh-bold" className="mx-auto mb-2 animate-spin text-lg text-emerald-300" />
    {message}
  </div>
)

const SummaryList = ({ items }: { items: SummaryItem[] }) => (
  <div className="grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
    {items.map(({ label, value, secondary }, index) => (
      <div key={`${label}-${index}`} className="rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-[2px]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">{label}</p>
        <p className="mt-1 break-all text-sm font-semibold text-white">{value}</p>
        {secondary ? <p className="mt-1 break-all text-xs text-white/50">{secondary}</p> : null}
      </div>
    ))}
  </div>
)

const TransactionTimeline = ({ entries }: { entries: SellOrderHistoryEntry[] }) => {
  if (!entries.length) return null

  return (
    <div className="space-y-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-[2px] sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">Timeline</p>
      <ol className="space-y-3">
        {entries
          .slice()
          .reverse()
          .map((item, index) => (
            <li
              key={`${item.status}-${item.timestamp}-${index}`}
              className="rounded-2xl bg-black/20 p-3 text-xs text-white/70 ring-1 ring-white/10"
            >
              <p className="text-sm font-semibold text-white/80">{formatStatusLabel(item.status)}</p>
              <p className="mt-1 text-white/50">{formatDateTime(item.timestamp)}</p>
              {item.actor ? <p className="mt-1 text-white/60">By {item.actor}</p> : null}
              {item.note ? <p className="mt-1 text-white/60">Note: {item.note}</p> : null}
              {item.txId ? (
                <p className="mt-1 break-all font-mono text-[11px] text-white/50">TX: {item.txId}</p>
              ) : null}
            </li>
          ))}
      </ol>
    </div>
  )
}

type TransactionCardProps = {
  idLabel: string
  idValue: string
  status?: string | null
  summaryItems: SummaryItem[]
  detailItems?: DetailItem[]
  extraContent?: ReactNode
  actions?: ReactNode
}

const TransactionCard = ({
  idLabel,
  idValue,
  status,
  summaryItems,
  detailItems = [],
  extraContent,
  actions,
}: TransactionCardProps) => {
  const canExpand = detailItems.length > 0 || Boolean(extraContent)
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl bg-gradient-to-b from-white/5 via-white/3 to-transparent p-4 ring-1 ring-white/10 backdrop-blur-sm sm:p-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{idLabel}</p>
          <div className="flex flex-wrap items-center gap-1">
            <p className="break-all text-[9px] font-semibold uppercase tracking-[0.28em] text-white/60">{idValue}</p>
            <CopyButton value={idValue} label={`Copy ${idLabel}`} size="compact" />
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-start">
          <StatusBadge status={status} />
          {canExpand ? (
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              type="button"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Hide details' : 'Show details'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            >
              <Icon icon={isExpanded ? 'solar:minus-circle-bold' : 'solar:add-circle-bold'} className="text-lg" />
            </button>
          ) : null}
        </div>
      </header>

      <SummaryList items={summaryItems} />

      {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}

      {canExpand ? (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isExpanded ? (
            <div className="space-y-4 pt-2">
              {detailItems.length ? <DetailList items={detailItems} /> : null}
              {extraContent}
            </div>
          ) : null}
        </div>
      ) : extraContent ? extraContent : null}
    </article>
  )
}
