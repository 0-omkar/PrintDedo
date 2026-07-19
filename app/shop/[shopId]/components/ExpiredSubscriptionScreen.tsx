import Link from 'next/link';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';

interface ExpiredSubscriptionScreenProps {
  storeName?: string;
}

export const ExpiredSubscriptionScreen = ({ storeName }: ExpiredSubscriptionScreenProps) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 mb-6 text-yellow-500 animate-pulse">
          <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center text-slate-950 uppercase w-full">
          {storeName}
        </h1>
        
        <p className="text-slate-500 text-center text-xs font-semibold tracking-wide uppercase mt-2 w-full mb-8">
          XEROX • PRINT • SCAN • LAMINATION
        </p>

        <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6.5 w-full shadow-sm text-center space-y-4">
          <h2 className="text-lg font-black text-yellow-800 uppercase tracking-tight">Service Suspended</h2>
          <p className="text-xs text-yellow-750 font-semibold leading-relaxed">
            This shop's print dropbox portal is temporarily disabled due to an expired subscription.
          </p>
          <Link 
            href="/renew"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 px-6 rounded-xl transition shadow-sm border-none cursor-pointer text-sm block w-full text-center"
          >
            Contact Admin to Renew
          </Link>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-650 transition-colors">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
};
