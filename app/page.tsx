'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Printer, ArrowRight, Zap, Shield, Clock, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check for current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      
      // If we are already logged in (or just came back from an email link), 
      // instantly redirect to dashboard automatically
      if (session) {
        router.push('/dashboard');
      }
    });

    // Listen for auth state changes (e.g., when the magic link in email is clicked)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white font-sans text-slate-900 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50 blur-3xl opacity-60 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:py-6 max-w-6xl mx-auto w-full select-none">
        {/* Left: Brand Name & Logo */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="bg-yellow-400 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-sm hover:scale-105 transition-transform duration-200">
            <Printer className="w-6 h-6 md:w-8 h-8 text-black" />
          </div>
          <span className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-950 select-none">
            Xerox<span className="text-yellow-500">Flow</span>
          </span>
        </div>

        {/* Right: Admin Login Link */}
        <Link href="/admin" className="text-sm md:text-base font-bold text-slate-600 hover:text-yellow-500 transition-colors">
          Admin Login
        </Link>
      </nav>

      {/* Main Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto text-center px-6 w-full py-4">
        {/* Tagline Badge */}
        <div className="inline-flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full mb-4 shadow-sm select-none">
          <span className="flex h-2 w-2 rounded-full bg-yellow-400" />
          <span className="text-xs font-semibold tracking-wide text-slate-600">Simple. Fast. Reliable.</span>
        </div>

        {/* Main Title Line */}
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-[1.15] text-slate-950 select-none">
          A clean print queue
          <br className="hidden md:block" />
          for modern Xerox shops.
        </h1>

        {/* Subtitle Description */}
        <p className="text-sm md:text-base text-slate-600 max-w-xl mb-6 leading-relaxed select-none">
          Real-time orders, instant pricing, and a smooth upload flow. Everything your shop needs to stay organized.
        </p>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mb-8">
          <Link href="/login" className="group flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-3 bg-yellow-400 text-black rounded-xl font-bold hover:bg-yellow-500 transition-all shadow-sm">
            <span>Log in to your shop</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left w-full">
          <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <Zap className="w-5 h-5 text-yellow-500 mb-2" />
            <h3 className="text-base font-bold mb-1.5 text-slate-950">Instant Quotes</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Auto-calculate pages and prices before customers submit.</p>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <Clock className="w-5 h-5 text-yellow-500 mb-2" />
            <h3 className="text-base font-bold mb-1.5 text-slate-950">Live Queue</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">See new orders instantly and keep the workflow moving.</p>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <Shield className="w-5 h-5 text-yellow-500 mb-2" />
            <h3 className="text-base font-bold mb-1.5 text-slate-950">Secure Storage</h3>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed">Uploads are stored safely and easy to access when needed.</p>
          </div>
        </div>
      </main>

      {/* Footer credits */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-slate-100 bg-white/80 backdrop-blur-sm select-none">
        <p className="text-xs md:text-sm text-slate-500 font-medium">
          Founded by -{' '}
          <Link href="#" className="text-slate-800 hover:text-yellow-600 hover:underline font-bold transition-colors">
            Omkar Varpe
          </Link>
          ,{' '}
          <Link href="#" className="text-slate-800 hover:text-yellow-600 hover:underline font-bold transition-colors">
            Pradeep Biswas
          </Link>
          ,{' '}
          <Link href="#" className="text-slate-800 hover:text-yellow-600 hover:underline font-bold transition-colors">
            Yajan Metha
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
