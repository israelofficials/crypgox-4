'use client'

import { useMemo, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const DEFAULT_BASE_RATE = 99
const REFRESH_INTERVAL = 30

const PlatformPrice = () => {
  const { settings } = useAuth()
  const [timer, setTimer] = useState(REFRESH_INTERVAL)

  const baseRate = useMemo(() => Number(settings?.baseRate ?? DEFAULT_BASE_RATE), [settings?.baseRate])
  const baseRateDisplay = useMemo(() => baseRate.toFixed(2), [baseRate])
  const basePairDisplay = useMemo(() => `1 USDT = ₹${baseRateDisplay}`, [baseRateDisplay])

  const activeTiers = useMemo(() => {
    const tiers = settings?.pricingTiers ?? []
    if (!tiers.length) {
      return [
        { range: '>=1000.01 and <2000.01', markup: '+ 0.25' },
        { range: '>=2000.01 and <3000.01', markup: '+ 0.50' },
        { range: '>=3000.01 and <5000.01', markup: '+ 1.00' },
        { range: '>=5000.01', markup: '+ 1.50' },
      ]
    }
    return tiers
  }, [settings?.pricingTiers])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? REFRESH_INTERVAL : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-10 md:py-16">
      <div className="container mx-auto px-4">
        {/* Mobile View - Same as Exchange Page */}
        <div className="md:hidden">
          <div className="text-center pt-3 pb-3">
            <p className="text-xl font-semibold text-white mb-0.5">
              Platform price
            </p>

            <p className="flex items-center justify-center gap-2 text-xs text-white/50">
              <span>
                Auto refresh in <span className="font-semibold text-primary">{timer}s</span>
              </span>
              <span className="text-sm text-primary/80">↻</span>
            </p>

            <div className="mt-1 flex justify-center items-center gap-2">
              <span className="text-6xl font-bold text-primary">
                {baseRateDisplay}
              </span>
              <span className="rounded-md bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-xs font-semibold">
                Base
              </span>
            </div>

            <p className="text-sm font-semibold text-white/90 mt-0.5">
              {basePairDisplay}
            </p>
          </div>

          {/* TIERS */}
          <section className="mt-1 rounded-2xl bg-[#0e1628] p-3 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(8,12,24,0.55)]">
            <div className="flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.3em] text-white/70">
              <span>Exchange ($)</span>
              <span>Price (₹)</span>
            </div>

            <div className="mt-2 space-y-2">
              {activeTiers.map((tier) => (
                <div key={tier.range} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                  <span className="text-[11px] text-white/60">{tier.range}</span>
                  <span className="text-sm font-semibold text-white">
                    {baseRateDisplay}
                    <span className="ml-1 text-[11px] text-emerald-300">{tier.markup}</span>
                  </span>
                </div>
              ))}
            </div>

            <Link href="/exchange/tier-policy" className="mt-3 flex items-center justify-center text-[11px] font-semibold text-primary underline underline-offset-4">
              What is tiered price policy?
            </Link>
          </section>
        </div>

        {/* Desktop View - Bigger */}
        <div className="hidden md:block">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              {/* LEFT */}
              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-[0.24em] text-primary md:text-sm">
                  Platform price
                </p>

                <h3 className="mt-2 text-5xl font-bold md:text-4xl text-white">
                  {basePairDisplay}
                </h3>

                <p className="mt-2 text-xs text-white/50 md:text-sm text-white/70">
                  Auto refresh {REFRESH_INTERVAL}s · Next refresh in {timer}s
                </p>
              </div>

              {/* RIGHT */}
              <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:gap-6">
                <div className="text-center rounded-2xl border border-primary/40 bg-primary/15 px-8 py-6">
                  <p className="text-xs uppercase tracking-[0.24em] text-primary">
                    Base rate
                  </p>
                  <p className="mt-2 text-6xl font-bold text-white">
                    ₹{baseRateDisplay}
                  </p>
                </div>
              </div>
            </div>

            {/* TIERS */}
            <div className="mt-10 md:mt-8 rounded-2xl border border-white/10 bg-white/5 px-6 py-6">
              <p className="text-xs uppercase tracking-[0.24em] text-primary">
                Exchange tiers
              </p>

              <div className="mt-4 divide-y divide-white/10">
                {activeTiers.map((tier) => (
                  <div
                    key={tier.range}
                    className="flex justify-between py-4 text-base"
                  >
                    <span className="text-white/70">{tier.range}</span>
                    <span className="font-semibold text-white">
                      {baseRateDisplay}
                      <span className="ml-2 text-emerald-400">{tier.markup}</span>
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/exchange/tier-policy" className="mt-4 inline-block text-xs text-primary underline underline-offset-4">
                What is tiered price policy?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlatformPrice
