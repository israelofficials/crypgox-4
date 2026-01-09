'use client'

import { useCallback, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { formatCurrency, formatPhone } from '@/utils/formatters'
import QRCode from 'react-qr-code'

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex-1">
    <p className="text-xs text-white/50">{label}</p>
    <p className="mt-1 text-lg font-semibold">{value}</p>
  </div>
)

export default function ReferralPage() {
  useProtectedRoute()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, redeemReferralRewards } = useAuth()

  const inviteSummary = user?.invites
  const referrals = inviteSummary?.list ?? []

  const [isRedeeming, setIsRedeeming] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)

  const inviteCode = inviteSummary?.code ?? null
  const inviteLink = useMemo(() => {
    if (!inviteCode) return null
    const params = new URLSearchParams({ ref: inviteCode })
    // Use current domain dynamically - works for any domain
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/login?${params.toString()}`
    }
    // Fallback for SSR (server-side rendering)
    return `${process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'https://crypgox.com'}/login?${params.toString()}`
  }, [inviteCode])

  const stats = useMemo(() => {
    const totalReward = inviteSummary?.totalReward ?? referrals.reduce((sum, invite) => sum + invite.reward, 0)
    const redeemedReward = inviteSummary?.redeemedReward ?? referrals.reduce((sum, invite) => sum + (invite.rewardRedeemed ?? 0), 0)
    const availableReward = inviteSummary?.availableReward ?? Math.max(0, totalReward - redeemedReward)
    const active = inviteSummary?.completed ?? referrals.filter(invite => invite.status === 'COMPLETED').length
    const invited = inviteSummary?.total ?? referrals.length
    const pending = inviteSummary?.pending ?? referrals.filter(invite => invite.status !== 'COMPLETED').length
    const payoutThreshold = inviteSummary?.payoutThreshold ?? 100
    const eligibleForPayout = inviteSummary?.eligibleForPayout ?? availableReward >= payoutThreshold

    return {
      totalReward,
      redeemedReward,
      availableReward,
      invited,
      active,
      pending,
      payoutThreshold,
      eligibleForPayout,
    }
  }, [inviteSummary, referrals])

  const handleRedeem = useCallback(async () => {
    if (!stats.availableReward || stats.availableReward < stats.payoutThreshold || isRedeeming) {
      setStatusMessage({ type: 'error', text: `Minimum redeemable referral balance is ${stats.payoutThreshold.toLocaleString('en-IN')} USDT.` })
      return
    }

    setIsRedeeming(true)
    setStatusMessage(null)
    try {
      const result = await redeemReferralRewards()
      setStatusMessage({
        type: 'success',
        text: `${formatCurrency(result.amount)} USDT moved to your balance!`,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to redeem referral rewards right now.'
      setStatusMessage({ type: 'error', text: message })
    } finally {
      setIsRedeeming(false)
    }
  }, [isRedeeming, redeemReferralRewards, stats.availableReward, stats.payoutThreshold])

  const handleCopy = useCallback(async (text: string, type: 'code' | 'link') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 1500)
  }, [])

  const handleShare = useCallback(async () => {
    if (!inviteLink) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on crypgox',
          text: 'Use my referral code to sign up and start earning together.',
          url: inviteLink,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setStatusMessage({ type: 'error', text: 'Could not open share sheet.' })
      }
    } else {
      handleCopy(inviteLink, 'link')
    }
  }, [handleCopy, inviteLink])

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Loading referrals" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">

        {/* HEADER */}
        <header className="px-5 py-4 flex items-center gap-3">
          <button onClick={() => router.back()}>
            <Icon icon="solar:alt-arrow-left-bold" className="text-2xl" />
          </button>
          <p className="font-semibold text-lg">Referrals</p>
        </header>

        <div className="px-4 space-y-5">

          {/* SUMMARY */}
          <div className="space-y-4 rounded-xl bg-primary/10 ring-1 ring-primary/20 p-4 text-center">
            <div>
              <p className="text-sm text-white/70">Available to claim</p>
              <p className="text-2xl font-semibold text-emerald-400">
                {formatCurrency(stats.availableReward)} USDT
              </p>
              <p className="text-xs text-white/50 mt-1">
                Unlock at {stats.payoutThreshold.toLocaleString('en-IN')} USDT · {stats.eligibleForPayout ? 'Eligible' : 'Keep inviting'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-white/50 uppercase tracking-wide">Earned</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(stats.totalReward)} USDT
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-white/50 uppercase tracking-wide">Redeemed</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(stats.redeemedReward)} USDT
                </p>
              </div>
            </div>
            {stats.eligibleForPayout ? (
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
                Threshold reached! You can move rewards to your balance once the payout feature is enabled.
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                Earn {formatCurrency(Math.max(0, stats.payoutThreshold - stats.availableReward))} USDT more to unlock balance transfers.
              </div>
            )}
            <p className="text-xs text-white/50 mt-1">
              Invite code: <span className="font-semibold text-white/80 tracking-widest uppercase">{inviteSummary?.code ?? '—'}</span>
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-white/20 ${
                  stats.eligibleForPayout && stats.availableReward > 0
                    ? 'bg-emerald-400 text-black hover:bg-emerald-300'
                    : 'bg-white/10 text-white/40 cursor-not-allowed'
                }`}
                disabled={!stats.eligibleForPayout || stats.availableReward <= 0 || isRedeeming}
                onClick={handleRedeem}
              >
                {isRedeeming ? 'Adding to balance…' : 'Add rewards to wallet balance'}
              </button>
              <button
                className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary/40"
                onClick={() => setDrawerOpen(true)}
              >
                Invite a friend
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Invited" value={stats.invited} />
            <Stat label="Active" value={stats.active} />
            <Stat label="Pending" value={stats.pending} />
          </div>

          {/* LIST */}
          <div className="space-y-3">
            {referrals.length ? (
              referrals.map(referral => (
                <div
                  key={referral.id}
                  className="rounded-xl bg-[#0e1628] p-4 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {referral.inviteePhone ? formatPhone(referral.inviteePhone) : 'Pending invitee'}
                    </p>
                    <p className="text-xs text-white/60 capitalize">
                      {referral.status.toLowerCase()} · {new Date(referral.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-400">
                      +{formatCurrency(referral.reward)} {user?.currency ?? 'USDT'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-[#0e1628] p-4 text-sm text-white/60">
                No invites yet. Share your code to start earning rewards.
              </div>
            )}
          </div>

          {statusMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-400/20'
                  : 'bg-red-500/10 text-red-200 border border-red-400/20'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

        </div>

        <PageBottomBar active="Me" />
      </div>
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="bg-[#0b1220] border-t border-white/10 rounded-t-3xl p-5 space-y-5 animate-[slide-up_0.3s_ease]
          shadow-[0_-24px_48px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/50">Share your invite</p>
                <p className="text-lg font-semibold">Earn with friends</p>
              </div>
              <button className="text-white/60 hover:text-white" onClick={() => setDrawerOpen(false)}>
                <Icon icon="solar:close-circle-bold" className="text-2xl" />
              </button>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-3 rounded-2xl">
                <QRCode value={inviteLink ?? (typeof window !== 'undefined' ? window.location.origin : 'https://crypgox.com')} size={140} />
              </div>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-xs text-white/50">Invite code</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-lg font-semibold tracking-widest uppercase">{inviteCode ?? 'Unavailable'}</span>
                  {inviteCode && (
                    <button
                      className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                      onClick={() => handleCopy(inviteCode, 'code')}
                    >
                      <Icon icon="solar:copy-bold" />
                      {copied === 'code' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3 space-y-2">
                <p className="text-xs text-white/50">Invite link</p>
                <p className="text-sm text-white/80 break-all">{inviteLink ?? 'Create your first invite to unlock sharing'}</p>
                {inviteLink && (
                  <div className="flex gap-3">
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary/80 px-3 py-2 text-xs font-semibold text-black transition hover:bg-primary"
                      onClick={handleShare}
                    >
                      <Icon icon="solar:share-bold" />
                      Share
                    </button>
                    <button
                      className="flex items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10"
                      onClick={() => handleCopy(inviteLink, 'link')}
                    >
                      <Icon icon="solar:copy-bold" />
                      {copied === 'link' ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
