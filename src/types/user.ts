export type UserRole = 'USER' | 'ADMIN'

export type UserStats = {
  totalDeposits: number
  totalWithdrawals: number
  tier: string
}

export type UserStatement = {
  id: string
  type: string
  amount: number
  balanceAfter: number
  metadata: Record<string, unknown>
  createdAt: string
}

export type UserTransfer = {
  id: string
  amount: number
  status: string
  txId?: string | null
  network?: string | null
  destination?: string | null
  notes?: string | null
  createdAt: string
}

export type UserSellOrder = {
  id: string
  userId: string
  amount: number
  status: string
  destination?: string | null
  txId?: string | null
  notes: Record<string, unknown>
  createdAt: string
}

export type UserWallet = {
  id: string
  address: string
  network: string
  label?: string | null
  createdAt: string
  updatedAt: string
}

export type UserInvite = {
  id: string
  inviteePhone: string | null
  status: string
  reward: number
  rewardRedeemed: number
  createdAt: string
}

export type UserInviteSummary = {
  code: string
  total: number
  completed: number
  pending: number
  totalReward: number
  redeemedReward: number
  availableReward: number
  payoutThreshold: number
  eligibleForPayout: boolean
  list: UserInvite[]
}

export type User = {
  id: string
  phone: string
  role: UserRole
  name: string
  avatarUrl: string | null
  balance: number
  currency: string
  inviteCode: string
  status: 'ACTIVE' | 'FROZEN' | 'BLOCKED'
  stats: UserStats
  statements: UserStatement[]
  deposits: UserTransfer[]
  withdrawals: UserTransfer[]
  sellOrders: UserSellOrder[]
  wallets: UserWallet[]
  invites: UserInviteSummary
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}
