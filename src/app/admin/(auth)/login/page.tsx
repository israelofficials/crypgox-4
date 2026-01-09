'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

const LoginFallback = () => (
  <main className="flex min-h-screen items-center justify-center bg-[#050916] px-6 text-white">
    <div className="w-full max-w-sm space-y-6 rounded-3xl border border-white/10 bg-[#0b1220]/80 p-8 backdrop-blur">
      <div className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Admin</p>
        <h1 className="text-2xl font-semibold">Secure Console Login</h1>
        <p className="text-sm text-white/60">Preparing the console…</p>
      </div>
    </div>
  </main>
)

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginContent />
    </Suspense>
  )
}

function AdminLoginContent() {
  const { login, isLoading, error, clearError } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    clearError()
    setIsSubmitting(true)
    try {
      await login(username, password)
      // Don't manually redirect - let AdminAuthContext useEffect handle it
      // This ensures the admin state is properly set and cookie is available
      // The useEffect will redirect when admin is set and we're on login page
    } catch {
      // error handled by context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050916] px-6 text-white">
      <div className="w-full max-w-sm space-y-6 rounded-3xl border border-white/10 bg-[#0b1220]/80 p-8 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Admin</p>
          <h1 className="text-2xl font-semibold">Secure Console Login</h1>
          <p className="text-sm text-white/60">Enter your credentials to access the dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-xs uppercase tracking-wide text-white/50">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              placeholder="admin@crypgox.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-xs uppercase tracking-wide text-white/50">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-emerald-400"
              placeholder="••••••••"
            />
          </div>

          {(error && !isSubmitting) && (
            <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!username || !password || isSubmitting || isLoading}
            className={`w-full rounded-full py-3 text-sm font-semibold transition-transform ${
              username && password
                ? 'bg-gradient-to-r from-primary to-emerald-400 text-black hover:scale-[1.01]'
                : 'bg-white/10 text-white/50'
            } ${isSubmitting || isLoading ? 'opacity-70' : ''}`}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="text-center text-xs text-white/40">
          <p>Need help? Contact the operations lead.</p>
          <Link href="/" className="mt-2 inline-block text-emerald-400">
            Back to main site
          </Link>
        </div>
      </div>
    </main>
  )
}
