'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { formatCurrency, formatPhone } from '@/utils/formatters'
import apiClient from '@/lib/api'

export default function DepositPage() {
  useProtectedRoute()
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableBalance = useMemo(() => (user ? formatCurrency(user.balance) : '0.00'), [user])
  const maskedPhone = useMemo(() => (user ? formatPhone(user.phone) : ''), [user])
  const activeDeposit = useMemo(
    () => user?.deposits.find((deposit) => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(deposit.status)),
    [user?.deposits]
  )

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Preparing deposit" />
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
          <div className="text-center">
            <p className="font-semibold text-lg">USDT Deposit</p>
            <p className="text-xs text-white/50">{maskedPhone}</p>
          </div>
          <Icon
            icon="solar:clock-circle-bold"
            className="text-xl text-white/70 cursor-pointer"
            onClick={() => router.push('/me/statements')}
          />
        </header>

        <div className="px-4 space-y-5">

          {activeDeposit && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
              <p className="font-semibold text-amber-100 mb-1">Active deposit in progress</p>
              <p className="mb-2">
                You already have an active deposit order. Complete or cancel it before starting a new one.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-black"
                onClick={() => router.push(`/exchange/deposit/order?depositId=${activeDeposit.id}`)}
              >
                View deposit #{activeDeposit.id.slice(0, 6).toUpperCase()}
              </button>
            </div>
          )}

          {/* NETWORK */}
          <div>
            <p className="text-sm text-white/70 mb-2">Network</p>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-400/20 ring-1 ring-yellow-400 w-fit">
              <Image src="/tron.svg" alt="TRC20" width={18} height={18} />
              <span className="font-semibold">TRC20</span>
            </div>
          </div>

          {/* AMOUNT */}
          <div>
            <p className="text-sm mb-1">Amount</p>
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

            <p className="text-xs text-white/60 mt-2">Available($) 0</p>
            <p className="text-xs text-white/40 mt-1">Wallet balance: ${availableBalance}</p>
          </div>

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          {/* BUTTON */}
          <button
            type="button"
            disabled={isSubmitting || !amount || Boolean(activeDeposit)}
            onClick={async () => {
              if (!amount || activeDeposit) {
                if (activeDeposit) {
                  router.push(`/exchange/deposit/order?depositId=${activeDeposit.id}`)
                }
                return
              }
              const numericAmount = Number(amount)
              if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                setError('Enter a valid deposit amount')
                return
              }

              setIsSubmitting(true)
              setError(null)
              try {
                const { data } = await apiClient.post<{ deposit: { id: string } }>('/user/deposits', {
                  amount: numericAmount,
                  network: 'TRC20',
                })
                router.push(`/exchange/deposit/order?depositId=${data.deposit.id}`)
              } catch (err) {
                const message = err instanceof Error ? err.message : 'Unable to create deposit order'
                setError(message)
              } finally {
                setIsSubmitting(false)
              }
            }}
            className={`w-full py-4 rounded-full text-black font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.01] ${
              amount && !isSubmitting && !activeDeposit
                ? 'bg-gradient-to-r from-primary to-emerald-400'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {activeDeposit
              ? 'Complete existing deposit'
              : isSubmitting
              ? 'Creating order…'
              : 'Deposit'}
          </button>

          {/* WARNING */}
          <div className="rounded-xl bg-yellow-500/10 p-3 flex gap-2 text-sm">
            <Icon icon="solar:danger-triangle-bold" className="text-yellow-400 text-lg" />
            <p className="text-white/80">
              For the safety of your funds, the recharge address for each order is different.
              Please double-check carefully.
            </p>
          </div>

        </div>

        <PageBottomBar active="Exchange" />
      </div>
    </main>
  )
}
