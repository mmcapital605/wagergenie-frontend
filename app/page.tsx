'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export default function Home() {
  const [isSignIn, setIsSignIn] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: email.split('@')[0],
            }
          }
        })
        if (error) throw error
      }
    } catch (error) {
      console.error('Error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-600 to-blue-600">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row items-center">
          {/* Left side - Content */}
          <div className="lg:w-1/2 text-center lg:text-left text-white">
            <h1 className="text-5xl font-bold mb-6">
              WagerGenie
              <span className="text-blue-300"> AI</span>
            </h1>
            <p className="text-xl mb-8">
              Your intelligent sports betting assistant powered by artificial intelligence.
              Get winning picks and real-time analysis.
            </p>
            <div className="flex flex-col lg:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => setIsSignIn(true)}
                className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-opacity-90 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => setIsSignIn(false)}
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Right side - Auth Form */}
          <div className="lg:w-1/2 mt-12 lg:mt-0">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {isSignIn ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : isSignIn ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24 grid md:grid-cols-3 gap-12">
          <div className="text-center text-white">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
              <p>Get intelligent predictions and insights based on comprehensive data analysis</p>
            </div>
          </div>
          <div className="text-center text-white">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
              <p>Stay informed with live odds updates and betting opportunities</p>
            </div>
          </div>
          <div className="text-center text-white">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Track Record</h3>
              <p>Monitor your betting performance and improve your strategy</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 