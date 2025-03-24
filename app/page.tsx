'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: '✨ Magic link sent! Check your email to sign in.'
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 via-blue-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🧞‍♂️</div>
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            WagerGenie
          </h1>
          <p className="text-gray-400">Your AI Sports Betting Assistant</p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Start Winning Today
          </h2>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
                disabled={loading}
              />
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                  Sending Magic Link...
                </div>
              ) : (
                'Get Started →'
              )}
            </button>
          </form>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-medium text-white mb-1">AI-Powered Picks</h3>
            <p className="text-sm text-gray-400">Get winning picks backed by advanced AI analysis</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-medium text-white mb-1">Chat with Genie</h3>
            <p className="text-sm text-gray-400">Get personalized betting advice 24/7</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-white mb-1">Track Performance</h3>
            <p className="text-sm text-gray-400">Monitor your betting success with detailed analytics</p>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4">
            <div className="text-2xl mb-2">🔒</div>
            <h3 className="font-medium text-white mb-1">Risk Management</h3>
            <p className="text-sm text-gray-400">Smart bankroll management suggestions</p>
          </div>
        </div>
      </div>
    </div>
  );
} 