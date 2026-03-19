import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
}

interface StudyLog {
  id: string
  card_id: string
  deck_id: string
  rating: string
  studied_at: string
}

interface DeckStat {
  deck_id: string
  deck_name: string
  total: number
  again: number
  hard: number
  good: number
  perfect: number
}

export default function StatsPage({ user }: Props) {
  const [logs, setLogs] = useState<StudyLog[]>([])
  const [deckStats, setDeckStats] = useState<DeckStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data: logData } = await supabase
      .from('study_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('studied_at', today.toISOString())
      .order('studied_at', { ascending: false })

    const { data: deckData } = await supabase
      .from('decks')
      .select('id, name')
      .eq('user_id', user.id)

    setLogs(logData || [])

    // Statistiken pro Deck berechnen
    const stats: DeckStat[] = (deckData || []).map(deck => {
      const deckLogs = (logData || []).filter(l => l.deck_id === deck.id)
      return {
        deck_id: deck.id,
        deck_name: deck.name,
        total: deckLogs.length,
        again: deckLogs.filter(l => l.rating === 'again').length,
        hard: deckLogs.filter(l => l.rating === 'hard').length,
        good: deckLogs.filter(l => l.rating === 'good').length,
        perfect: deckLogs.filter(l => l.rating === 'perfect').length,
      }
    }).filter(s => s.total > 0)

    setDeckStats(stats)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-medium text-gray-900 mb-6">Today's Progress</h2>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Reviewed', value: logs.length, color: 'text-gray-900' },
              { label: 'Again', value: logs.filter(l => l.rating === 'again').length, color: 'text-red-600' },
              { label: 'Hard', value: logs.filter(l => l.rating === 'hard').length, color: 'text-orange-600' },
              { label: 'Perfect', value: logs.filter(l => l.rating === 'perfect').length, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                <div className={`text-2xl font-medium ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Per deck */}
          {deckStats.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No reviews today yet. Start studying!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deckStats.map(stat => (
                <div key={stat.deck_id} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-gray-900">{stat.deck_name}</p>
                    <span className="text-sm text-gray-500">{stat.total} reviews</span>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: 'Again', value: stat.again, color: 'bg-red-100 text-red-700' },
                      { label: 'Hard', value: stat.hard, color: 'bg-orange-100 text-orange-700' },
                      { label: 'Good', value: stat.good, color: 'bg-blue-100 text-blue-700' },
                      { label: 'Perfect', value: stat.perfect, color: 'bg-green-100 text-green-700' },
                    ].map(r => r.value > 0 && (
                      <span key={r.label} className={`text-xs px-2 py-1 rounded-lg font-medium ${r.color}`}>
                        {r.label}: {r.value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}