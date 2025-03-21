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

// Sample data to show while fetching from Supabase
const samplePicks: Pick[] = [
  {
    id: '1',
    sport: 'NFL',
    match: 'Kansas City Chiefs vs. Baltimore Ravens',
    prediction: 'Chiefs -3.5',
    confidence: 85,
    result: 'win',
    explanation: 'Chiefs offense has been unstoppable at home.',
    date: new Date().toISOString()
  },
  {
    id: '2',
    sport: 'NBA',
    match: 'Boston Celtics vs. Los Angeles Lakers',
    prediction: 'Over 219.5',
    confidence: 78,
    result: 'pending',
    explanation: 'Both teams have been scoring at high rates in their last 5 games.',
    date: new Date().toISOString()
  },
  {
    id: '3',
    sport: 'MLB',
    match: 'New York Yankees vs. Houston Astros',
    prediction: 'Yankees ML',
    confidence: 72,
    result: 'pending',
    explanation: 'Yankees are starting their ace pitcher with a strong home record.',
    date: new Date().toISOString()
  },
  {
    id: '4',
    sport: 'UFC',
    match: 'Jon Jones vs. Stipe Miocic',
    prediction: 'Jones by KO/TKO',
    confidence: 81,
    result: 'pending',
    explanation: 'Jones has significant reach and striking advantages.',
    date: new Date().toISOString()
  },
  {
    id: '5',
    sport: 'NHL',
    match: 'Toronto Maple Leafs vs. Montreal Canadiens',
    prediction: 'Under 5.5 Goals',
    confidence: 76,
    result: 'loss',
    explanation: 'Both teams have strong goalies and have played low-scoring games recently.',
    date: new Date().toISOString()
  },
  {
    id: '6',
    sport: 'Soccer',
    match: 'Manchester City vs. Liverpool',
    prediction: 'Both Teams to Score',
    confidence: 88,
    result: 'win',
    explanation: 'Both teams are offensive powerhouses with some defensive weaknesses.',
    date: new Date().toISOString()
  }
];

const sampleMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, I need some good picks for NFL games this weekend',
    role: 'user',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    content: "I've analyzed the upcoming NFL matchups and have three strong recommendations for you. The Chiefs are favored at home against the Bengals, and I'm seeing value in taking the Chiefs to cover. The Bills vs Jets game looks like it will be a low-scoring affair, so consider the under. And for a value pick, the Lions have a good chance to upset the Vikings based on current form.",
    role: 'assistant',
    timestamp: new Date(Date.now() - 3500000)
  },
  {
    id: '3',
    content: 'Thanks! What about NBA games tonight?',
    role: 'user',
    timestamp: new Date(Date.now() - 1800000)
  },
  {
    id: '4',
    content: "For NBA games tonight, I like the Celtics to cover against the Lakers. The Celtics' perimeter defense matches up well against the Lakers' shooters. The Bucks vs 76ers game has value on the over, as both teams have been scoring well and have defensive injuries. I'd avoid the Suns vs Warriors game as it's too unpredictable with recent roster changes.",
    role: 'assistant',
    timestamp: new Date(Date.now() - 1700000)
  }
];

export default function GeniePlatform() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [picks, setPicks] = useState<Pick[]>(samplePicks)
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState('')
  const [selectedTab, setSelectedTab] = useState<'picks' | 'chat' | 'packages'>('picks')
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUser()
    fetchData()
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

  const fetchData = async () => {
    try {
      // Attempt to fetch real data
      const { data: picksData } = await supabase
        .from('picks')
        .select('*')
        .order('date', { ascending: false })
      
      if (picksData && picksData.length > 0) {
        setPicks(picksData)
      }

      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('timestamp', { ascending: true })
      
      if (messagesData && messagesData.length > 0) {
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      // Keep sample data if fetch fails
    }
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

    // Simulate AI response
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

            <div className="bg-gradient-to-b from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 text-white border border-purple-500/30 transform scale-105 relative">
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