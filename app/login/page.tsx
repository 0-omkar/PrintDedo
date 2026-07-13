'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center py-2 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

      <main className="relative z-10 flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight text-slate-950">Shop Owner Login</h1>
        
        <form onSubmit={handleLogin} className="flex flex-col space-y-4 w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-2">{error}</div>}
          
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            className="p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            className="p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" 
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-yellow-400 text-black font-bold p-3 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 flex flex-col items-center space-y-4">
           <p className="text-sm text-slate-600">
             Don't have an account? <Link href="/signup" className="text-yellow-600 font-semibold hover:text-yellow-700 hover:underline">Register your shop</Link>
           </p>
          <Link href="/" className="text-sm text-slate-500 hover:text-yellow-600 transition-colors">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
