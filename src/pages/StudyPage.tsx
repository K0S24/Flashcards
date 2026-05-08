import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  getNextReview, isDue, computeNextInterval, formatInterval,
  SRS_LABELS, SRS_COLORS, type SRSRating,
} from '../lib/srs'
import type { Deck } from '../hooks/useDecks'
import type { Card } from '../hooks/useCards'
import type { User } from '@supabase/supabase-js'

interface Props {
  deck: Deck
  user: User
  onBack: () => void
}

function TypeAnswer({ answer, onCorrect, onWrong }: { answer: string, onCorrect: () => void, onWrong: () => void }) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isCorrect = input.trim().toLowerCase() === answer.trim().toLowerCase()

  function handleSubmit() {
    if (!input.trim()) return
    setSubmitted(true)
  }

  function renderColored() {
    return answer.split('').map((char, i) => {
      const typed = input[i]
      if (!typed) return <span key={i} className="text-gray-300">{char}</span>
      if (typed.toLowerCase() === char.toLowerCase()) return <span key={i} className="text-green-600">{char}</span>
      return <span key={i} className="text-red-500">{char}</span>
    })
  }

  return (
    <div className="w-full">
      <p className="text-xs text-gray-400 mb-2 text-center">TYPE THE ANSWER</p>

      {!submitted ? (
        <div>
          <input
            autoFocus
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 mb-3"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Type your answer..."
          />
          <button
            onClick={handleSubmit}
            className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700"
          >
            Check
          </button>
        </div>
      ) : (
        <div>
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-center">
            <p className="text-xs text-gray-400 mb-2">Your answer:</p>
            <p className="text-base font-medium text-gray-700 mb-3">{input}</p>
            <p className="text-xs text-gray-400 mb-2">Correct answer:</p>
            <p className="text-base font-mono">{renderColored()}</p>
          </div>
          {isCorrect ? (
            <div className="text-center mb-4">
              <span className="text-green-600 text-sm font-medium">✓ Correct!</span>
            </div>
          ) : (
            <div className="text-center mb-4">
              <span className="text-red-500 text-sm font-medium">✗ Wrong</span>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onWrong}
              className="flex-1 py-2.5 bg-red-100 text-red-700 text-sm font-medium rounded-xl hover:bg-red-200"
            >
              Again
            </button>
            <button
              onClick={onCorrect}
              className="flex-1 py-2.5 bg-green-100 text-green-700 text-sm font-medium rounded-xl hover:bg-green-200"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function StudyPage({ deck, user, onBack }: Props) {
  const [queue, setQueue] = useState<Card[]>([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState<Card | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDueCards()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (!current || done || loading) return
      if (current.mode === 'type') return

      if ((e.key === ' ' || e.key === 'Spacebar') && !flipped) {
        e.preventDefault()
        setFlipped(true)
        return
      }

      if (flipped) {
        const map: Record<string, SRSRating> = { '1': 'again', '2': 'hard', '3': 'good', '4': 'perfect' }
        if (map[e.key]) handleRating(map[e.key])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [flipped, current, queue, done, loading]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const { nextReview, interval } = getNextReview(rating, current.interval)

    await supabase.from('cards').update({ next_review: nextReview, interval }).eq('id', current.id)
    await supabase.from('study_logs').insert({
      user_id: user.id,
      card_id: current.id,
      deck_id: deck.id,
      rating,
    })

    if (rating === 'perfect') {
      const remaining = queue.filter(c => c.id !== current.id)
      if (remaining.length === 0) { setDone(true); return }
      setQueue(remaining)
      setCurrent(remaining[0])
      setFlipped(false)
    } else {
      const updated = { ...current, next_review: nextReview, interval }
      const remaining = queue.filter(c => c.id !== current.id)
      const newQueue = [...remaining, updated]
      setQueue(newQueue)
      setCurrent(newQueue[0])
      setFlipped(false)
    }
  }

  if (loading) return <div className="max-w-2xl mx-auto px-6 py-8"><p className="text-sm text-gray-400">Loading...</p></div>

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-2xl font-medium text-gray-900 mb-2">All done!</h2>
        <p className="text-sm text-gray-500 mb-8">You have reviewed all due cards in this deck.</p>
        <button onClick={onBack} className="text-sm bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700">
          Back to deck
        </button>
      </div>
    )
  }

  const reviewed = total - queue.length

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">← Back</button>
        <h2 className="text-xl font-medium text-gray-900 flex-1">{deck.name}</h2>
        <span className="text-sm text-gray-400">{reviewed}/{total}</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all"
          style={{ width: `${total > 0 ? (reviewed / total) * 100 : 0}%` }}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6 min-h-48 flex flex-col items-center justify-center">
        {current?.mode === 'type' ? (
          <div className="w-full">
            <p className="text-xs text-gray-400 mb-4 text-center">QUESTION</p>
            <p className="text-lg font-medium text-gray-900 text-center mb-6">{current.question}</p>
            <TypeAnswer
              answer={current.answer}
              onCorrect={() => handleRating('perfect')}
              onWrong={() => handleRating('again')}
            />
          </div>
        ) : !flipped ? (
          <div className="text-center cursor-pointer w-full" onClick={() => setFlipped(true)}>
            <p className="text-xs text-gray-400 mb-4">QUESTION</p>
            <p className="text-lg font-medium text-gray-900">{current?.question}</p>
            <p className="text-xs text-gray-400 mt-6">Click to reveal · Space</p>
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

      {flipped && current?.mode !== 'type' && (
        <>
          <div className="grid grid-cols-4 gap-3">
            {(['again', 'hard', 'good', 'perfect'] as SRSRating[]).map((rating) => (
              <button
                key={rating}
                onClick={() => handleRating(rating)}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${SRS_COLORS[rating]}`}
              >
                <div>{SRS_LABELS[rating]}</div>
                <div className="text-xs opacity-60 mt-0.5">
                  {formatInterval(computeNextInterval(current!.interval, rating))}
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center mt-2">Keys: 1 · 2 · 3 · 4</p>
        </>
      )}
    </div>
  )
}
