import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getNextReview, isDue, SRS_LABELS, SRS_COLORS, SRS_TIMES, type SRSRating } from '../lib/srs'
import type { Deck } from '../hooks/useDecks'
import type { Card } from '../hooks/useCards'

interface Props {
  deck: Deck
  onBack: () => void
}

export default function StudyPage({ deck, onBack }: Props) {
  const [queue, setQueue] = useState<Card[]>([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<Card | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDueCards()
  }, [])

  async function loadDueCards() {
    setLoading(true)
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deck.id)
    const due = (data || []).filter(c => isDue(c.next_review))
    setQueue(due)
    setTotal(due.length)
    setCurrent(due[0] || null)
    if (due.length === 0) setDone(true)
    setLoading(false)
  }

  async function handleRating(rating: SRSRating) {
    if (!current) return
    const nextReview = getNextReview(rating)

    await supabase
      .from('cards')
      .update({ next_review: nextReview })
      .eq('id', current.id)

    if (rating === 'perfect') {
      const remaining = queue.filter(c => c.id !== current.id)
      if (remaining.length === 0) {
        setDone(true)
      } else {
        setQueue(remaining)
        setCurrent(remaining[0])
        setFlipped(false)
      }
    } else {
      const updated = { ...current, next_review: nextReview }
      const remaining = queue.filter(c => c.id !== current.id)
      const newQueue = [...remaining, updated]
      setQueue(newQueue)
      setCurrent(newQueue[0])
      setFlipped(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-medium text-gray-900 mb-2">All done!</h2>
        <p className="text-sm text-gray-500 mb-8">You have reviewed all due cards in this deck.</p>
        <button
          onClick={onBack}
          className="text-sm bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700"
        >
          Back to deck
        </button>
      </div>
    )
  }

  const reviewed = total - queue.length

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h2 className="text-xl font-medium text-gray-900 flex-1">{deck.name}</h2>
        <span className="text-sm text-gray-400">{reviewed}/{total}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
        />
      </div>

      {/* Card */}
      <div
        className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 min-h-48 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 transition-colors"
        onClick={() => setFlipped(true)}
      >
        {!flipped ? (
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-4">QUESTION</p>
            <p className="text-lg font-medium text-gray-900">{current?.question}</p>
            <p className="text-xs text-gray-400 mt-6">Click to reveal answer</p>
          </div>
        ) : (
          <div className="text-center w-full">
            <p className="text-xs text-gray-400 mb-2">QUESTION</p>
            <p className="text-base font-medium text-gray-900 mb-6">{current?.question}</p>
            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs text-gray-400 mb-2">ANSWER</p>
              <p className="text-base text-gray-700">{current?.answer}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-3">
          {(['again', 'hard', 'good', 'perfect'] as SRSRating[]).map(rating => (
            <button
              key={rating}
              onClick={() => handleRating(rating)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${SRS_COLORS[rating]}`}
            >
              <div>{SRS_LABELS[rating]}</div>
              <div className="text-xs opacity-60 mt-0.5">{SRS_TIMES[rating]}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}