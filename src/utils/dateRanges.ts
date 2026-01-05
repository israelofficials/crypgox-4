export type DateRangePreset = 'all' | 'today' | '3d' | '7d' | '30d'

export type DateRangeSelection = {
  startDate?: string
  endDate?: string
}

const toIsoString = (date: Date) => date.toISOString()

export const getPresetRange = (preset: DateRangePreset): DateRangeSelection => {
  if (preset === 'all') {
    return {}
  }

  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const start = new Date(now)

  if (preset === 'today') {
    start.setHours(0, 0, 0, 0)
  } else if (preset === '3d') {
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 2)
  } else if (preset === '7d') {
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)
  } else if (preset === '30d') {
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 29)
  }

  return {
    startDate: toIsoString(start),
    endDate: toIsoString(end),
  }
}
