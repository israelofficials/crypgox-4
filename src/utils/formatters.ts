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
  // Show only first 2 digits and last 2 digits, mask the rest
  const prefix = digits.slice(0, 2)
  const suffix = digits.slice(-2)
  const maskedLength = digits.length - 4
  return `${prefix}${'*'.repeat(maskedLength)}${suffix}`
}
