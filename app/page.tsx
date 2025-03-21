'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      alert('Magic link sent! Check your email.')
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 relative overflow-hidden">
      {/* Magical sparkles effect */}
      <div className="absolute inset-0 bg-[url('/sparkles.png')] opacity-20 animate-twinkle"></div>
      
      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Logo and Genie */}
          <div className="mb-12">
            <div className="text-7xl mb-4">🧞‍♂️</div>
            <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
              WagerGenie
            </h1>
            <p className="text-2xl text-blue-200 max-w-2xl mx-auto">
              Your wish is my command! Get magical sports betting predictions powered by AI
            </p>
          </div>

          {/* Simplified Magic Link Sign In */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md mx-auto border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">
              Make a Wish ✨
            </h2>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email for instant access"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform group-hover:translate-y-0 -translate-y-full transition-transform"></span>
                <span className="relative">
                  {loading ? 'Casting Spell...' : 'Grant Me Access 🪄'}
                </span>
              </button>
            </form>
          </div>

          {/* Magical Features */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-4">Magical Predictions</h3>
                <p className="text-blue-200">AI-powered picks that seem like magic</p>
              </div>
            </div>
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-4xl mb-4">⚡️</div>
                <h3 className="text-xl font-semibold mb-4">Instant Insights</h3>
                <p className="text-blue-200">Real-time updates at your fingertips</p>
              </div>
            </div>
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-4">Winning Strategy</h3>
                <p className="text-blue-200">Track and improve your success rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 