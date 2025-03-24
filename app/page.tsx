'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [picks, setPicks] = useState<any[]>([]);
  const [question, setQuestion] = useState('');
  const [genieResponse, setGenieResponse] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchPicks();
      }
    };
    checkUser();
  }, []);

  const fetchPicks = async () => {
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setPicks(data);
    if (error) console.error('Error fetching picks:', error);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // For MVP, we'll use the email as a password for magic link
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: email, // Using email as password for MVP
      });

      if (signUpError) throw signUpError;

      alert('Check your email for the login link!');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPicks([]);
    router.refresh();
  };

  const askGenie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsAsking(true);
    setGenieResponse(null);

    try {
      // For MVP, we'll use a simple response system
      const mockResponses = [
        "Based on my analysis, I recommend betting on the home team with a 75% confidence level.",
        "The odds are in favor of the underdog today. Consider a small bet with 65% confidence.",
        "This game is too close to call. I recommend staying away from this bet.",
        "The over/under looks promising. Consider the over with 70% confidence.",
        "The spread seems accurate. No strong recommendation for this game."
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setGenieResponse(randomResponse);

      // Save the pick to the database
      const { error } = await supabase
        .from('picks')
        .insert([
          {
            user_id: user.id,
            question,
            answer: randomResponse,
            confidence: Math.floor(Math.random() * 30) + 65, // Random confidence between 65-95
            sport: 'NBA', // For MVP, we'll use NBA as default
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      fetchPicks(); // Refresh picks list
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-gray-800/50 rounded-xl shadow-lg p-8 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
            WagerGenie
          </h1>
          <p className="text-center text-gray-300 mb-8">
            Your AI-powered sports betting assistant
          </p>
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field"
              required
            />
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            <button type="submit" className="genie-button w-full">
              Start Winning Now
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Welcome to WagerGenie
        </h1>
        <button onClick={handleSignOut} className="genie-button">
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Ask the Genie</h2>
          <form onSubmit={askGenie} className="space-y-4">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about any sports bet..."
              className="input-field h-32 resize-none"
              required
            />
            <button 
              type="submit" 
              className="genie-button w-full"
              disabled={isAsking}
            >
              {isAsking ? 'Consulting the Genie...' : 'Ask the Genie'}
            </button>
          </form>
          {genieResponse && (
            <div className="mt-6 p-4 bg-purple-900/30 rounded-lg">
              <p className="text-lg">{genieResponse}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-4">Recent Picks</h2>
          <div className="space-y-4">
            {picks.map((pick, index) => (
              <div key={index} className="bg-purple-900/30 rounded-lg p-4">
                <p className="font-medium">{pick.question}</p>
                <p className="text-sm text-gray-300 mt-2">{pick.answer}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-purple-400">Confidence: {pick.confidence}%</span>
                  <span className="text-sm text-gray-400 ml-4">{new Date(pick.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 