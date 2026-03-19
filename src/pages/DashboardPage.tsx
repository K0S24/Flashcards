import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import DecksPage from './DecksPage'
import CardsPage from './CardsPage'
import StudyPage from './StudyPage'
import StatsPage from './StatsPage'
import type { Deck } from '../hooks/useDecks'

interface Props {
  user: User
  onSignOut: () => void
}

type Page = 'decks' | 'stats'

export default function DashboardPage({ user, onSignOut }: Props) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)
  const [studying, setStudying] = useState(false)
  const [page, setPage] = useState<Page>('decks')

  function goHome() {
    setSelectedDeck(null)
    setStudying(false)
    setPage('decks')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1
          className="text-lg font-medium text-gray-900 cursor-pointer"
          onClick={goHome}
        >
          Flashcards
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setPage('decks'); setSelectedDeck(null); setStudying(false) }}
            className={`text-sm ${page === 'decks' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Decks
          </button>
          <button
            onClick={() => { setPage('stats'); setSelectedDeck(null); setStudying(false) }}
            className={`text-sm ${page === 'stats' ? 'text-indigo-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Progress
          </button>
          <span className="text-sm text-gray-400">{user.email}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      {page === 'stats' ? (
        <StatsPage user={user} />
      ) : !selectedDeck ? (
        <DecksPage user={user} onSelectDeck={setSelectedDeck} />
      ) : studying ? (
        <StudyPage
          deck={selectedDeck}
          user={user}
          onBack={() => setStudying(false)}
        />
      ) : (
        <CardsPage
          deck={selectedDeck}
          onBack={() => setSelectedDeck(null)}
          onStudy={() => setStudying(true)}
        />
      )}
    </div>
  )
}