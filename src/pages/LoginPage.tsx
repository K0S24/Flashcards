import { useState } from 'react'

interface Props {
  onSignIn: (email: string, password: string) => Promise<string | null>
  onSignUp: (email: string, password: string) => Promise<string | null>
}

export default function LoginPage({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  async function handleSubmit() {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Bitte alle Felder ausfüllen.'); return }
    setLoading(true)

    if (mode === 'register') {
      if (password !== password2) { setError('Passwörter stimmen nicht überein.'); setLoading(false); return }
      if (password.length < 6) { setError('Passwort mind. 6 Zeichen.'); setLoading(false); return }
      const err = await onSignUp(email, password)
      if (err) setError(err)
      else setSuccess('Konto erstellt! Bitte E-Mail bestätigen.')
    } else {
      const err = await onSignIn(email, password)
      if (err) setError('E-Mail oder Passwort falsch.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8">
        <h1 className="text-xl font-medium text-gray-900 mb-1">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {mode === 'login' ? 'Continue where you left off.' : 'Start your learning journey.'}
        </p>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-500 mb-1">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {mode === 'register' && (
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Confirm password</label>
            <input
              type="password"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              placeholder="Repeat password"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
        {success && <p className="text-xs text-green-600 mb-3">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign in' : 'Register'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          {mode === 'login' ? 'No account yet?' : 'Already have an account?'}{' '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }}
            className="text-indigo-600 underline"
          >
            {mode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}