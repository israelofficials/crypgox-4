'use client'

import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useAuth } from '@/contexts/AuthContext'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { formatCurrency, formatPhone } from '@/utils/formatters'

const maskPhone = (value: string) => {
  if (value.length <= 6) return value
  const country = value.slice(0, 4)
  const start = value.slice(4, 7)
  const end = value.slice(-4)
  return `${country} ${start}****${end}`
}

const MePage = () => {
  useProtectedRoute()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [isMasked, setIsMasked] = useState(true)

  const metrics = useMemo(
    () => [
      {
        label: `Wallet balance (${user?.currency ?? 'USDT'})`,
        value: user ? formatCurrency(user.balance) : '0.00',
      },
      {
        label: 'Total swap',
        value: user ? formatCurrency(user.stats?.totalDeposits ?? 0) : '0.00',
      },
      {
        label: 'Total withdraw',
        value: user ? formatCurrency(user.stats?.totalWithdrawals ?? 0) : '0.00',
      },
    ],
    [user]
  )

  const statements = useMemo(() => user?.statements ?? [], [user?.statements])
  const latestStatement = statements[0]
  const inviteSummary = user?.invites
  const inviteRewardTotal = useMemo(
    () => inviteSummary?.list.reduce((total, entry) => total + entry.reward, 0) ?? 0,
    [inviteSummary?.list]
  )
  const totalWithdrawals = user?.stats?.totalWithdrawals ?? 0

  const actions = useMemo(
    () => [
      {
        label: 'Referrals',
        icon: 'solar:users-group-rounded-bold',
        href: '/me/referrals',
        description: inviteSummary
          ? `${inviteSummary.completed} completed · ${inviteSummary.pending} pending`
          : 'Track your network growth',
      },
      {
        label: 'Exchange history',
        icon: 'solar:clock-circle-bold',
        href: '/exchange/sell?view=history',
        description: latestStatement
          ? `${latestStatement.type.replaceAll('_', ' ')} • ${formatCurrency(latestStatement.amount)}`
          : 'No exchange history yet',
      },
      {
        label: 'Statement',
        icon: 'solar:document-text-bold',
        href: '/me/statements',
        description: `${statements.length} entries on file`,
      },
      {
        label: 'Bank account',
        icon: 'solar:wallet-bold',
        href: '/exchange/sell?view=bank',
        description: `${formatCurrency(totalWithdrawals)} withdrawn`,
      },
      {
        label: 'Invite friends',
        icon: 'solar:gift-bold',
        href: '/exchange/invite',
        description: inviteSummary ? `Code ${inviteSummary.code} · ${formatCurrency(inviteRewardTotal)} rewards` : 'Share your invite code',
      },
    ],
    [inviteSummary, inviteRewardTotal, latestStatement, statements, totalWithdrawals]
  )

  const unmaskedPhone = user?.phone ? `+91 ${user.phone}` : '—'
  const formattedPhone = user?.phone ? `+91 ${formatPhone(user.phone)}` : '—'

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Loading your profile" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div
        className="
          relative w-full max-w-[420px] min-h-screen pb-32
          bg-[#0b1220]
          shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.85)]
        "
      >

        {/* HEADER WITH ICONS */}
        <header className="flex items-center justify-end px-5 pt-5">
          <div className="flex items-center gap-4">
            <Link href="/support" className="rounded-full bg-white/5 p-2">
              <Image src="/support.png" alt="Support" width={20} height={20} />
            </Link>

            <Link
              href="me/settings"
              className="rounded-full bg-white/5 p-2 text-white/70 transition hover:text-primary hover:bg-white/10"
            >
              <Icon icon="solar:settings-bold-duotone" className="text-xl" />
              <span className="sr-only">Settings</span>
            </Link>
          </div>
        </header>

        {/* PROFILE + STATS */}
        <section
          className="
            mt-2 px-4 pt-6 pb-7
            bg-gradient-to-b from-white/5 to-transparent
          "
        >
          <div className="text-center space-y-3">
            <div
              className="
                mx-auto relative h-20 w-20 rounded-full
                bg-primary/20 ring-2 ring-primary/30
                shadow-[0_0_24px_rgba(34,197,94,0.25)]
              "
            >
              <Image
                src="/images/3d1.webp"
                alt="avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => setIsMasked(previous => !previous)}
                className="text-xl font-semibold transition hover:text-primary"
              >
                {isMasked ? formattedPhone : unmaskedPhone}
              </button>
              <p className="text-sm text-white/50">{user?.name || 'Account holder'}</p>
              {inviteSummary && (
                <p className="mt-1 text-xs text-primary">
                  Invite code: <span className="font-semibold tracking-widest uppercase">{inviteSummary.code}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-7 flex justify-between text-center">
            {metrics.map(stat => (
              <div key={stat.label} className="flex-1">
                <p className="text-xs text-white/50">{stat.label}</p>
                <p className="mt-1.5 text-lg font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION LIST */}
        <nav className="mt-4 px-4">
          <ul className="divide-y divide-white/10">
            {actions.map(action => (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className="flex items-center justify-between py-5 text-base"
                >
                  <span className="flex items-center gap-4">
                    <Icon icon={action.icon} className="text-2xl text-primary" />
                    <span className="text-left">
                      <span className="block">{action.label}</span>
                      <span className="block text-xs text-white/50">{action.description}</span>
                    </span>
                  </span>
                  <Icon icon="solar:alt-arrow-right-bold" className="text-xl text-white/40" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* BOTTOM BAR */}
        <PageBottomBar active="Me" />
      </div>
    </main>
  )
}

export default MePage
