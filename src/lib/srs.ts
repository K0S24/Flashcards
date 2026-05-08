export type SRSRating = 'again' | 'hard' | 'good' | 'perfect'

const INITIAL_INTERVALS: Record<SRSRating, number> = {
  again:   60 * 1000,                   // 1 min
  hard:    10 * 60 * 1000,              // 10 min
  good:    60 * 60 * 1000,              // 1 hr
  perfect: 24 * 60 * 60 * 1000,        // 1 day
}

const GROWTH_MULTIPLIERS: Record<SRSRating, number> = {
  again:   0,
  hard:    1.2,
  good:    2.5,
  perfect: 3.5,
}

export const SRS_LABELS: Record<SRSRating, string> = {
  again:   'Again',
  hard:    'Hard',
  good:    'Good',
  perfect: 'Perfect',
}

export const SRS_COLORS: Record<SRSRating, string> = {
  again:   'bg-red-100 text-red-700 hover:bg-red-200',
  hard:    'bg-orange-100 text-orange-700 hover:bg-orange-200',
  good:    'bg-blue-100 text-blue-700 hover:bg-blue-200',
  perfect: 'bg-green-100 text-green-700 hover:bg-green-200',
}

export function computeNextInterval(currentIntervalMs: number, rating: SRSRating): number {
  if (currentIntervalMs === 0 || rating === 'again') {
    return INITIAL_INTERVALS[rating]
  }
  return Math.max(INITIAL_INTERVALS[rating], Math.round(currentIntervalMs * GROWTH_MULTIPLIERS[rating]))
}

export function formatInterval(ms: number): string {
  if (ms < 60 * 60 * 1000) return `${Math.round(ms / 60000)}m`
  if (ms < 24 * 60 * 60 * 1000) return `${Math.round(ms / (60 * 60 * 1000))}h`
  const days = Math.round(ms / (24 * 60 * 60 * 1000))
  return `${days}d`
}

export function getNextReview(rating: SRSRating, currentIntervalMs = 0): { nextReview: string; interval: number } {
  const interval = computeNextInterval(currentIntervalMs, rating)
  return {
    nextReview: new Date(Date.now() + interval).toISOString(),
    interval,
  }
}

export function isDue(nextReview: string): boolean {
  return Date.now() >= new Date(nextReview).getTime()
}
