'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            WagerGenie
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Your AI-powered sports betting assistant
          </p>
          <Link 
            href="/app" 
            className="genie-button text-lg px-8 py-4 inline-block"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Picks</h3>
            <p className="text-gray-300">Get access to winning picks analyzed by our advanced AI algorithms.</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Smart Analytics</h3>
            <p className="text-gray-300">Detailed stats and trends to help you make informed betting decisions.</p>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Personal Assistant</h3>
            <p className="text-gray-300">Ask questions and get personalized betting advice anytime.</p>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 text-sm mb-8">Trusted by thousands of bettors worldwide</p>
        <div className="flex justify-center space-x-8">
          <div className="flex items-center text-white">
            <span className="text-2xl mr-2">⭐</span>
            <div>
              <div className="font-semibold">4.9/5 Rating</div>
              <div className="text-sm text-gray-400">from 500+ users</div>
            </div>
          </div>
          <div className="flex items-center text-white">
            <span className="text-2xl mr-2">🏆</span>
            <div>
              <div className="font-semibold">65% Win Rate</div>
              <div className="text-sm text-gray-400">on premium picks</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 