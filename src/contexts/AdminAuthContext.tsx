'use client'

import { AxiosError } from 'axios'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import apiClient from '@/lib/api'
import { User } from '@/types/user'

type AdminSession = {
  username: string
  role: string
}

type AdminMetrics = {
  totalUsers: number
  totalUsdt: number
  totalInr: number
  pendingWithdrawals: number
  pendingDeposits: number
  pendingSellOrders: number
  walletBalances: {
    usdt: number
    inr: number
  }
}

type PricingTier = {
  range: string
  markup: string
}

type PlatformSettings = {
  id: number
  baseRate: number
  pricingTiers: PricingTier[]
  depositAddresses: string[]
  inviteCommission: number
  updatedAt: string | null
}

export type AdminUser = {
  id: string
  phone: string
  role: string
  name: string
  avatarUrl: string | null
  balance: number
  currency: string
  inviteCode: string
  status: 'ACTIVE' | 'FROZEN' | 'BLOCKED'
  stats: {
    totalDeposits: number
    totalWithdrawals: number
    tier: string
  }
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

type AdminUserListResponse = {
  users: AdminUser[]
  total: number
}

type AdminUserRelations = {
  statements: User['statements']
  deposits: User['deposits']
  withdrawals: User['withdrawals']
  invites: User['invites']['list']
}

type UpdateSettingsInput = {
  baseRate?: number
  pricingTiers?: PricingTier[]
  depositAddresses?: string[]
  inviteCommission?: number
}

type FetchUsersParams = {
  search?: string
  limit?: number
  offset?: number
  startDate?: string
  endDate?: string
}

type FetchTransactionsParams = {
  limit?: number
  startDate?: string
  endDate?: string
}

type AdminTransactions = {
  deposits: Array<{
    id: string
    userId: string
    userName: string
    userPhone: string
    amount: number
    status: string
    txId: string | null
    network: string | null
    createdAt: string
    notes: Record<string, unknown> | null
  }>
  withdrawals: Array<{
    id: string
    userId: string
    userName: string
    userPhone: string
    amount: number
    status: string
    destination: string | null
    txId: string | null
    createdAt: string
    notes: Record<string, unknown> | null
  }>
  sellOrders: Array<{
    id: string
    userId: string
    userName: string
    userPhone: string
    entryType: string
    amount: number
    metadata: Record<string, unknown>
    createdAt: string
  }>
}

type AdminAuthContextValue = {
  admin: AdminSession | null
  metrics: AdminMetrics | null
  settings: PlatformSettings | null
  users: AdminUser[]
  userTotal: number
  transactions: AdminTransactions | null
  isLoading: boolean
  isMetricsLoading: boolean
  isSettingsLoading: boolean
  isUsersLoading: boolean
  isTransactionsLoading: boolean
  isAuthenticated: boolean
  error: string | null
  login: (username: string, password: string) => Promise<AdminSession>
  logout: () => Promise<void>
  fetchProfile: () => Promise<AdminSession | null>
  fetchMetrics: () => Promise<AdminMetrics>
  fetchSettings: () => Promise<PlatformSettings>
  updateSettings: (input: UpdateSettingsInput) => Promise<PlatformSettings>
  fetchUsers: (params?: FetchUsersParams) => Promise<AdminUserListResponse>
  fetchUserDetail: (userId: string) => Promise<AdminUser>
  updateUserStatus: (userId: string, status: AdminUser['status']) => Promise<AdminUser>
  fetchUserTransactions: (userId: string) => Promise<AdminUserRelations>
  fetchTransactions: (params?: FetchTransactionsParams) => Promise<AdminTransactions>
  approveWithdrawal: (withdrawalId: string, input?: { txId?: string }) => Promise<unknown>
  rejectWithdrawal: (withdrawalId: string, input?: { reason?: string }) => Promise<unknown>
  completeSellOrder: (orderId: string, input?: { txId?: string; note?: string; payoutInr?: number }) => Promise<unknown>
  rejectSellOrder: (orderId: string, input?: { reason?: string; note?: string }) => Promise<unknown>
  clearError: () => void
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined)

const ADMIN_LOGIN_PATH = '/admin/login'
const ADMIN_HOME_PATH = '/admin'

const normalizeError = (err: unknown): Error => {
  if (err instanceof AxiosError) {
    const message = err.response?.data?.message || err.message || 'Unexpected error'
    return new Error(message)
  }
  if (err instanceof Error) {
    return err
  }
  return new Error('Unexpected error')
}

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminSession | null>(null)
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [userTotal, setUserTotal] = useState(0)
  const [transactions, setTransactions] = useState<AdminTransactions | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMetricsLoading, setIsMetricsLoading] = useState(false)
  const [isSettingsLoading, setIsSettingsLoading] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ admin: AdminSession }>('/admin/me')
      setAdmin(data.admin)
      return data.admin
    } catch (err) {
      setAdmin(null)
      if (err instanceof AxiosError && err.response?.status === 401) {
        return null
      }
      throw normalizeError(err)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
      .catch(() => null)
      .finally(() => setIsLoading(false))
  }, [fetchProfile])

  useEffect(() => {
    if (isLoading) return

    const onLoginPage = pathname === ADMIN_LOGIN_PATH
    const onAdminRoute = pathname.startsWith('/admin')

    if (!admin && onAdminRoute && !onLoginPage) {
      const redirect = encodeURIComponent(pathname)
      router.replace(`${ADMIN_LOGIN_PATH}?redirect=${redirect}`)
      return
    }

    if (admin && onLoginPage) {
      const redirect = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null
      router.replace(redirect || ADMIN_HOME_PATH)
    }
  }, [admin, isLoading, pathname, router])

  const login = useCallback(
    async (username: string, password: string) => {
      setError(null)
      try {
        const { data } = await apiClient.post<{ admin: AdminSession }>('/admin/login', {
          username,
          password,
        })
        setAdmin(data.admin)
        return data.admin
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      }
    },
    []
  )

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/admin/logout')
    } finally {
      setAdmin(null)
      setMetrics(null)
      router.replace(ADMIN_LOGIN_PATH)
    }
  }, [router])

  const fetchMetrics = useCallback(async () => {
    setIsMetricsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get<{ metrics: AdminMetrics }>('/admin/dashboard/metrics')

      const metricsPayload = data.metrics
      const normalized: AdminMetrics = {
        totalUsers: Number(metricsPayload.totalUsers ?? 0) || 0,
        totalUsdt: Number(metricsPayload.totalUsdt ?? 0) || 0,
        totalInr: Number(metricsPayload.totalInr ?? 0) || 0,
        pendingWithdrawals: Number(metricsPayload.pendingWithdrawals ?? 0) || 0,
        pendingDeposits: Number(metricsPayload.pendingDeposits ?? 0) || 0,
        pendingSellOrders: Number(metricsPayload.pendingSellOrders ?? 0) || 0,
        walletBalances: {
          usdt: Number(metricsPayload.walletBalances?.usdt ?? 0) || 0,
          inr: Number(metricsPayload.walletBalances?.inr ?? 0) || 0,
        },
      }

      setMetrics(normalized)
      return normalized
    } catch (err) {
      const error = normalizeError(err)
      setError(error.message)
      throw error
    } finally {
      setIsMetricsLoading(false)
    }
  }, [])

  const fetchSettings = useCallback(async () => {
    setIsSettingsLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get<{ settings: PlatformSettings }>('/admin/dashboard/settings')
      setSettings(data.settings)
      return data.settings
    } catch (err) {
      const error = normalizeError(err)
      setError(error.message)
      throw error
    } finally {
      setIsSettingsLoading(false)
    }
  }, [])

  const updateSettings = useCallback(
    async (input: UpdateSettingsInput) => {
      setIsSettingsLoading(true)
      setError(null)
      try {
        const payload = {
          ...input,
          pricingTiers: input.pricingTiers,
          depositAddresses: input.depositAddresses,
        }
        const { data } = await apiClient.put<{ settings: PlatformSettings }>('/admin/dashboard/settings', payload)
        setSettings(data.settings)
        return data.settings
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      } finally {
        setIsSettingsLoading(false)
      }
    },
    []
  )

  const fetchUsers = useCallback(
    async (params: FetchUsersParams = {}) => {
      setIsUsersLoading(true)
      setError(null)
      try {
        const { data } = await apiClient.get<AdminUserListResponse>('/admin/dashboard/users', {
          params,
        })
        setUsers(data.users)
        setUserTotal(data.total)
        return data
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      } finally {
        setIsUsersLoading(false)
      }
    },
    []
  )

  const fetchUserDetail = useCallback(async (userId: string) => {
    setError(null)
    try {
      const { data } = await apiClient.get<{ user: AdminUser }>(`/admin/dashboard/users/${userId}`)
      return data.user
    } catch (err) {
      const error = normalizeError(err)
      setError(error.message)
      throw error
    }
  }, [])

  const updateUserStatusFn = useCallback(
    async (userId: string, status: AdminUser['status']) => {
      setError(null)
      const { data } = await apiClient.put<{ user: AdminUser }>(
        `/admin/dashboard/users/${userId}/status`,
        { status }
      )
      setUsers((prev) => prev.map((user) => (user.id === data.user.id ? data.user : user)))
      return data.user
    },
    []
  )

  const fetchUserTransactions = useCallback(async (userId: string) => {
    const { data } = await apiClient.get<AdminUserRelations>(
      `/admin/dashboard/users/${userId}/transactions`
    )
    return data
  }, [])

  const fetchTransactions = useCallback(async (params: FetchTransactionsParams = {}) => {
    setIsTransactionsLoading(true)
    setError(null)
    try {
      const { limit = 50, startDate, endDate } = params
      const queryParams: Record<string, unknown> = { limit }
      if (startDate) {
        queryParams.startDate = startDate
      }
      if (endDate) {
        queryParams.endDate = endDate
      }

      const { data } = await apiClient.get<AdminTransactions>('/admin/dashboard/transactions', {
        params: queryParams,
      })
      setTransactions(data)
      return data
    } catch (err) {
      const error = normalizeError(err)
      setError(error.message)
      throw error
    } finally {
      setIsTransactionsLoading(false)
    }
  }, [])

  const approveWithdrawal = useCallback(
    async (withdrawalId: string, input: { txId?: string } = {}) => {
      setError(null)
      try {
        const { data } = await apiClient.post<{ withdrawal: unknown }>(
          `/admin/dashboard/withdrawals/${withdrawalId}/approve`,
          input
        )
        return data.withdrawal
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      }
    },
    []
  )

  const rejectWithdrawal = useCallback(
    async (withdrawalId: string, input: { reason?: string } = {}) => {
      setError(null)
      try {
        const { data } = await apiClient.post<{ withdrawal: unknown }>(
          `/admin/dashboard/withdrawals/${withdrawalId}/reject`,
          input
        )
        return data.withdrawal
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      }
    },
    []
  )

  const completeSellOrder = useCallback(
    async (orderId: string, input: { txId?: string; note?: string; payoutInr?: number } = {}) => {
      setError(null)
      try {
        const { data } = await apiClient.post<{ sellOrder: unknown }>(
          `/admin/dashboard/sell-orders/${orderId}/complete`,
          input
        )
        return data.sellOrder
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      }
    },
    []
  )

  const rejectSellOrder = useCallback(
    async (orderId: string, input: { reason?: string; note?: string } = {}) => {
      setError(null)
      try {
        const { data } = await apiClient.post<{ sellOrder: unknown }>(
          `/admin/dashboard/sell-orders/${orderId}/reject`,
          input
        )
        return data.sellOrder
      } catch (err) {
        const error = normalizeError(err)
        setError(error.message)
        throw error
      }
    },
    []
  )

  const clearError = useCallback(() => setError(null), [])

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      admin,
      metrics,
      settings,
      users,
      userTotal,
      transactions,
      isLoading,
      isMetricsLoading,
      isSettingsLoading,
      isUsersLoading,
      isTransactionsLoading,
      isAuthenticated: Boolean(admin),
      error,
      login,
      logout,
      fetchProfile,
      fetchMetrics,
      fetchSettings,
      updateSettings,
      fetchUsers,
      fetchUserDetail,
      updateUserStatus: updateUserStatusFn,
      fetchUserTransactions,
      fetchTransactions,
      approveWithdrawal,
      rejectWithdrawal,
      completeSellOrder,
      rejectSellOrder,
      clearError,
    }),
    [
      admin,
      metrics,
      settings,
      users,
      userTotal,
      transactions,
      isLoading,
      isMetricsLoading,
      isSettingsLoading,
      isUsersLoading,
      isTransactionsLoading,
      error,
      login,
      logout,
      fetchProfile,
      fetchMetrics,
      fetchSettings,
      updateSettings,
      fetchUsers,
      fetchUserDetail,
      updateUserStatusFn,
      fetchUserTransactions,
      fetchTransactions,
      approveWithdrawal,
      rejectWithdrawal,
      completeSellOrder,
      rejectSellOrder,
      clearError,
    ]
  )

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
