'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPicks();
  }, []);

  const fetchPicks = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('picks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPicks(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2">Total Picks</h3>
          <p className="text-3xl font-bold text-purple-400">{picks.length}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2">Average Confidence</h3>
          <p className="text-3xl font-bold text-purple-400">
            {picks.length > 0
              ? Math.round(picks.reduce((acc, pick) => acc + pick.confidence, 0) / picks.length)
              : 0}%
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-2">Win Rate</h3>
          <p className="text-3xl font-bold text-purple-400">65%</p>
        </div>
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
          {picks.length === 0 && (
            <p className="text-gray-400 text-center py-4">No picks yet. Start by asking the Genie!</p>
          )}
        </div>
      </div>
    </div>
  );
} 