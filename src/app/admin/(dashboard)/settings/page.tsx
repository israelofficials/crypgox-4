'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

type TierDraft = {
  range: string
  markup: string
}

export default function AdminSettingsPage() {
  const {
    settings,
    fetchSettings,
    updateSettings,
    isSettingsLoading,
    error,
    clearError,
  } = useAdminAuth()

  const [baseRateInput, setBaseRateInput] = useState('')
  const [tierDrafts, setTierDrafts] = useState<TierDraft[]>([])
  const [depositAddressesDraft, setDepositAddressesDraft] = useState<string[]>([])
  const [inviteCommissionInput, setInviteCommissionInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!settings && !isSettingsLoading) {
      fetchSettings().catch(() => null)
    }
  }, [settings, isSettingsLoading, fetchSettings])

  useEffect(() => {
    if (!settings) return
    setBaseRateInput(settings.baseRate.toString())
    setTierDrafts(settings.pricingTiers.length ? settings.pricingTiers : [])
    setDepositAddressesDraft(settings.depositAddresses.length ? settings.depositAddresses : [''])
    setInviteCommissionInput(settings.inviteCommission.toString())
  }, [settings])

  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [message])

  const resetDrafts = () => {
    if (!settings) return
    setBaseRateInput(settings.baseRate.toString())
    setTierDrafts(settings.pricingTiers.length ? settings.pricingTiers : [])
    setDepositAddressesDraft(settings.depositAddresses.length ? settings.depositAddresses : [''])
    setInviteCommissionInput(settings.inviteCommission.toString())
    clearError()
  }

  const addNewTier = () => {
    setTierDrafts(prev => [...prev, { range: '', markup: '' }])
  }

  const removeTier = (index: number) => {
    setTierDrafts(prev => prev.filter((_, idx) => idx !== index))
  }

  const addDepositAddress = () => {
    setDepositAddressesDraft(prev => [...prev, ''])
  }

  const removeDepositAddress = (index: number) => {
    setDepositAddressesDraft(prev => prev.filter((_, idx) => idx !== index))
  }

  const parsedBaseRate = Number(baseRateInput)
  const parsedInviteCommission = Number(inviteCommissionInput)

  const isDirty = useMemo(() => {
    if (!settings) return false
    const tiersEqual = JSON.stringify(tierDrafts) === JSON.stringify(settings.pricingTiers)
    const addressesEqual = JSON.stringify(depositAddressesDraft) === JSON.stringify(settings.depositAddresses)
    return (
      parsedBaseRate !== settings.baseRate ||
      parsedInviteCommission !== settings.inviteCommission ||
      !tiersEqual ||
      !addressesEqual
    )
  }, [settings, parsedBaseRate, parsedInviteCommission, tierDrafts, depositAddressesDraft])

  const handleSave = async () => {
    if (!settings) return
    setIsSaving(true)
    setMessage(null)
    clearError()
    try {
      const sanitizedTiers = tierDrafts
        .filter(tier => tier.range.trim())
        .map(tier => ({ range: tier.range.trim(), markup: tier.markup.trim() }))
      const sanitizedAddresses = depositAddressesDraft
        .map(address => address.trim())
        .filter(Boolean)

      await updateSettings({
        baseRate: Number.isFinite(parsedBaseRate) ? parsedBaseRate : settings.baseRate,
        inviteCommission: Number.isFinite(parsedInviteCommission)
          ? parsedInviteCommission
          : settings.inviteCommission,
        pricingTiers: sanitizedTiers,
        depositAddresses: sanitizedAddresses,
      })

      setMessage('Settings updated successfully')
    } catch (err) {
      // error state handled by context
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-400">Controls</p>
        <h1 className="text-3xl font-semibold">Platform settings</h1>
        <p className="text-sm text-white/60">
          Configure base pricing, conversion spreads, and referral programs. Adjustments apply after ops approval.
        </p>
      </header>

      {(message || error) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          {message || error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-white/50">Exchange pricing</p>
            <h2 className="text-xl font-semibold text-white">USDT → INR base rate</h2>
            <p className="text-sm text-white/60">
              Set the anchor rate used across conversions. Tier markups are applied on top of this base.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[11px] uppercase tracking-wide text-white/40">Base rate (₹)</label>
              <input
                value={baseRateInput}
                onChange={e => setBaseRateInput(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                disabled={isSettingsLoading || isSaving}
                inputMode="decimal"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-white/40">Display currency ($)</label>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white">
                <span className="text-white/60">Pegged to USDT</span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">LIVE</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Exchange tiers</p>
              <div className="flex items-center gap-3 text-xs text-emerald-300">
                <button onClick={() => fetchSettings().catch(() => null)} disabled={isSettingsLoading || isSaving}>
                  Sync with DB
                </button>
                <button onClick={addNewTier} disabled={isSettingsLoading || isSaving}>
                  Add tier
                </button>
              </div>
            </div>

            {tierDrafts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-white/50">
                No tiers configured. Add a tier to define pricing markups.
              </div>
            )}

            <div className="grid gap-3">
              {tierDrafts.map((tier, idx) => (
                <div key={`tier-${idx}`} className="rounded-2xl border border-white/10 bg-[#0b1220] p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-wide text-white/40">Range</p>
                    <button
                      className="text-xs text-white/40 hover:text-white"
                      onClick={() => removeTier(idx)}
                      disabled={isSettingsLoading || isSaving}
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={tier.range}
                    onChange={e => {
                      const next = tierDrafts.slice()
                      next[idx] = { ...next[idx], range: e.target.value }
                      setTierDrafts(next)
                    }}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                    placeholder=">=1000.01 and <2000.01"
                    disabled={isSettingsLoading || isSaving}
                  />
                  <div>
                    <label className="text-xs uppercase tracking-wide text-white/40">Displayed price</label>
                    <input
                      value={tier.markup}
                      onChange={e => {
                        const next = tierDrafts.slice()
                        next[idx] = { ...next[idx], markup: e.target.value }
                        setTierDrafts(next)
                      }}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                      placeholder="99 + 0.50"
                      disabled={isSettingsLoading || isSaving}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-white/50">Funding</p>
            <h2 className="text-xl font-semibold text-white">Deposit address</h2>
            <p className="text-sm text-white/60">
              Update the hot wallet used for USDT recharge orders.
            </p>
          </header>

          <div className="space-y-4">
            {depositAddressesDraft.map((address, idx) => (
              <div key={`${idx}-${address.slice(0, 6)}`} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/40">
                  <span>Wallet {idx + 1}</span>
                  <button
                    onClick={() => removeDepositAddress(idx)}
                    className="text-xs text-white/40 hover:text-white"
                    disabled={isSettingsLoading || isSaving || depositAddressesDraft.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={address}
                  onChange={e => {
                    const next = depositAddressesDraft.slice()
                    next[idx] = e.target.value
                    setDepositAddressesDraft(next)
                  }}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1220] px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  disabled={isSettingsLoading || isSaving}
                />
              </div>
            ))}
            <button
              onClick={addDepositAddress}
              className="text-xs text-emerald-300"
              disabled={isSettingsLoading || isSaving}
            >
              Add address
            </button>
            <p className="text-xs text-white/50">Ensure address rotation is synced with custody provider.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0b1220] p-4">
            <header>
              <p className="text-xs uppercase tracking-wide text-white/40">Referral program</p>
              <h3 className="text-lg font-semibold text-white">Invite friend commission</h3>
              <p className="text-sm text-white/60">Define the flat payout per verified invite.</p>
            </header>
            <div>
              <label className="text-[11px] uppercase tracking-wide text-white/40">Commission per invite (₹)</label>
              <input
                value={inviteCommissionInput}
                onChange={e => setInviteCommissionInput(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                disabled={isSettingsLoading || isSaving}
                inputMode="decimal"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <button
              onClick={resetDrafts}
              className="rounded-full border border-white/10 px-6 py-3 text-sm text-white/70 hover:text-white disabled:opacity-40"
              disabled={isSettingsLoading || isSaving || !isDirty}
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="rounded-full bg-gradient-to-r from-primary to-emerald-400 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 disabled:opacity-40"
              disabled={isSettingsLoading || isSaving || !isDirty}
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </section>
      </div>
    </section>
  )
}
