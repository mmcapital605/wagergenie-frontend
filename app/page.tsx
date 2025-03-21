'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      if (isSignUp) {
        // Try sign up first
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
              plan: 'free'
            }
          }
        })

        if (error) {
          if (error.message.includes('already registered')) {
            // Already registered, try to sign in
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            })
            
            if (signInError) {
              throw signInError
            } else {
              router.push('/genie')
              return
            }
          }
          throw error
        }

        // If we get here, sign up was successful
        if (data.user) {
          // Auto sign in after sign up
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })
          
          if (!signInError) {
            router.push('/genie')
            return
          }
        }
      } else {
        // Regular sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error
        
        router.push('/genie')
      }
    } catch (error: any) {
      console.error('Error:', error)
      setMessage(error.message || 'Authentication failed. Please check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-2 h-2 bg-white rounded-full top-[10%] left-[25%] animate-twinkle"></div>
        <div className="absolute w-3 h-3 bg-white rounded-full top-[15%] left-[45%] animate-twinkle delay-75"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[25%] left-[65%] animate-twinkle delay-100"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[45%] left-[15%] animate-twinkle delay-150"></div>
        <div className="absolute w-3 h-3 bg-white rounded-full top-[65%] left-[35%] animate-twinkle delay-200"></div>
        <div className="absolute w-2 h-2 bg-white rounded-full top-[75%] left-[75%] animate-twinkle delay-300"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header and Hero */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 flex items-center justify-center">
            <span className="text-6xl md:text-7xl mr-4">🧞‍♂️</span> WagerGenie
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 max-w-2xl">
            Your AI-powered betting assistant that grants your wishes for winning picks.
          </p>
        </div>

        {/* Updated Sign Up Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md mx-auto border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">
            {isSignUp ? 'Make Your First Wish ✨' : 'Welcome Back! 🧞‍♂️'}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
                minLength={6}
              />
            </div>
            {message && (
              <div className="text-red-400 text-sm">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 group relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 transform group-hover:translate-y-0 -translate-y-full transition-transform"></span>
              <span className="relative">
                {loading ? 'Summoning Genie...' : (isSignUp ? 'Start Winning Now 🎯' : 'Sign In 🎯')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="w-full text-white/70 hover:text-white text-sm transition"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </form>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Picks</h3>
            <p className="text-purple-200">Get access to winning picks analyzed by our advanced AI algorithms.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-2">Smart Analytics</h3>
            <p className="text-purple-200">Detailed stats and trends to help you make informed betting decisions.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">Personal Assistant</h3>
            <p className="text-purple-200">Ask questions and get personalized betting advice anytime.</p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-white/70 text-sm">Trusted by thousands of bettors worldwide</p>
          <div className="flex justify-center space-x-8 mt-4">
            <div className="flex items-center text-white">
              <span className="text-2xl mr-2">⭐</span>
              <div>
                <div className="font-semibold">4.9/5 Rating</div>
                <div className="text-sm text-white/70">from 500+ users</div>
              </div>
            </div>
            <div className="flex items-center text-white">
              <span className="text-2xl mr-2">🏆</span>
              <div>
                <div className="font-semibold">65% Win Rate</div>
                <div className="text-sm text-white/70">on premium picks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 