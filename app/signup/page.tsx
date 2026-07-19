'use client';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center py-2 relative overflow-hidden">
      <BackgroundDecorations />

      <main className="relative z-10 flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <div className="bg-yellow-100 p-4 rounded-full border border-yellow-200 mb-6 inline-flex items-center justify-center animate-bounce text-yellow-600">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <h1 className="text-3xl font-black mb-2 tracking-tight text-slate-950 uppercase">Registration Closed</h1>
        <p className="text-slate-500 max-w-sm mb-8 text-sm font-semibold tracking-wide">
          PUBLIC SIGNUPS ARE TEMPORARILY DISABLED. ONLY ADMINISTRATORS CAN PROVISION NEW XEROX SHOPS.
        </p>

        <div className="flex flex-col space-y-4 w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          <p className="text-sm font-medium text-slate-600">
            Please contact the system administrator to request account registration for your print shop.
          </p>
          <Link 
            href="/login" 
            className="bg-yellow-400 text-black font-bold p-3.5 rounded-xl hover:bg-yellow-500 transition-colors flex justify-center items-center cursor-pointer shadow-sm text-sm"
          >
            Go to Log In
          </Link>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
