import { useState } from 'react'
import { useDecks, type Deck } from '../hooks/useDecks'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  onSelectDeck: (deck: Deck) => void
}

export default function DecksPage({ user, onSelectDeck }: Props) {
  const { decks, loading, createDeck, deleteDeck } = useDecks(user.id)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  async function handleCreate() {
    if (!name.trim()) { setError('Please enter a name.'); return }
    setCreating(true)
    const err = await createDeck(name.trim(), description.trim())
    if (err) setError(err)
    else { setName(''); setDescription(''); setShowForm(false) }
    setCreating(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-gray-900">My Decks</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + New Deck
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Name</label>
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Biology"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Description (optional)</label>
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this deck about?"
            />
          </div>
          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError('') }}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : decks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No decks yet. Create your first deck!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {decks.map(deck => (
            <div
              key={deck.id}
              className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer"
              onClick={() => onSelectDeck(deck)}
            >
              <div>
                <p className="font-medium text-gray-900">{deck.name}</p>
                {deck.description && (
                  <p className="text-sm text-gray-500 mt-0.5">{deck.description}</p>
                )}
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteDeck(deck.id) }}
                className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}