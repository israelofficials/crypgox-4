'use client'

import { useCallback, useState } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

const quickLinks = [
  {
    key: 'support',
    title: 'Customer service',
    caption: 'Customer service',
    href: '/support',
  },
  {
    key: 'business',
    title: 'Privacy and Policy',
    caption: 'Privacy and Policy',
    href: '/me/settings/business',
  },
  {
    key: 'install',
    title: 'Install the official version',
    caption: 'Install the official version',
    href: '/api/download/apk',
  },
  {
    key: 'kyc',
    title: 'KYC',
    caption: 'Know Your Customer',
    href: '/me/settings/kyc',
  },
]

const SettingsPage = () => {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }, [logout, isLoggingOut])

  return (
    <main className="min-h-screen bg-[#00050f] flex justify-center text-white">
      <div className="w-full max-w-[420px] min-h-screen pb-32 bg-[#0b1220]">
        <header className="flex items-center gap-3 px-5 pt-5">
          <Link href="/me" className="rounded-full bg-white/5 p-2 text-white/70">
            <Icon icon="solar:alt-arrow-left-bold" className="text-xl" />
            <span className="sr-only">Back</span>
          </Link>
          <h1 className="text-lg font-semibold">Settings</h1>
        </header>

        <div className="px-5 pt-6 space-y-6">
          <section className="rounded-2xl bg-[#0e1628] border border-white/10 divide-y divide-white/10">
            {quickLinks.map(item => (
              <Link
                key={item.key}
                href={item.href}
                download={item.key === 'install' ? 'crypgox.apk' : undefined}
                className="flex items-center justify-between px-4 py-4 text-left"
              >
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/50 mt-0.5">{item.caption}</p>
                </div>
                <Icon icon="solar:alt-arrow-right-bold" className="text-lg text-white/40" />
              </Link>
            ))}
          </section>

          <section className="rounded-2xl bg-[#0e1628] border border-white/10 px-4 py-4">
            <p className="text-sm font-semibold">Version</p>
            <p className="text-xs text-white/50 mt-0.5">v3.2.1</p>
          </section>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full py-3 rounded-full font-semibold transition ${
              isLoggingOut
                ? 'bg-red-500/20 text-red-300 cursor-not-allowed'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {isLoggingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>
    </main>
  )
}

export default SettingsPage
