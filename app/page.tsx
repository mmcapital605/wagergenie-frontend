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
        // First try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: email.split('@')[0],
              plan: 'free'
            }
          }
        })

        if (signUpError) {
          throw signUpError
        }

        // If sign up successful, try immediate sign in
        if (signUpData.user) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (!signInError) {
            router.push('/genie')
            return
          }
        }

        setMessage('Account created! You can now sign in.')
        setIsSignUp(false) // Switch to sign in mode
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError
        
        router.push('/genie')
      }
    } catch (error: any) {
      console.error('Error:', error)
      if (error.message.includes('Email rate limit exceeded')) {
        setMessage('Please wait a moment before trying again.')
      } else if (error.message.includes('User already registered')) {
        setMessage('This email is already registered. Please sign in.')
        setIsSignUp(false)
      } else {
        setMessage(error.message || 'Something went wrong. Please try again.')
      }
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
            <p className="text-2xl text-blue-200 max-w-2xl mx-auto mb-8">
              Your personal AI betting assistant that grants winning predictions
            </p>
            <p className="text-lg text-blue-200/80 max-w-3xl mx-auto">
              Powered by advanced AI, WagerGenie analyzes millions of data points across sports events, 
              player statistics, and historical trends to grant your wishes for successful betting predictions.
            </p>
          </div>

          {/* Example Interaction */}
          <div className="w-full max-w-2xl mx-auto mb-16 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Example Interaction</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 rounded-lg p-4 text-white text-left flex-1">
                  "Hey WagerGenie, what's your prediction for tonight's Lakers vs Warriors game?"
                </div>
              </div>
              <div className="flex items-start gap-4 justify-end">
                <div className="bg-purple-500/20 rounded-lg p-4 text-white text-left flex-1">
                  <p className="mb-2">🧞‍♂️ Based on my analysis:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Warriors are favored by 3.5 points</li>
                    <li>Historical head-to-head: Warriors won 7 of last 10</li>
                    <li>Key stat: Curry averaging 32.5 pts in last 5 games</li>
                    <li>Confidence: 85% Warriors to cover the spread</li>
                  </ul>
                  <p className="mt-2 text-sm">Would you like detailed insights into player props and other betting options? 🎯</p>
                </div>
              </div>
            </div>
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
                <div className={`text-sm ${message.includes('check your email') ? 'text-green-400' : 'text-red-400'}`}>
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

          {/* Features Grid */}
          <div className="mt-24 grid md:grid-cols-3 gap-8">
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-4">AI-Powered Predictions</h3>
                <p className="text-blue-200">Get precise predictions based on comprehensive data analysis and machine learning</p>
              </div>
            </div>
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                <div className="text-4xl mb-4">⚡️</div>
                <h3 className="text-xl font-semibold mb-4">Real-time Insights</h3>
                <p className="text-blue-200">Access live odds, injury updates, and betting opportunities as they happen</p>
              </div>
            </div>
            <div className="text-center text-white transform hover:scale-105 transition">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-4">Performance Tracking</h3>
                <p className="text-blue-200">Monitor your success rate and get personalized betting strategy improvements</p>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex flex-wrap justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span>85% Accuracy Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">👥</span>
                <span>10,000+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <span>All Major Sports</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 