import { useState, useRef } from 'react'
import { useCards, type Card } from '../hooks/useCards'
import { exportDeckAsCSV, parseCSV } from '../lib/csv'
import type { Deck } from '../hooks/useDecks'

interface Props {
  deck: Deck
  onBack: () => void
  onStudy: () => void
}

export default function CardsPage({ deck, onBack, onStudy }: Props) {
  const { cards, loading, createCard, deleteCard, updateCard } = useCards(deck.id)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleCreate() {
    if (!question.trim() || !answer.trim()) { setError('Please fill in all fields.'); return }
    setCreating(true)
    const err = await createCard(question.trim(), answer.trim())
    if (err) setError(err)
    else { setQuestion(''); setAnswer(''); setShowForm(false) }
    setCreating(false)
  }

  async function handleUpdate() {
    if (!editingCard) return
    await updateCard(editingCard.id, editQuestion, editAnswer)
    setEditingCard(null)
  }

  function handleExport() {
    exportDeckAsCSV(deck.name, cards)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    const text = await file.text()
    const parsed = parseCSV(text)
    for (const card of parsed) {
      await createCard(card.question, card.answer)
    }
    setImporting(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back
        </button>
        <h2 className="text-2xl font-medium text-gray-900 flex-1">{deck.name}</h2>
        {cards.length > 0 && (
          <button
            onClick={onStudy}
            className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Study
          </button>
        )}
        <button
          onClick={handleExport}
          className="text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          Export CSV
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Import CSV'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
        >
          + New Card
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Question</label>
            <input
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Enter question"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 mb-1">Answer</label>
            <textarea
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Enter answer"
              rows={3}
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
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No cards yet. Create your first card or import a CSV!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => (
            <div key={card.id} className="bg-white border border-gray-200 rounded-xl p-5">
              {editingCard?.id === card.id ? (
                <div>
                  <input
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={editQuestion}
                    onChange={e => setEditQuestion(e.target.value)}
                  />
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                    value={editAnswer}
                    onChange={e => setEditAnswer(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingCard(null)}
                      className="text-xs text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{card.question}</p>
                    <p className="text-sm text-gray-500 mt-1">{card.answer}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingCard(card)
                        setEditQuestion(card.question)
                        setEditAnswer(card.answer)
                      }}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCard(card.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}