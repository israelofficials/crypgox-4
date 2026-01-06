'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import PageBottomBar from '@/components/Layout/PageBottomBar'
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEventHandler } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import useProtectedRoute from '@/hooks/useProtectedRoute'
import { formatCurrency, formatPhone } from '@/utils/formatters'
import LoadingOverlay from '@/components/shared/LoadingOverlay'
import { useRouter } from 'next/navigation'

const quickActions = [
  { label: 'Deposit', icon: 'solar:card-transfer-bold-duotone', href: '/exchange/deposit' },
  { label: 'Withdraw', icon: 'solar:wallet-money-bold-duotone', href: '/exchange/withdraw' },
  { label: 'Invite', icon: 'solar:gift-bold-duotone', href: '/exchange/invite' },
]

const DEFAULT_BASE_RATE = 99
const REFRESH_INTERVAL = 30

const ExchangePage = () => {
  useProtectedRoute()
  const { user, isLoading, isAuthenticated, settings } = useAuth()
  const router = useRouter()

  const [timer, setTimer] = useState(REFRESH_INTERVAL)
  const sliderTrackRef = useRef<HTMLDivElement | null>(null)
  const sliderKnobRef = useRef<HTMLDivElement | null>(null)
  const sliderTriggeredRef = useRef(false)
  const isSlidingRef = useRef(false)
  const sliderProgressRef = useRef(0)
  const sliderMaxDistanceRef = useRef(0)
  const [isSliding, setIsSliding] = useState(false)
  const [sliderOffset, setSliderOffset] = useState(0)

  const maskedPhone = useMemo(() => {
    if (!user?.phone) return '—'
    return formatPhone(user.phone)
  }, [user?.phone])

  const balanceDisplay = useMemo(() => {
    if (!user) return '$0.00'
    return `${user.currency === 'INR' ? '₹' : '$'}${formatCurrency(user.balance)}`
  }, [user])

  const recentDeposits = useMemo(() => user?.deposits.slice(0, 3) ?? [], [user?.deposits])
  const recentWithdrawals = useMemo(() => user?.withdrawals.slice(0, 3) ?? [], [user?.withdrawals])
  const recentSellOrders = useMemo(() => user?.sellOrders.slice(0, 3) ?? [], [user?.sellOrders])

  const [announcement, setAnnouncement] = useState(() => ({
    time: '19:00',
    phone: '88****1234',
    soldAmount: '0',
    soldCurrency: user?.currency === 'INR' ? '₹' : '$',
    payout: '0',
  }))

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

  const updateSliderProgress = useCallback((clientX: number) => {
    const track = sliderTrackRef.current
    const knob = sliderKnobRef.current
    if (!track || !knob) return

    const trackRect = track.getBoundingClientRect()
    const knobRect = knob.getBoundingClientRect()
    const usableWidth = Math.max(trackRect.width - knobRect.width, 0)
    sliderMaxDistanceRef.current = usableWidth

    const rawPx = clientX - trackRect.left - knobRect.width / 2
    const clampedPx = Math.min(Math.max(rawPx, 0), usableWidth)
    const ratio = usableWidth === 0 ? 0 : clampedPx / usableWidth

    sliderProgressRef.current = ratio
    setSliderOffset(clampedPx)
  }, [])

  const resetSlider = useCallback(() => {
    sliderProgressRef.current = 0
    sliderMaxDistanceRef.current = sliderMaxDistanceRef.current || 0
    setSliderOffset(0)
    setIsSliding(false)
    isSlidingRef.current = false
  }, [])

  const handlePointerDown: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (sliderTriggeredRef.current) return
      const track = sliderTrackRef.current
      if (!track) return
      isSlidingRef.current = true
      setIsSliding(true)
      track.setPointerCapture(event.pointerId)
      updateSliderProgress(event.clientX)
    },
    [updateSliderProgress]
  )

  const handlePointerMove: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      if (!isSlidingRef.current || sliderTriggeredRef.current) return
      updateSliderProgress(event.clientX)
    },
    [updateSliderProgress]
  )

  const finishSliding = useCallback(
    (pointerId?: number) => {
      if (!isSlidingRef.current) return
      const track = sliderTrackRef.current
      if (track && typeof pointerId === 'number' && track.hasPointerCapture(pointerId)) {
        track.releasePointerCapture(pointerId)
      }

      isSlidingRef.current = false
      setIsSliding(false)

      if (sliderProgressRef.current >= 0.92) {
        sliderTriggeredRef.current = true
        sliderProgressRef.current = 1
        setSliderOffset(sliderMaxDistanceRef.current)
        window.setTimeout(() => {
          router.push('/exchange/sell')
          sliderTriggeredRef.current = false
        }, 160)
      } else {
        resetSlider()
      }
    },
    [resetSlider, router]
  )

  const handlePointerUp: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      finishSliding(event.pointerId)
    },
    [finishSliding]
  )

  const handlePointerCancel: PointerEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      finishSliding(event.pointerId)
    },
    [finishSliding]
  )

  const generateAnnouncement = useCallback(() => {
    const prefixOptions = ['9', '8', '7', '6']
    const prefix = prefixOptions[Math.floor(Math.random() * prefixOptions.length)]
    const remainingDigits = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0')
    const fullDigits = `${prefix}${remainingDigits}`
    const maskedDigits = `${fullDigits.slice(0, 3)}****${fullDigits.slice(-3)}`
    const phone = `+91 ${maskedDigits}`

    const soldAmountValue = Math.floor(Math.random() * (7000 - 300 + 1)) + 300
    const payoutValue = soldAmountValue * baseRate

    return {
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      phone,
      soldAmount: formatCurrency(soldAmountValue),
      soldCurrency: '$',
      payout: formatCurrency(payoutValue),
    }
  }, [baseRate])

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev <= 1 ? REFRESH_INTERVAL : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setAnnouncement(generateAnnouncement())
    const interval = setInterval(() => {
      setAnnouncement(generateAnnouncement())
    }, 5_000)

    return () => clearInterval(interval)
  }, [generateAnnouncement])

  if (isLoading || !isAuthenticated) {
    return <LoadingOverlay label="Loading your exchange data" />
  }

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">

      {/* APP CANVAS */}
      <div
        className="
          relative w-full max-w-[420px] min-h-screen pb-32
          bg-[#0b1220]
          shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_30px_80px_rgba(0,0,0,0.85)]
        "
      >

        {/* HEADER */}
        <header className="sticky top-0 z-40 bg-[#0b1220]/90 backdrop-blur px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full bg-primary/20 ring-1 ring-primary/30">
                <Image
                  src={user?.avatarUrl || '/images/3d1.webp'}
                  alt="avatar"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div>
                <p className="text-base font-semibold">{maskedPhone}</p>
                <p className="text-xs text-white/60">{balanceDisplay}</p>
              </div>
            </div>

            <Link href='/support'>
              <Image
                src='/support.png'
                alt='Support'
                width={28}
                height={28}
                className='h-7 w-7'
              />
            </Link>
          </div>
        </header>

        {/* CONTENT */}
        <div className="px-4 pt-4 space-y-3">

          {/* PLATFORM PRICE */}
          <section className="text-center pt-3 pb-3">
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
          </section>

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

          {/* CTA */}
          <div
            ref={sliderTrackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onTouchStart={(e) => {
              // Improve touch handling for mobile
              const touch = e.touches[0]
              if (touch) {
                handlePointerDown({
                  clientX: touch.clientX,
                  pointerId: touch.identifier,
                } as React.PointerEvent<HTMLDivElement>)
              }
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0]
              if (touch && isSlidingRef.current) {
                handlePointerMove({
                  clientX: touch.clientX,
                } as React.PointerEvent<HTMLDivElement>)
              }
            }}
            onTouchEnd={(e) => {
              const touch = e.changedTouches[0]
              if (touch) {
                handlePointerUp({
                  pointerId: touch.identifier,
                } as React.PointerEvent<HTMLDivElement>)
              }
            }}
            className="relative flex w-full items-center overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 to-primary px-4 py-4 text-black shadow-2xl shadow-primary/50 touch-none select-none"
            role="button"
            tabIndex={0}
            aria-label="Swipe to sell USDT"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                sliderTriggeredRef.current = true
                const track = sliderTrackRef.current
                const knob = sliderKnobRef.current
                if (track && knob) {
                  const usableWidth = Math.max(track.getBoundingClientRect().width - knob.getBoundingClientRect().width, 0)
                  sliderMaxDistanceRef.current = usableWidth
                  setSliderOffset(usableWidth)
                }
                sliderProgressRef.current = 1
                router.push('/exchange/sell')
              }
            }}
          >
            <div
              ref={sliderKnobRef}
              className="absolute left-0 top-1/2 z-10 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white shadow-xl shadow-black/30 transition-transform duration-200 touch-none"
              style={{ transform: `translateX(${sliderOffset}px)` }}
            >
              <Icon icon="solar:double-alt-arrow-right-bold" className="text-2xl" />
            </div>
            <div className="pointer-events-none flex w-full items-center justify-center">
              <span className="text-base font-semibold tracking-wide text-black/70">Swipe to sell USDT</span>
            </div>
            <div
              className="absolute inset-0 rounded-full bg-white/30 transition-opacity pointer-events-none"
              style={{ opacity: isSliding ? 0.15 : 0 }}
            />
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex justify-between px-6 pt-1">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-0.5 text-xs text-white/80"
              >
                <Icon icon={action.icon} className="text-3xl text-primary" />
                {action.label}
              </Link>
            ))}
          </div>

          {/* NOTICE */}
          <div
            className="
              mt-2 flex items-start gap-3 px-3 py-3
              rounded-xl bg-[#0e1628] ring-1 ring-white/10
              text-xs text-white/70
            "
          >
            <Icon icon="solar:bell-bold-duotone" className="mt-0.5 text-lg text-primary" />
            <div className="space-y-1 w-full">
              <p className="text-sm font-semibold text-white">
                {announcement.time} {announcement.phone} sold {announcement.soldCurrency}
                {announcement.soldAmount}
              </p>
              <p className="text-white/60">
                Payout credited at ₹{announcement.payout}
              </p>
            </div>
          </div>

          {/* RECENT DEPOSITS */}
          {recentDeposits.length > 0 && (
            <section className="mt-3 space-y-3">
              <header className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Recent deposits</p>
                <Link href="/me/statements" className="text-xs text-primary">
                  View all
                </Link>
              </header>
              <div className="space-y-2">
                {recentDeposits.map((deposit) => (
                  <Link
                    key={deposit.id}
                    href={`/exchange/deposit/order?depositId=${deposit.id}`}
                    className="rounded-xl bg-[#0e1628] ring-1 ring-white/5 px-4 py-3 flex justify-between text-sm transition-transform hover:scale-[1.01]"
                  >
                    <div>
                      <p className="font-semibold text-white">+{formatCurrency(deposit.amount)}</p>
                      <p className="text-white/50">
                        {deposit.network ? deposit.network : 'Network pending'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-white/50">
                      <p className={`font-semibold ${deposit.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {deposit.status}
                      </p>
                      <p>{new Date(deposit.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* RECENT WITHDRAWALS */}
          {recentWithdrawals.length > 0 && (
            <section className="mt-4 space-y-3">
              <header className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Recent withdrawals</p>
                <Link href="/me/statements" className="text-xs text-primary">
                  View all
                </Link>
              </header>
              <div className="space-y-2">
                {recentWithdrawals.map((withdrawal) => (
                  <Link
                    key={withdrawal.id}
                    href={`/exchange/withdraw/pending?withdrawalId=${withdrawal.id}`}
                    className="rounded-xl bg-[#0e1628] ring-1 ring-white/5 px-4 py-3 flex justify-between text-sm transition-transform hover:scale-[1.01]"
                  >
                    <div>
                      <p className="font-semibold text-white">-{formatCurrency(withdrawal.amount)}</p>
                      <p className="text-white/50">
                        {withdrawal.destination ? withdrawal.destination : 'Destination pending'}
                      </p>
                    </div>
                    <div className="text-right text-xs text-white/50">
                      <p className={`font-semibold ${withdrawal.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-300'}`}>
                        {withdrawal.status}
                      </p>
                      <p>{new Date(withdrawal.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* RECENT SELL ORDERS */}
          {recentSellOrders.length > 0 && (
            <section className="mt-4 space-y-3">
              <header className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Recent sell orders</p>
                <Link href="/exchange/sell?view=history" className="text-xs text-primary">
                  View all
                </Link>
              </header>
              <div className="space-y-2">
                {recentSellOrders.map((sellOrder) => {
                  const metadata = sellOrder.notes || {}
                  const netInr =
                    typeof metadata['netInr'] === 'number'
                      ? metadata['netInr']
                      : typeof metadata['payoutInr'] === 'number'
                        ? metadata['payoutInr']
                        : null
                  const status = (sellOrder.status || metadata['status'] || 'PENDING') as string
                  const statusLabel = status.replace(/_/g, ' ')
                  const statusClass =
                    status === 'COMPLETED'
                      ? 'text-emerald-400'
                      : status === 'REJECTED'
                        ? 'text-red-400'
                        : 'text-amber-300'

                  return (
                    <Link
                      key={sellOrder.id}
                      href={`/exchange/sell/order?orderId=${sellOrder.id}`}
                      className="rounded-xl bg-[#0e1628] ring-1 ring-white/5 px-4 py-3 flex justify-between text-sm transition-transform hover:scale-[1.01]"
                    >
                      <div>
                        <p className="font-semibold text-white">Sold {formatCurrency(sellOrder.amount)} USDT</p>
                        <p className="text-white/50">
                          {netInr ? `Payout: ₹${formatCurrency(netInr)}` : 'Payout pending'}
                        </p>
                      </div>
                      <div className="text-right text-xs text-white/50">
                        <p className={`font-semibold ${statusClass}`}>{statusLabel}</p>
                        <p>{new Date(sellOrder.createdAt).toLocaleString('en-IN')}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

        </div>

        <PageBottomBar active="Exchange" />
      </div>
    </main>
  )
}

export default ExchangePage
