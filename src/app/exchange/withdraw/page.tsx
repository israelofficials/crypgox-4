'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { formatCurrency } from '@/utils/formatters'
import apiClient from '@/lib/api'
import type { UserWallet } from '@/types/user'

const WITHDRAWAL_FEE_USDT = 1

export default function WithdrawPage() {
  useProtectedRoute()
  const router = useRouter()
  const { user, isLoading, isAuthenticated, refreshProfile } = useAuth()
  const [amount, setAmount] = useState('')
  const [wallets, setWallets] = useState<UserWallet[]>(user?.wallets ?? [])
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null)

  useEffect(() => {
    setWallets(user?.wallets ?? [])
  }, [user?.wallets])

  useEffect(() => {
    if (!wallets.length) {
      setSelectedWalletId(null)
      return
    }

    setSelectedWalletId((prev) => {
      if (prev && wallets.find((wallet) => wallet.id === prev)) {
        return prev
      }
      return wallets[0].id
    })
  }, [wallets])

  const availableBalanceNumber = useMemo(() => Number(user?.balance ?? 0), [user?.balance])
  const availableBalance = useMemo(() => formatCurrency(availableBalanceNumber), [availableBalanceNumber])

  const parsedAmount = useMemo(() => {
    const numeric = Number(amount)
    return Number.isFinite(numeric) ? numeric : 0
  }, [amount])

  const totalDebit = useMemo(() => {
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return 0
    return parsedAmount + WITHDRAWAL_FEE_USDT
  }, [parsedAmount])

  const insufficientBalance = totalDebit > availableBalanceNumber

  const isSubmitDisabled =
    !parsedAmount ||
    parsedAmount <= 0 ||
    insufficientBalance ||
    !selectedWalletId ||
    isSubmitting

  const handleDeleteWallet = useCallback(
    async (walletId: string) => {
      if (deletingWalletId) return
      const target = wallets.find((wallet) => wallet.id === walletId)
      if (!target) return

      const confirmation = window.confirm(
        `Remove wallet ${target.address.slice(0, 8)}…${target.address.slice(-4)}?`
      )
      if (!confirmation) return

      setDeletingWalletId(walletId)
      setError(null)
      try {
        await apiClient.delete(`/user/wallets/${walletId}`)
        const refreshed = await refreshProfile().catch(() => null)
        if (refreshed?.wallets) {
          setWallets(refreshed.wallets)
        } else {
          setWallets((prev) => prev.filter((wallet) => wallet.id !== walletId))
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to delete wallet address'
        setError(message)
      } finally {
        setDeletingWalletId(null)
      }
    },
    [deletingWalletId, wallets, refreshProfile]
  )

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled || !selectedWalletId) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data } = await apiClient.post<{ withdrawal: { id: string } }>('/user/withdrawals', {
        amount: parsedAmount,
        walletId: selectedWalletId,
      })

      await refreshProfile().catch(() => null)
      router.replace(`/exchange/withdraw/pending?withdrawalId=${data.withdrawal.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to submit withdrawal request'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitDisabled, parsedAmount, refreshProfile, router, selectedWalletId])

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Preparing withdrawal" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">

        {/* HEADER */}
        <header className="px-5 py-4 flex items-center justify-between">
          <Icon
            icon="solar:alt-arrow-left-bold"
            className="text-2xl cursor-pointer"
            onClick={() => router.back()}
          />
          <p className="font-semibold text-lg">Withdraw USDT</p>
          <Icon
            icon="solar:clock-circle-bold"
            className="text-xl text-white/70 cursor-pointer"
            onClick={() => router.push('/me/statements')}
          />
        </header>

        <div className="px-4 space-y-5">

          {/* ADDRESS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Withdraw to</p>
              <Link href="/exchange/withdraw/bind" className="text-xs text-primary flex items-center gap-1">
                <Icon icon="solar:add-circle-bold" className="text-base" />
                Add wallet
              </Link>
            </div>

            {wallets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-400 bg-emerald-500/5 px-4 py-5 text-sm text-emerald-200">
                No wallet linked yet. Add a withdrawal wallet before submitting.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {wallets.map((wallet) => {
                  const isActive = wallet.id === selectedWalletId
                  return (
                    <button
                      key={wallet.id}
                      type="button"
                      onClick={() => setSelectedWalletId(wallet.id)}
                      className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-100'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-emerald-300/50'
                      }`}
                    >
                      <span className="flex items-center justify-between text-xs uppercase tracking-wide">
                        <span>{wallet.network}</span>
                        <span className="flex items-center gap-2 text-white/40">
                          {new Date(wallet.updatedAt).toLocaleDateString()}
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Remove wallet ${wallet.label || wallet.address}`}
                            className={`rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/60 transition ${
                              deletingWalletId === wallet.id
                                ? 'cursor-wait'
                                : 'hover:bg-red-500/20 hover:text-red-200 cursor-pointer'
                            }`}
                            onClick={(event) => {
                              event.stopPropagation()
                              if (deletingWalletId === wallet.id) return
                              handleDeleteWallet(wallet.id)
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                event.stopPropagation()
                                if (deletingWalletId === wallet.id) return
                                handleDeleteWallet(wallet.id)
                              }
                            }}
                          >
                            {deletingWalletId === wallet.id ? 'Removing…' : 'Remove'}
                          </span>
                        </span>
                      </span>
                      <p className="mt-1 font-semibold break-all text-sm text-white/90">{wallet.address}</p>
                      {wallet.label && <p className="text-xs text-white/50 mt-1">{wallet.label}</p>}
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {/* AMOUNT */}
          <div>
            <p className="text-sm mb-1">Withdraw amount</p>
            <div className="flex items-center gap-2 border-b border-white/20 py-2">
              <input
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="Please enter the amount"
                className="bg-transparent outline-none flex-1 text-lg"
              />
              <Image src="/money.png" alt="usdt" width={20} height={20} />
              <span className="font-semibold">USDT</span>
            </div>

            <div className="flex justify-between text-xs mt-2">
              <span className="text-blue-400 flex items-center gap-1">
                <Image src="/money.png" alt="usdt" width={14} height={14} />
                {availableBalance}
              </span>
              <span className="text-white/60">Platform fee: {formatCurrency(WITHDRAWAL_FEE_USDT)} USDT</span>
            </div>

            {parsedAmount > 0 && (
              <div className="mt-3 space-y-1 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                <div className="flex items-center justify-between">
                  <span>Withdraw amount</span>
                  <span className="font-semibold text-white">{formatCurrency(parsedAmount)} USDT</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Fee</span>
                  <span className="font-semibold text-white/70">{formatCurrency(WITHDRAWAL_FEE_USDT)} USDT</span>
                </div>
                <hr className="border-white/10" />
                <div className="flex items-center justify-between">
                  <span>Total to be debited</span>
                  <span className="font-semibold text-emerald-300">{formatCurrency(totalDebit)} USDT</span>
                </div>
                <p className="text-[11px] text-white/50">
                  You will receive {formatCurrency(parsedAmount)} USDT in your wallet once the withdrawal completes.
                </p>
              </div>
            )}

            {insufficientBalance && amount && (
              <p className="mt-2 text-xs text-red-400 font-medium">
                Insufficient balance. Enter an amount so total debit stays within {availableBalance} USDT.
              </p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {/* CONFIRM */}
          <button
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-full font-semibold transition ${
              isSubmitDisabled
                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-emerald-400 text-black hover:scale-[1.01]'
            }`}
          >
            {isSubmitting ? 'Submitting…' : 'Confirm'}
          </button>

        </div>

        <PageBottomBar active="Exchange" />
      </div>
    </main>
  )
}
