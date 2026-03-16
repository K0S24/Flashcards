import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  onSignOut: () => void
}

export default function DashboardPage({ user, onSignOut }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-medium text-gray-900">Flashcards</h1>
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

      <main className="max-w-2xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-medium text-gray-900 mb-1">Dashboard</h2>
        <p className="text-sm text-gray-500">Ready to learn?</p>
      </main>
    </div>
  )
}