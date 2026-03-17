export type SRSRating = 'again' | 'hard' | 'good' | 'perfect'

export const SRS_INTERVALS: Record<SRSRating, number> = {
  again:   3 * 60 * 1000,
  hard:    7 * 60 * 1000,
  good:    10 * 60 * 1000,
  perfect: 24 * 60 * 60 * 1000,
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

export const SRS_TIMES: Record<SRSRating, string> = {
  again:   '3 min',
  hard:    '7 min',
  good:    '10 min',
  perfect: '1 day',
}

export function getNextReview(rating: SRSRating): string {
  return new Date(Date.now() + SRS_INTERVALS[rating]).toISOString()
}

export function isDue(nextReview: string): boolean {
  return Date.now() >= new Date(nextReview).getTime()
}