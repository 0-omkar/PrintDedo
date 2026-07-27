import { Shield, X, Mail, Star, RefreshCw, LogOut, Store, FileText, Layers, BarChart2 } from 'lucide-react';
import { ActiveView } from '../types';
import { BrandLogo } from '@/components/BrandLogo';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  messagesCount: number;
  shopsCount: number;
  onRefresh: () => void;
  onLogout: () => void;
}

export const AdminSidebar = ({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  messagesCount,
  shopsCount,
  onRefresh,
  onLogout,
}: AdminSidebarProps) => {

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Top Header */}
      <div>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <BrandLogo size="lg" href="/" showSubtitle={false} />
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition border-none bg-transparent cursor-pointer"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Console Navigation Menu */}
        <div className="p-4 space-y-2">
          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">
            Console Navigation
          </span>

          {/* Overview (Default) */}
          <button
            onClick={() => { setActiveView('overview'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'overview' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-4.5 h-4.5" />
              <span>Overview</span>
            </div>
            <span className="text-[10px] font-extrabold bg-slate-900/10 text-slate-900 px-2 py-0.5 rounded-full">Default</span>
          </button>

          {/* Manage Subs */}
          <button
            onClick={() => { setActiveView('plans'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'plans' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <FileText className="w-4.5 h-4.5" />
              <span>Manage Subs</span>
            </div>
          </button>

          {/* Register Shop */}
          <button
            onClick={() => { setActiveView('register'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'register' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Store className="w-4.5 h-4.5" />
              <span>Register Shop</span>
            </div>
          </button>

          {/* Audit Shops */}
          <button
            onClick={() => { setActiveView('audit'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'audit' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Shield className="w-4.5 h-4.5" />
              <span>Audit Shops</span>
            </div>
            <span className="text-[10px] font-extrabold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">{shopsCount}</span>
          </button>

          {/* Contact Inbox */}
          <button
            onClick={() => { setActiveView('messages'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'messages' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Mail className="w-4.5 h-4.5" />
              <span>Contact Inbox</span>
            </div>
            {messagesCount > 0 && (
              <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                {messagesCount}
              </span>
            )}
          </button>

          {/* Platform Reviews */}
          <button
            onClick={() => { setActiveView('reviews'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'reviews' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Star className="w-4.5 h-4.5 text-yellow-500 fill-yellow-500" />
              <span>Platform Reviews</span>
            </div>
          </button>

          {/* Analytics */}
          <button
            onClick={() => { setActiveView('analytics'); onClose?.(); }}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
              activeView === 'analytics' ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-2xs' : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/90'
            }`}
          >
            <div className="flex items-center space-x-3">
              <BarChart2 className="w-4.5 h-4.5 text-blue-600" />
              <span>Analytics & Cloudflare</span>
            </div>
            <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Live Stats</span>
          </button>
        </div>
      </div>

      {/* Footer Actions: Refresh Data & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2">
        <button
          onClick={() => { onRefresh(); }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer shadow-2xs"
          title="Refresh Core Data"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>Refresh Core Data</span>
        </button>

        <button
          onClick={() => { onClose?.(); onLogout(); }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-xs font-bold transition cursor-pointer border-none"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Admin</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Permanent Sidebar for Desktop (Always Visible md:flex) */}
      <aside className="hidden md:flex flex-col w-72 shrink-0 h-screen sticky top-0 border-r border-slate-200 bg-white shadow-2xs z-30">
        {navContent}
      </aside>

      {/* 2. Mobile Drawer Overlay (Only when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden print:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
          />
          <aside className="relative w-[85%] max-w-[340px] bg-white h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
};
