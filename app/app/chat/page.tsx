'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

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
      
      // Add Genie's response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);

      // Save the interaction to the database
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { error } = await supabase
          .from('picks')
          .insert([
            {
              user_id: session.user.id,
              question: userMessage,
              answer: randomResponse,
              confidence: Math.floor(Math.random() * 30) + 65, // Random confidence between 65-95
              sport: 'NBA', // For MVP, we'll use NBA as default
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 text-gray-300'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the Genie about sports betting..."
          className="input-field flex-1"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="genie-button px-6"
          disabled={isLoading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
} 