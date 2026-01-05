export const formatCurrency = (value: number | string, digits = 2) => {
  const numericValue = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(numericValue)) {
    return '0.00'
  }
  return numericValue.toLocaleString('en-IN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export const formatPhone = (phone: string) => {
  if (!phone) return ''
  const digits = phone.replace(/[^0-9]/g, '')
  if (digits.length <= 4) {
    return digits
  }
  const prefix = digits.slice(0, Math.max(0, digits.length - 6))
  const suffix = digits.slice(-4)
  return `${prefix}${'*'.repeat(Math.max(0, digits.length - prefix.length - suffix.length))}${suffix}`
}
