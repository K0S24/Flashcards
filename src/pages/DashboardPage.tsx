import { useState } from 'react'
import type { User } from '@supabase/supabase-js'
import DecksPage from './DecksPage'
import type { Deck } from '../hooks/useDecks'

interface Props {
  user: User
  onSignOut: () => void
}

export default function DashboardPage({ user, onSignOut }: Props) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1
          className="text-lg font-medium text-gray-900 cursor-pointer"
          onClick={() => setSelectedDeck(null)}
        >
          Flashcards
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <DecksPage user={user} onSelectDeck={setSelectedDeck} />
    </div>
  )
}