import { Shield, RefreshCw, LogOut, Mail, Star } from 'lucide-react';
import { ActiveView } from '../types';

interface AdminHeaderProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  messagesCount: number;
  onRefresh: () => void;
  onLogout: () => void;
}

export const AdminHeader = ({
  activeView,
  setActiveView,
  messagesCount,
  onRefresh,
  onLogout,
}: AdminHeaderProps) => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-3xl p-6 shadow-sm gap-4">
      <div className="flex items-center space-x-3.5">
        <div className="bg-yellow-400 p-3 rounded-2xl">
          <Shield className="w-6 h-6 text-black" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Admin Console</h1>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">PrintDedo Core System Audit</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
        {/* Screen Navigation Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-200/60 text-xs font-bold">
          <button
            onClick={() => setActiveView('overview')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              activeView === 'overview' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView('plans')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              activeView === 'plans' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Manage Subs
          </button>
          <button
            onClick={() => setActiveView('register')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              activeView === 'register' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Register Shop
          </button>
          <button
            onClick={() => setActiveView('audit')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer border-none ${
              activeView === 'audit' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            Audit Shops
          </button>
          <button
            onClick={() => setActiveView('messages')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border-none ${
              activeView === 'messages' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Inbox</span>
            {messagesCount > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {messagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveView('reviews')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 border-none ${
              activeView === 'reviews' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800 bg-transparent'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span>Platform Reviews</span>
          </button>
        </div>

        <button 
          onClick={onRefresh} 
          className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl transition cursor-pointer text-slate-600 hover:text-yellow-600 border-none bg-white"
          title="Refresh Core Data"
        >
          <RefreshCw className="w-4.5 h-4.5" />
        </button>
        <button 
          onClick={onLogout} 
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition cursor-pointer border-none text-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
