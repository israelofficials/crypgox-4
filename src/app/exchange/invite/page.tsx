'use client'

import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { useAuth } from '@/contexts/AuthContext'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import LoadingOverlay from '@/components/shared/LoadingOverlay'

const buildInviteLink = (code: string | null) => {
  if (!code) return null
  const params = new URLSearchParams({ ref: code })
  // Use current domain dynamically - works for any domain
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/login?${params.toString()}`
  }
  // Fallback for SSR (server-side rendering)
  return `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://crypgox.com'}/login?${params.toString()}`
}

export default function InvitePage() {
  useProtectedRoute()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, settings } = useAuth()
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const inviteCode = user?.invites?.code ?? null
  const inviteLink = useMemo(() => buildInviteLink(inviteCode), [inviteCode])
  const inviteCommission = useMemo(() => {
    const commission = Number(settings?.inviteCommission ?? 0)
    return commission > 0 ? commission : 0
  }, [settings?.inviteCommission])

  const copy = async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Loading referral tools" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">

        {/* HEADER */}
        <header className="px-5 py-4 flex items-center justify-between">
          <button onClick={() => router.back()}>
            <Icon icon="solar:alt-arrow-left-bold" className="text-2xl" />
          </button>
          <p className="font-semibold text-lg">Invite</p>
          <div />
        </header>

        <div className="px-4 space-y-6">

          {/* TITLE */}
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold">
              Invite friends and make money together
            </p>
            <p className="text-sm text-white/60">
              Each accepted order of your referrals unlocks shared rewards.
            </p>
          </div>

          {/* EXTRA REWARD INFO */}
          <div className="rounded-xl bg-primary/10 ring-1 ring-primary/20 p-3 text-center">
            <p className="text-sm text-white/80">
              Rewards earned so far
            </p>
            <p className="text-lg font-semibold text-emerald-400">
              {user?.invites ? `${user.invites.completed} completed · ${user.invites.pending} pending` : 'Start inviting to earn'}
            </p>
            {inviteCommission > 0 && (
              <p className="mt-1 text-xs text-white/60">
                Current commission: <span className="font-semibold text-primary">{inviteCommission.toFixed(2)}%</span>
              </p>
            )}
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-3">
            <div className="bg-white p-3 rounded-xl">
              <QRCode value={inviteLink ?? (typeof window !== 'undefined' ? window.location.origin : 'https://crypgox.com')} size={160} />
            </div>
            <p className="text-xs text-white/60 text-center">
              Ask your friends to scan or use the link below to sign up.
            </p>
          </div>

          {/* INVITE CODE */}
          <div className="rounded-xl bg-[#0e1628] p-4 space-y-1">
            <p className="text-xs text-white/60">Invite code</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold tracking-wider">
                {inviteCode ?? 'Unavailable'}
              </span>
              {inviteCode && (
                <button
                  onClick={() => copy(inviteCode, 'code')}
                  className="flex items-center gap-1 text-primary"
                >
                  <Icon icon="solar:copy-bold" />
                  {copied === 'code' ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* INVITE LINK */}
          <div className="rounded-xl bg-[#0e1628] p-4 space-y-1">
            <p className="text-xs text-white/60">Invite link</p>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm break-all text-white/80">
                {inviteLink ?? 'Tell your friends to sign up from crypgox app'}
              </span>
              {inviteLink && (
                <button
                  onClick={() => copy(inviteLink, 'link')}
                  className="flex items-center gap-1 text-primary shrink-0"
                >
                  <Icon icon="solar:copy-bold" />
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

        </div>

        <PageBottomBar active="Me" />
      </div>
    </main>
  )
}
