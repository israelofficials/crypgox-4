'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'

const navItems = [
  {
    label: 'Home',
    href: '/',
    icon: 'solar:home-2-bold-duotone',
  },
  {
    label: 'Exchange',
    href: '/exchange',
    icon: 'solar:chart-square-bold-duotone',
  },
  {
    label: 'Me',
    href: '/me',
    icon: 'solar:user-bold-duotone',
  },
]

type PageBottomBarProps = {
  active: 'Home' | 'Exchange' | 'Me'
}

const PageBottomBar = ({ active }: PageBottomBarProps) => {
  return (
    <nav className='fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#070b12]/95 px-4 py-3 backdrop-blur'>
      <div className='mx-auto flex w-full max-w-3xl items-center justify-between gap-3'>
        {navItems.map((item) => {
          const isActive = item.label === active

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-4 py-2 text-xs font-medium transition-colors lg:flex-row lg:justify-center lg:gap-2 lg:text-sm ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon icon={item.icon} className='text-xl lg:text-2xl' />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default PageBottomBar
