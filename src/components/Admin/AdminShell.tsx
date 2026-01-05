'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@iconify/react'
import { PropsWithChildren, useMemo } from 'react'

const NAV_ITEMS = [
  { label: 'Home', href: '/admin', icon: 'solar:home-2-bold' },
  { label: 'Users', href: '/admin/users', icon: 'solar:users-group-rounded-bold' },
  { label: 'Transactions', href: '/admin/transactions', icon: 'solar:wallet-2-bold' },
  { label: 'Settings', href: '/admin/settings', icon: 'solar:settings-bold' },
]

export default function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname()

  const items = useMemo(() => {
    return NAV_ITEMS.map(item => {
      if (item.href === '/admin') {
        return {
          ...item,
          active: pathname === '/admin',
        }
      }

      const isExactMatch = pathname === item.href
      const isNested = pathname.startsWith(`${item.href}/`)

      return {
        ...item,
        active: isExactMatch || isNested,
      }
    })
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#050916] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="hidden items-center justify-between border-b border-white/10 px-8 py-5 md:flex">
          <div>
            <p className="text-lg font-semibold">Admin Console</p>
            <p className="text-xs text-white/50">Monitor platform operations and manage activity.</p>
          </div>
          <nav className="flex items-center gap-6 text-sm uppercase tracking-wide">
            {items.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 transition-colors ${
                  item.active ? 'text-emerald-400' : 'text-white/60 hover:text-white'
                }`}
              >
                <Icon icon={item.icon} className="text-lg" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0b1220]/95 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between px-6 py-3">
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                item.active ? 'text-emerald-400' : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon icon={item.icon} className="text-xl" />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
