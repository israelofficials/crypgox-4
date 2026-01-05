'use client'

import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import MobileBottomNav from '@/components/Layout/MobileBottomNav'
import ScrollToTop from '@/components/ScrollToTop'
import { usePathname } from 'next/navigation'
import { PropsWithChildren, useMemo } from 'react'

const HIDDEN_CHROME_ROUTES = [
  '/login',
  '/exchange',
  '/me',
  '/sell',
  '/deposit',
  '/withdraw',
  '/referrals',
  '/statements',
  '/invite',
  'referral',
  'support',
  '/withdraw/bind',
  '/settings',
  '/settings/business',
  '/deposit/order',
  '/admin',
  '/support',
  '/developer-disclaimer',
  '/settings/developers'
]

const AppShell = ({ children }: PropsWithChildren) => {
  const pathname = usePathname()

  const hideChrome = useMemo(
    () => HIDDEN_CHROME_ROUTES.some(route => pathname.startsWith(route)),
    [pathname]
  )

  return (
    <>
      {!hideChrome && <Header />}
      {children}
      {!hideChrome && <Footer />}
      {!hideChrome && <MobileBottomNav />}
      <ScrollToTop />
    </>
  )
}

export default AppShell
