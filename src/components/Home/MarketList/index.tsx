'use client'

import { Icon } from '@iconify/react'
import { marketListings } from '@/app/api/data'

const getChangeColour = (change: string) => {
  if (change.startsWith('-')) return 'text-rose-400'
  if (change.startsWith('+')) return 'text-emerald-400'
  return 'text-white'
}

const MarketList = () => {
  return (
    <section className='mt-20' id='market'>
      <div className='container flex flex-col gap-4 text-white'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.24em] text-primary'>Market list</p>
            <h2 className='mt-2 text-3xl font-semibold sm:text-4xl'>Live liquidity pairs</h2>
          </div>
          <p className='max-w-xl text-sm text-muted/70'>
            Track how top on-chain assets are moving so you can time your USDT conversions or withdrawals across networks.
          </p>
        </div>
        <div className='overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg'>
          <div className='grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] px-6 py-4 text-xs uppercase tracking-[0.18em] text-muted/60'>
            <span>Crypto coin</span>
            <span className='text-right'>Volume (24h)</span>
            <span className='text-right'>Price</span>
          </div>
          <div className='divide-y divide-white/5'>
            {marketListings.map((item) => (
              <div
                key={item.symbol}
                className='grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)] items-center px-6 py-4 text-sm text-muted/60'
              >
                <div className='flex items-center gap-3'>
                  <Icon icon={item.icon} className='text-2xl' style={{ color: item.color }} />
                  <div className='flex flex-col'>
                    <span className='text-base font-semibold text-white'>{item.name}</span>
                    <span className={`text-xs font-medium ${getChangeColour(item.change)}`}>{item.change}</span>
                  </div>
                </div>
                <span className='text-right font-medium text-white'>{item.volume}</span>
                <span className='text-right font-semibold text-white'>{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default MarketList
