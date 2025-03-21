'use client';

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Pick {
  id: string
  sport: string
  match: string
  prediction: string
  confidence: number
  result?: 'win' | 'loss' | 'pending'
  explanation: string
  date: string
}

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export default function GeniePlatform() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [picks, setPicks] = useState<Pick[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedTab, setSelectedTab] = useState<'picks' | 'chat' | 'packages'>('picks')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()
    fetchPicks()
    fetchMessages()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/')
    } else {
      setUser(session.user)
      setLoading(false)
    }
  }

  const fetchPicks = async () => {
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .order('date', { ascending: false })
    
    if (data) setPicks(data)
  }

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true })
    
    if (data) setMessages(data)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // TODO: Integrate with actual AI backend
    // For now, simulate a response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm analyzing the latest data for your request. I'll have a detailed prediction ready shortly! 🧞‍♂️",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, response])
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-purple-800">
      <nav className="bg-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl text-white font-bold flex items-center">
                <span className="mr-2">🧞‍♂️</span> WagerGenie
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedTab('picks')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTab === 'picks' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Picks
                </button>
                <button
                  onClick={() => setSelectedTab('chat')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTab === 'chat' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setSelectedTab('packages')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedTab === 'packages' ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Packages
                </button>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {selectedTab === 'picks' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-6">Today's Top Picks 🎯</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {picks.map(pick => (
                  <div key={pick.id} className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold">{pick.sport}</h3>
                        <p className="text-white/70">{pick.match}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        pick.result === 'win' ? 'bg-green-500/20 text-green-300' :
                        pick.result === 'loss' ? 'bg-red-500/20 text-red-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {pick.result || 'Pending'}
                      </span>
                    </div>
                    <p className="mb-4">{pick.prediction}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-sm text-white/70">Confidence:</span>
                        <span className="ml-2 text-sm font-semibold">{pick.confidence}%</span>
                      </div>
                      <span className="text-sm text-white/70">{new Date(pick.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'chat' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white h-[calc(100vh-12rem)]">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl rounded-lg p-4 ${
                      message.role === 'user' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask WagerGenie anything..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {selectedTab === 'packages' && (
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Basic Wish 🌟</h3>
              <p className="text-3xl font-bold mb-6">$29<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Daily Top Pick
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Basic Analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Community Chat
                </li>
              </ul>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition">
                Choose Plan
              </button>
            </div>

            <div className="bg-gradient-to-b from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 text-white border border-purple-500/30 transform scale-105">
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 rounded-tr-xl rounded-bl-xl text-sm">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Wishes ⭐️</h3>
              <p className="text-3xl font-bold mb-6">$79<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> All Basic Features
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> 5 Daily Premium Picks
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Advanced Analytics
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Priority Support
                </li>
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:opacity-90 transition">
                Choose Plan
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Infinite Wishes 🌈</h3>
              <p className="text-3xl font-bold mb-6">$199<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <span className="mr-2">✓</span> All Premium Features
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> Unlimited Picks
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> 1-on-1 Consulting
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span> VIP Community Access
                </li>
              </ul>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition">
                Choose Plan
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 