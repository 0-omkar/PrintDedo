import Link from 'next/link';
import { Shield } from 'lucide-react';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';

interface AdminLoginScreenProps {
  adminEmail: string;
  setAdminEmail: (email: string) => void;
  adminPassword: string;
  setAdminPassword: (pass: string) => void;
  loginError: string | null;
  onLogin: (e: React.FormEvent) => void;
}

export const AdminLoginScreen = ({
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  loginError,
  onLogin,
}: AdminLoginScreenProps) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm">
        <div className="bg-yellow-400 p-4.5 rounded-3xl shadow-sm mb-6 inline-flex items-center justify-center">
          <Shield className="w-10 h-10 text-black" />
        </div>

        <h1 className="text-3xl font-black mb-1 tracking-tight text-slate-950 uppercase text-center">PrintDedo Admin</h1>
        <p className="text-slate-500 mb-8 text-xs font-bold tracking-widest text-center uppercase">Console Authentication</p>

        <form onSubmit={onLogin} className="flex flex-col space-y-4.5 w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left">
          {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center">{loginError}</div>}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Email</label>
            <input 
              type="email" 
              placeholder="admin@example.com" 
              value={adminEmail} 
              onChange={(e) => setAdminEmail(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
              required
              maxLength={120}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={adminPassword} 
              onChange={(e) => setAdminPassword(e.target.value)} 
              className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
              required
              maxLength={128}
            />
          </div>

          <button 
            type="submit" 
            className="bg-yellow-400 text-black font-bold p-3.5 rounded-xl mt-2 hover:bg-yellow-500 transition-colors flex justify-center items-center cursor-pointer shadow-sm text-sm border-none"
          >
            Authenticate Admin
          </button>
        </form>
        
        <div className="mt-8">
          <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-650 transition-colors">← Back to Home</Link>
        </div>
      </main>
    </div>
  );
};
