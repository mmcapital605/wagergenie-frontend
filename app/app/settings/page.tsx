'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  riskTolerance: 'low' | 'medium' | 'high';
  favoriteSports: string[];
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    pushNotifications: false,
    riskTolerance: 'medium',
    favoriteSports: []
  });

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);
      // TODO: Fetch user preferences from database
      setLoading(false);
    };

    getUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    // TODO: Save preferences to database
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
          Account Settings
        </h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Profile</h2>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-300">Email: {user?.email}</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-purple-500 rounded focus:ring-purple-500 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Email Notifications</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(e) => handlePreferenceChange('pushNotifications', e.target.checked)}
                className="form-checkbox h-5 w-5 text-purple-500 rounded focus:ring-purple-500 focus:ring-offset-gray-800"
              />
              <span className="text-gray-300">Push Notifications</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Risk Tolerance</h2>
          <select
            value={preferences.riskTolerance}
            onChange={(e) => handlePreferenceChange('riskTolerance', e.target.value)}
            className="w-full bg-gray-700/50 text-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="low">Conservative</option>
            <option value="medium">Moderate</option>
            <option value="high">Aggressive</option>
          </select>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-2">Favorite Sports</h2>
          <div className="grid grid-cols-2 gap-3">
            {['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'UFC'].map((sport) => (
              <label key={sport} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={preferences.favoriteSports.includes(sport)}
                  onChange={(e) => {
                    const newSports = e.target.checked
                      ? [...preferences.favoriteSports, sport]
                      : preferences.favoriteSports.filter(s => s !== sport);
                    handlePreferenceChange('favoriteSports', newSports);
                  }}
                  className="form-checkbox h-5 w-5 text-purple-500 rounded focus:ring-purple-500 focus:ring-offset-gray-800"
                />
                <span className="text-gray-300">{sport}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors mt-4"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
} 