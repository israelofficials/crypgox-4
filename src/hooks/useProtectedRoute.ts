'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const PROTECTED_PREFIXES = ['/exchange', '/me']

const useProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
    if (isProtected && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [isAuthenticated, isLoading, pathname, router])
}

export default useProtectedRoute
