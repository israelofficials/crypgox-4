'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AxiosError } from 'axios'
import { User } from '@/types/user'
import { PlatformSettings } from '@/types/platform'
import apiClient from '@/lib/api'

type RequestOtpResponse = {
  message: string
  expiresAt: number
  devOtp?: string
  requiresName: boolean
}

type VerifyOtpResponse = {
  token: string
  user: User
  settings: PlatformSettings
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  settings: PlatformSettings | null
  requestOtp: (phone: string) => Promise<RequestOtpResponse>
  verifyOtp: (phone: string, otp: string, name?: string, referralCode?: string) => Promise<VerifyOtpResponse>
  logout: () => Promise<void>
  refreshProfile: () => Promise<User | null>
  refreshSettings: () => Promise<PlatformSettings | null>
  setUser: (user: User | null) => void
  error: string | null
  clearError: () => void
  redeemReferralRewards: () => Promise<{ amount: number; user: User }>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const PRIVATE_ROUTE_PREFIXES = ['/exchange', '/me']

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  const handleAxiosError = (err: unknown) => {
    if (err instanceof AxiosError) {
      const message = err.response?.data?.message || err.message
      setError(message)
      return Promise.reject(new Error(message))
    }

    const fallBack = err instanceof Error ? err.message : 'Unexpected error'
    setError(fallBack)
    return Promise.reject(new Error(fallBack))
  }

  const loadPublicSettings = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ settings: PlatformSettings }>('/public/settings')
      setSettings(data.settings)
      return data.settings
    } catch (err) {
      handleAxiosError(err)
      return null
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ user: User; settings: PlatformSettings }>('/auth/me')
      setUserState(data.user)
      setSettings(data.settings)
      setToken((prev) => prev || null)
      return data.user
    } catch (err) {
      setUserState(null)
      setToken(null)
      setSettings((prev) => prev || null)
      if (pathname && PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        router.replace('/login')
      }
      if (err instanceof AxiosError && err.response?.status === 401) {
        await loadPublicSettings()
        return null
      }
      throw err
    }
  }, [pathname, router, loadPublicSettings])

  useEffect(() => {
    fetchProfile()
      .catch(() => null)
      .finally(() => setIsLoading(false))
  }, [fetchProfile])

  const requestOtp = useCallback(
    async (phone: string) => {
      setError(null)
      try {
        const { data } = await apiClient.post<RequestOtpResponse>('/auth/otp/request', { phone })
        return data
      } catch (err) {
        return handleAxiosError(err)
      }
    },
    []
  )

  const verifyOtp = useCallback(
    async (phone: string, otp: string, name?: string, referralCode?: string) => {
      setError(null)
      try {
        const payload: { phone: string; otp: string; name?: string; referralCode?: string } = { phone, otp }
        if (name) {
          payload.name = name
        }
        if (referralCode) {
          payload.referralCode = referralCode
        }
        const { data } = await apiClient.post<VerifyOtpResponse>('/auth/otp/verify', payload)
        setUserState(data.user)
        setToken(data.token)
        setSettings(data.settings)
        return data
      } catch (err) {
        return handleAxiosError(err)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } finally {
      setUserState(null)
      setToken(null)
      loadPublicSettings().catch(() => null)
      router.replace('/login')
    }
  }, [router, loadPublicSettings])

  const setUser = useCallback((next: User | null) => {
    setUserState(next)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const redeemReferralRewards = useCallback(async () => {
    setError(null)
    try {
      const { data } = await apiClient.post<{ amount: number; user: User }>('/user/referrals/redeem')
      setUserState(data.user)
      return data
    } catch (err) {
      return handleAxiosError(err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const user = await fetchProfile()
      return user
    } catch (err) {
      if (err instanceof AxiosError && err.response?.status === 401) {
        return null
      }
      throw err
    }
  }, [fetchProfile])

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ settings: PlatformSettings }>('/public/settings')
      setSettings(data.settings)
      return data.settings
    } catch (err) {
      handleAxiosError(err)
      return null
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user),
    settings,
    requestOtp,
    verifyOtp,
    logout,
    refreshProfile,
    refreshSettings,
    setUser,
    error,
    clearError,
    redeemReferralRewards,
  }), [
    user,
    token,
    isLoading,
    settings,
    requestOtp,
    verifyOtp,
    logout,
    refreshProfile,
    refreshSettings,
    setUser,
    error,
    clearError,
    redeemReferralRewards,
  ])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
