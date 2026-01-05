export type PricingTier = {
  range: string
  markup: string
}

export type PlatformSettings = {
  id: number
  baseRate: number
  pricingTiers: PricingTier[]
  depositAddresses: string[]
  inviteCommission: number
  updatedAt: string | null
}
