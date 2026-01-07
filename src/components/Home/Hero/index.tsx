'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useAuth } from '@/contexts/AuthContext' 

type CurrencyCardConfig = {
  asset: 'USDT' | 'INR'
  icon: string
  amount: string
  onChange: (value: string) => void
}

const Hero = () => {
  const { settings, isAuthenticated } = useAuth()
  const DEFAULT_BASE_RATE = 99
  const baseRate = useMemo(() => Number(settings?.baseRate ?? DEFAULT_BASE_RATE), [settings?.baseRate])

  const [direction] = useState<'USDT_TO_INR' | 'INR_TO_USDT'>('USDT_TO_INR')
  const [usdtAmount, setUsdtAmount] = useState('100.00')
  const [inrAmount, setInrAmount] = useState(() => (100 * baseRate).toFixed(2))

  const handleInrChange = useCallback((value: string) => {
    setInrAmount(value)
    const numeric = parseFloat(value)
    if (!isNaN(numeric)) {
      setUsdtAmount((numeric / baseRate).toFixed(2))
    } else {
      setUsdtAmount('')
    }
  }, [baseRate])

  const handleUsdtChange = useCallback((value: string) => {
    setUsdtAmount(value)
    const numeric = parseFloat(value)
    if (!isNaN(numeric)) {
      setInrAmount((numeric * baseRate).toFixed(2))
    } else {
      setInrAmount('')
    }
  }, [baseRate])

  useEffect(() => {
    const numeric = parseFloat(usdtAmount)
    if (!isNaN(numeric)) {
      setInrAmount((numeric * baseRate).toFixed(2))
    }
  }, [baseRate, usdtAmount])

  const { sendCard, receiveCard } = useMemo(() => {
    const usdtCard: CurrencyCardConfig = {
      asset: 'USDT',
      icon: '/money.png',
      amount: usdtAmount,
      onChange: handleUsdtChange,
    }

    const inrCard: CurrencyCardConfig = {
      asset: 'INR',
      icon: '/flag.png',
      amount: inrAmount,
      onChange: handleInrChange,
    }

    return { sendCard: usdtCard, receiveCard: inrCard }
  }, [handleInrChange, handleUsdtChange, inrAmount, usdtAmount])

  // swap disabled – UI stays
  const toggleDirection = useCallback(() => {}, [])

  const renderCurrencyCard = useCallback(
    (card: CurrencyCardConfig) => (
      <div
        key={card.asset}
        className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-5 gap-6'
      >
        <div className='flex items-center gap-3'>
          <div className='relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-black/40 flex items-center justify-center'>
            <Image
              src={card.icon}
              alt={`${card.asset} icon`}
              width={40}
              height={40}
              className='object-cover'
            />
          </div>
          <p className='text-white font-semibold text-xl'>{card.asset}</p>
        </div>

        <input
          type='number'
          value={card.amount}
          onChange={(event) => card.onChange(event.target.value)}
          min='0'
          step='0.01'
          className='
            w-full max-w-[140px]
            text-right
            bg-transparent
            text-white
            text-lg
            font-semibold
            focus:outline-none
            truncate
          '
        />
      </div>
    ),
    []
  )

  const leftAnimation = {
    initial: { x: -80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
    transition: { duration: 0.6 },
  }

  const rightAnimation = {
    initial: { x: 80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 80, opacity: 0 },
    transition: { duration: 0.6 },
  }

  return (
    <section
      className='relative py-24 pt-64 md:pt-56 lg:pt-60 overflow-x-hidden z-1'
      id='main-banner'
    >
      <div className='container'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
          <motion.div {...leftAnimation} className='flex flex-col gap-10'>
            <div className='flex flex-col gap-4 text-center md:text-left'>
              <div className='flex gap-6 items-center lg:justify-start justify-center'>
                <div className='py-1.5 px-4 bg-primary/10 rounded-full border border-white/10'>
                  <div className='flex items-center gap-2'>
                    <div className='flex items-center gap-1'>
                      <Image
                        src='/money.png'
                        alt='USDT'
                        width={16}
                        height={16}
                        className='rounded-full'
                      />
                      <Icon
                        icon='solar:arrow-right-linear'
                        className='text-primary text-sm'
                      />
                      <Image
                        src='/flag.png'
                        alt='INR'
                        width={16}
                        height={16}
                        className='rounded-full'
                      />
                    </div>

                    <span className='text-primary text-xs font-medium whitespace-nowrap'>
                      under 5 minutes
                    </span>
                  </div>
                </div>
              </div>

              <h1 className='font-medium xl:text-[72px] md:text-6xl sm:text-5xl text-4xl text-white'>
                Instant USDT to INR exchange
              </h1>

              <p className='max-w-xl mx-auto md:mx-0 md:text-lg text-white/80'>
                Deposit tether, lock spreads against deep INR liquidity, and
                withdraw funds to bank or back on-chain whenever you need.
              </p>
            </div>

            <div className='flex flex-wrap items-center md:justify-start justify-center gap-4'>
              <Link
                href='/login'
                className='bg-primary hover:bg-primary/80 flex items-center gap-2 border border-primary rounded-lg font-semibold text-background py-3 px-7 transition-colors'
              >
                Sell USDT for INR
                <Icon icon='solar:banknote-2-bold-duotone' className='text-background text-xl' />
              </Link>

              <Link
                href='/login'
                className='flex items-center gap-2 border border-primary/40 rounded-lg font-semibold text-white py-3 px-7 hover:border-primary transition-colors'
              >
                Withdraw USDT
                <Icon icon='solar:wallet-money-bold-duotone' className='text-primary text-xl' />
              </Link>
            </div>
          </motion.div>

          <motion.div {...rightAnimation} className='flex justify-center md:justify-end'>
            <div className='relative w-full max-w-sm'>
              <div className='absolute -top-10 -left-14 h-40 w-40 rounded-full bg-primary/20 blur-3xl opacity-60' />

              <div className='relative rounded-[32px] border border-white/10 bg-white/5/80 backdrop-blur-lg px-8 py-9 shadow-[0_20px_60px_-25px_rgba(16,185,129,0.6)] flex flex-col gap-6'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs uppercase tracking-[0.28em] text-primary'>
                    Conversion desk
                  </span>
                  <span className='text-xs text-muted/60'>Realtime spreads</span>
                </div>

                <div className='relative flex flex-col gap-6'>
                  {renderCurrencyCard(sendCard)}

                  <button
                    type='button'
                    onClick={toggleDirection}
                    className='absolute left-1/2 top-1/2
                      -translate-x-1/2 -translate-y-1/2
                      flex h-12 w-12 items-center justify-center
                      rounded-full border border-white/20
                      bg-[#0b0f14] text-white shadow-xl
                      transition-all hover:bg-[#121826]'
                    aria-label='Swap currencies'
                  >
                    <Icon icon='solar:transfer-vertical-linear' className='text-xl' />
                  </button>

                  {renderCurrencyCard(receiveCard)}
                </div>

                <div className='rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm text-white flex flex-col gap-2'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1'>
                    <span className='whitespace-nowrap'>Our current rate</span>
                    <span className='font-semibold text-primary whitespace-nowrap'>
                      {`1 USDT = ₹${baseRate.toFixed(2)}`}
                    </span>
                  </div>

                  <p className='text-xs text-muted/60 leading-relaxed'>
                    Rate excludes fees. Settlement speeds depend on chosen payout rails.
                  </p>
                </div>

                <Link
                  href={isAuthenticated ? '/exchange/sell' : '/login'}
                  className='flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-base font-semibold text-background transition-colors hover:bg-primary/80'
                >
                  <Icon icon={isAuthenticated ? 'solar:banknote-2-bold-duotone' : 'solar:login-2-bold-duotone'} className='text-xl' />
                  {isAuthenticated ? 'Sell now' : 'Login to sell'}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
