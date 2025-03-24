'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading your magical dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black">
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link 
                href="/app/dashboard" 
                className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 flex items-center"
              >
                <span className="mr-2">🧞‍♂️</span>
                WagerGenie
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/app/dashboard" 
                className="text-gray-300 hover:text-white transition-colors flex items-center"
              >
                <span className="mr-1">📊</span>
                Dashboard
              </Link>
              <Link 
                href="/app/chat" 
                className="text-gray-300 hover:text-white transition-colors flex items-center"
              >
                <span className="mr-1">💬</span>
                Chat
              </Link>
              <Link 
                href="/app/settings" 
                className="text-gray-300 hover:text-white transition-colors flex items-center"
              >
                <span className="mr-1">⚙️</span>
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
} 