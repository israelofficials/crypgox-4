'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import useProtectedRoute from '@/hooks/useProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/api'

export default function BindWalletPage() {
  useProtectedRoute()

  const router = useRouter()
  const { refreshProfile, user } = useAuth()
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const hasWallets = useMemo(() => (user?.wallets?.length ?? 0) > 0, [user?.wallets?.length])

  const handleSubmit = useCallback(async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address')
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.post('/user/wallets', {
        address: address.trim(),
        network: 'TRC20',
        label: label.trim() || undefined,
      })

      setSuccess('Wallet bound successfully')
      await refreshProfile().catch(() => null)
      setTimeout(() => {
        router.back()
      }, 600)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bind wallet address'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [address, label, refreshProfile, router])

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen bg-[#0b1220] pb-16">

        <header className="px-5 py-4 flex items-center gap-3 border-b border-white/10">
          <button onClick={() => router.back()} aria-label="Go back" className="text-white/80 hover:text-white">
            <Icon icon="solar:alt-arrow-left-bold" className="text-2xl" />
          </button>
          <p className="font-semibold text-lg">Bind wallet address</p>
        </header>

        <div className="px-4 py-5 space-y-5">
          <section className="space-y-3">
            <div>
              <p className="text-sm text-white/70 mb-2">Network</p>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-400 text-emerald-200 w-fit">
                <Image src="/tron.svg" alt="TRC20" width={20} height={20} />
                <span className="font-semibold text-sm">TRC20</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70" htmlFor="wallet-address">
                Wallet address
              </label>
              <input
                id="wallet-address"
                value={address}
                onChange={(event) => setAddress(event.target.value.trimStart())}
                placeholder="Enter your USDT wallet address"
                className="w-full rounded-xl border border-white/10 bg-[#0e1628] p-4 text-sm text-white outline-none focus:border-emerald-400"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/70" htmlFor="wallet-label">
                Label (optional)
              </label>
              <input
                id="wallet-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Add a friendly name to recognise this wallet"
                className="w-full rounded-xl border border-white/10 bg-[#0e1628] p-4 text-sm text-white outline-none focus:border-emerald-400"
                autoComplete="off"
              />
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">
              {success}
            </div>
          )}

          <button
            type="button"
            disabled={!address.trim() || isSubmitting}
            onClick={handleSubmit}
            className={`w-full py-4 rounded-full font-semibold transition ${
              address.trim() && !isSubmitting
                ? 'bg-gradient-to-r from-primary to-emerald-400 text-black hover:scale-[1.01]'
                : 'bg-white/20 text-white/50 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Linking wallet…' : 'Bind wallet'}
          </button>

          <p className="text-xs text-white/50">
            Ensure the address matches your personal custody wallet. Binding an incorrect address could result in
            irreversible loss of funds.
          </p>

          {hasWallets && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/60">
              You can manage your wallets from the withdrawal screen. Binding a new wallet will replace any matching
              address saved earlier.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
