'use client'

import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAdminAuth, AdminUser } from '@/contexts/AdminAuthContext'
import { formatCurrency } from '@/utils/formatters'

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

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { fetchUserDetail } = useAdminAuth()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    let active = true
    setIsLoading(true)
    setError(null)

    fetchUserDetail(id)
      .then((data) => {
        if (!active) return
        setUser(data)
      })
      .catch((err) => {
        if (!active) return
        setUser(null)
        const message = err?.message || 'Failed to load user details'
        setError(message)
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, fetchUserDetail])

  const status = useMemo(() => {
    if (!user) return null
    const override = searchParams.get('status')
    if (!override) return user.status
    const normalized = override.toUpperCase()
    if (['ACTIVE', 'BLOCKED', 'FROZEN'].includes(normalized)) {
      return normalized as AdminUser['status']
    }
    return user.status
  }, [user, searchParams])

  const statusToneClasses = useMemo(() => {
    if (!status) return 'bg-white/10 text-white/70 border-white/10'
    if (status === 'ACTIVE') {
      return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
    }
    if (status === 'BLOCKED') {
      return 'bg-red-500/10 text-red-300 border border-red-500/30'
    }
    return 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
  }, [status])

  const statusIndicatorTone = useMemo(() => {
    if (!status) return 'bg-white/40'
    if (status === 'ACTIVE') return 'bg-emerald-300'
    if (status === 'BLOCKED') return 'bg-red-300'
    return 'bg-amber-300'
  }, [status])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
        <div className="w-full max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center space-y-3">
            <Icon icon="solar:radar-2-bold" className="mx-auto text-4xl text-white/50 animate-spin" />
            <p className="text-lg font-semibold">Loading user details…</p>
            <p className="text-sm text-white/60">Please wait while we fetch the latest account information.</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !user) {
    return (
      <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
        <div className="w-full max-w-3xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center space-y-3">
            <Icon icon="solar:ghost-bold" className="mx-auto text-4xl text-white/50" />
            <p className="text-lg font-semibold">{error ? 'Unable to load user' : 'User not found'}</p>
            <p className="text-sm text-white/60">
              {error || 'The requested account could not be located.'}
            </p>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 rounded-full bg-white/10 px-5 py-3 text-sm text-white/80 hover:bg-white/20"
            >
              Back to users
            </button>
          </div>
        </div>
      </main>
    )
  }

  const displayPhone = user.phone || '—'
  const inviteCode = user.inviteCode || '—'
  const currency = user.currency || 'USDT'

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-4xl px-4 pb-24 pt-10 sm:px-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
        >
          <Icon icon="solar:alt-arrow-left-bold" className="text-lg" />
          Back to users
        </button>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 space-y-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">User detail</p>
              <h1 className="text-3xl font-semibold">{user.name || displayPhone}</h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <Icon icon="solar:phone-call-bold" className="text-emerald-300" />
                  {displayPhone}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
                  <Icon icon="solar:clock-circle-bold" className="text-white/50" />
                  Joined {formatDateTime(user.createdAt)}
                </span>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide ${statusToneClasses}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusIndicatorTone}`} />
              {status?.toLowerCase() || 'unknown'}
            </span>
          </header>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailStat label="Full name" value={user.name || '—'} />
            <DetailStat label="Phone number" value={displayPhone} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <DetailStat label="Wallet balance" value={`${formatCurrency(user.balance)} ${currency}`} />
            <DetailStat label="Total deposits" value={`${formatCurrency(user.stats.totalDeposits)} ${currency}`} />
            <DetailStat label="Total withdrawals" value={`${formatCurrency(user.stats.totalWithdrawals)} ${currency}`} />
            <DetailStat label="Last login" value={formatDateTime(user.lastLoginAt)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailStat label="User ID" value={user.id} subtle />
            <DetailStat label="Invite code" value={inviteCode} subtle />
            <DetailStat label="Created" value={formatDateTime(user.createdAt)} subtle />
            <DetailStat label="Updated" value={formatDateTime(user.updatedAt)} subtle />
          </div>
        </section>

      
      </div>
    </main>
  )
}
const DetailStat = ({ label, value, subtle = false }: { label: string; value: string; subtle?: boolean }) => (
  <div className={`rounded-2xl border border-white/10 px-5 py-4 ${subtle ? 'bg-[#0b1220]' : 'bg-white/5'}`}>
    <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
    <p className="mt-2 text-lg font-semibold text-white">{value}</p>
  </div>
)
