'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'
import { useAdminAuth, AdminUser } from '@/contexts/AdminAuthContext' 
import { formatCurrency } from '@/utils/formatters'
import { getPresetRange, DateRangePreset } from '@/utils/dateRanges'

type TransactionRow = {
  id: string
  label: string
  amount: string
  status: string
  createdAt: string
}

const UsersPage = () => {
  const router = useRouter()
  const {
    users,
    userTotal,
    fetchUsers,
    isUsersLoading,
    updateUserStatus,
    updateUserBalance,
    fetchUserTransactions,
  } = useAdminAuth()

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('')
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [rangePreset, setRangePreset] = useState<DateRangePreset>('all')
  const [isEditingBalance, setIsEditingBalance] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)

  const rangeParams = useMemo(() => getPresetRange(rangePreset), [rangePreset])

  useEffect(() => {
    fetchUsers(rangeParams).catch(() => null)
  }, [fetchUsers, rangeParams])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers({ search: query, ...rangeParams }).catch(() => null)
    }, 250)

    return () => clearTimeout(timeout)
  }, [query, fetchUsers, rangeParams])

  const selectedUser: AdminUser | null = useMemo(() => {
    if (!users.length) return null
    return users.find((user) => user.id === selectedId) ?? users[0]
  }, [users, selectedId])

  useEffect(() => {
    if (users.length && !selectedId) {
      setSelectedId(users[0].id)
    }
  }, [users, selectedId])

  useEffect(() => {
    // Reset edit state when selected user changes
    setIsEditingBalance(false)
    setBalanceInput('')
  }, [selectedId])

  const handleNavigateToDetail = useCallback(
    (userId: string) => {
      router.push(`/admin/users/${userId}`)
    },
    [router]
  )

  const handleToggleStatus = useCallback(
    async (user: AdminUser) => {
      const nextStatus = user.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE'
      await updateUserStatus(user.id, nextStatus)
      fetchUsers({ search: query, ...rangeParams }).catch(() => null)
    },
    [updateUserStatus, fetchUsers, query, rangeParams]
  )

  const openTransactionsModal = useCallback(async () => {
    if (!selectedUser) return
    setIsTransactionsOpen(true)
    setIsTransactionsLoading(true)
    try {
      const relations = await fetchUserTransactions(selectedUser.id)
      const mapped: TransactionRow[] = [
        ...relations.deposits.map((item) => ({
          id: item.id,
          label: 'Deposit',
          amount: `+${formatCurrency(item.amount)}`,
          status: item.status,
          createdAt: new Date(item.createdAt).toLocaleString('en-IN'),
        })),
        ...relations.withdrawals.map((item) => ({
          id: item.id,
          label: 'Withdrawal',
          amount: `-${formatCurrency(item.amount)}`,
          status: item.status,
          createdAt: new Date(item.createdAt).toLocaleString('en-IN'),
        })),
        ...relations.statements.map((item) => ({
          id: item.id,
          label: item.type.replaceAll('_', ' '),
          amount: `${item.amount >= 0 ? '+' : ''}${formatCurrency(item.amount)}`,
          status: 'Statement',
          createdAt: new Date(item.createdAt).toLocaleString('en-IN'),
        })),
      ]
      setTransactions(mapped)
    } catch {
      setTransactions([])
    } finally {
      setIsTransactionsLoading(false)
    }
  }, [selectedUser, fetchUserTransactions])

  const handleStartEditBalance = useCallback(() => {
    if (!selectedUser) return
    setBalanceInput(selectedUser.balance.toString())
    setIsEditingBalance(true)
  }, [selectedUser])

  const handleCancelEditBalance = useCallback(() => {
    setIsEditingBalance(false)
    setBalanceInput('')
  }, [])

  const handleSaveBalance = useCallback(async () => {
    if (!selectedUser) return
    const newBalance = parseFloat(balanceInput)
    if (isNaN(newBalance) || newBalance < 0) {
      alert('Please enter a valid non-negative number')
      return
    }

    setIsUpdatingBalance(true)
    try {
      const reason = window.prompt('Enter a reason for this balance adjustment (optional):') || undefined
      const updatedUser = await updateUserBalance(selectedUser.id, newBalance, reason)
      // Update the selected user in the list
      await fetchUsers({ search: query, ...rangeParams })
      // If the updated user is the currently selected one, update the selection
      if (updatedUser.id === selectedId) {
        setSelectedId(updatedUser.id) // This will trigger a re-render with updated data
      }
      setIsEditingBalance(false)
      setBalanceInput('')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update balance')
    } finally {
      setIsUpdatingBalance(false)
    }
  }, [selectedUser, balanceInput, updateUserBalance, fetchUsers, query, rangeParams, selectedId])

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Directory</p>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">User management</h1>
            <p className="text-xs text-white/40">{userTotal.toLocaleString('en-IN')} accounts</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Icon icon="solar:magnifer-bold" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, phone, or ID"
                className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div className="relative w-full max-w-xs sm:w-44">
              <select
                value={rangePreset}
                onChange={(event) => setRangePreset(event.target.value as DateRangePreset)}
                aria-label="Filter users by date range"
                className="w-full appearance-none rounded-full border border-white/10 bg-white/5 py-3 pl-4 pr-10 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="all" className="bg-[#0b1220] text-white">
                  All time
                </option>
                <option value="today" className="bg-[#0b1220] text-white">
                  Today
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
          </div>
        </div>
        <p className="text-sm text-white/60">
          Locate accounts, review balances, and trigger user-specific actions.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <aside className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
          {isUsersLoading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              Loading users…
            </div>
          )}

          {!isUsersLoading && !users.length && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
              No users found.
            </div>
          )}

          {users.map((user) => {
            const active = selectedUser?.id === user.id
            return (
              <button
                key={user.id}
                onClick={() => setSelectedId(user.id)}
                className={`w-full rounded-2xl border px-5 py-4 text-left transition-colors ${
                  active
                    ? 'border-emerald-400/80 bg-emerald-400/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] uppercase tracking-wide ${
                      user.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {user.status}
                  </span>
                </div>
                <p className="text-xs text-white/50">{user.phone || '—'}</p>
                <p className="mt-2 text-[11px] text-white/40">{user.id}</p>
              </button>
            )
          })}
        </aside>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:p-8">
          {selectedUser ? (
            <div className="space-y-6">
              <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/50">Selected user</p>
                  <h2 className="text-2xl font-semibold text-white">{selectedUser.name}</h2>
                  <p className="text-sm text-white/60">{selectedUser.phone || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">
                    ID: {selectedUser.id}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                      selectedUser.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-red-500/15 text-red-300'
                    }`}
                  >
                    {selectedUser.status}
                  </span>
                </div>
              </header>

              <dl className="grid gap-4 sm:grid-cols-2">
                {isEditingBalance ? (
                  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
                    <p className="text-[11px] uppercase tracking-wide text-white/40 mb-2">Wallet balance</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        step="0.01"
                        min="0"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                        placeholder="Enter balance"
                        disabled={isUpdatingBalance}
                      />
                      <button
                        onClick={handleSaveBalance}
                        disabled={isUpdatingBalance}
                        className="rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdatingBalance ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEditBalance}
                        disabled={isUpdatingBalance}
                        className="rounded-lg bg-white/5 px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-white/50">{selectedUser.currency}</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 group relative">
                    <p className="text-[11px] uppercase tracking-wide text-white/40">Wallet balance</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-lg font-semibold text-white">
                        {formatCurrency(selectedUser.balance)} {selectedUser.currency}
                      </p>
                      <button
                        onClick={handleStartEditBalance}
                        className="opacity-100 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/60 hover:bg-white/10 hover:text-white/80"
                        title="Edit balance"
                      >
                        <Icon icon="solar:pen-bold" className="text-sm" />
                      </button>
                    </div>
                  </div>
                )}
                <InfoCell label="Total deposits" value={`${formatCurrency(selectedUser.stats.totalDeposits)} ${selectedUser.currency}`} />
                <InfoCell label="Total withdrawals" value={`${formatCurrency(selectedUser.stats.totalWithdrawals)} ${selectedUser.currency}`} />
                <InfoCell label="Joined" value={new Date(selectedUser.createdAt).toLocaleString('en-IN')} />
              </dl>

              <div className="grid gap-3 sm:grid-cols-3">
                <ActionButton icon="solar:documents-bold" label="View user details" onClick={() => handleNavigateToDetail(selectedUser.id)} />
                <ActionButton
                  icon={selectedUser.status === 'ACTIVE' ? 'solar:forbidden-bold' : 'solar:check-circle-bold'}
                  label={selectedUser.status === 'ACTIVE' ? 'Freeze user' : 'Unfreeze user'}
                  tone={selectedUser.status === 'ACTIVE' ? 'danger' : 'success'}
                  onClick={() => handleToggleStatus(selectedUser)}
                />
                <ActionButton icon="solar:wallet-money-bold" label="View user transactions" onClick={openTransactionsModal} />
              </div>
            </div>
          ) : (
            <div className="text-center text-sm text-white/50">Select a user to view their summary.</div>
          )}
        </div>
      </div>

      {selectedUser && isTransactionsOpen && (
        <Dialog onClose={() => setIsTransactionsOpen(false)}>
          <div className="space-y-5">
            <header className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/40">Ledger activity</p>
              <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
              <p className="text-sm text-white/60">Recent touchpoints for this account.</p>
            </header>
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {isTransactionsLoading && (
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-sm text-white/60">
                  Loading transactions…
                </div>
              )}
              {!isTransactionsLoading && !transactions.length && (
                <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-sm text-white/60">
                  No transactions recorded.
                </div>
              )}
              {transactions.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{item.label}</span>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 text-sm">{item.amount}</p>
                  <p className="text-xs text-white/50">{item.createdAt}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setIsTransactionsOpen(false)}
              className="w-full rounded-full bg-white/10 py-3 text-sm text-white/80 hover:bg-white/20"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </section>
  )
}

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
    <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
)

const ActionButton = ({
  icon,
  label,
  tone = 'default',
  onClick,
}: {
  icon: string
  label: string
  tone?: 'default' | 'danger' | 'success'
  onClick?: () => void
}) => {
  const toneClasses =
    tone === 'danger'
      ? 'bg-red-500/10 text-red-300 border-red-500/30 hover:bg-red-500/20'
      : tone === 'success'
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
      : 'bg-white/5 text-white/80 border-white/10 hover:border-white/30'

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm font-medium transition-colors ${toneClasses}`}
    >
      <Icon icon={icon} className="text-lg" />
      {label}
    </button>
  )
}

const Dialog = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 py-10 backdrop-blur">
    <div className="relative w-full max-w-xl sm:max-w-2xl rounded-3xl border border-white/10 bg-[#0b1220] p-5 sm:p-7">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 text-white/50 transition hover:text-white"
        aria-label="Close"
      >
        <Icon icon="solar:close-circle-bold" className="text-2xl" />
      </button>
      {children}
    </div>
  </div>
)

const StatusPill = ({ status }: { status: string }) => {
  const palette =
    ['VERIFIED', 'PAID', 'COMPLETED', 'SENT'].includes(status)
      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
      : status === 'FAILED'
      ? 'bg-red-500/10 text-red-300 border-red-500/30'
      : 'bg-amber-500/10 text-amber-300 border-amber-500/30'

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${palette}`}>
      {status}
    </span>
  )
}

export default UsersPage
