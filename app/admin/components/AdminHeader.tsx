import { Shield, Menu } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader = ({ onToggleSidebar }: AdminHeaderProps) => {
  return (
    <header className="relative flex items-center justify-between bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-2xs w-full select-none">
      <div className="flex items-center space-x-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 active:scale-95 text-slate-800 flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0"
            title="Open Admin Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-slate-900" />
          </button>
        )}
        <div className="flex items-center space-x-2.5">
          <div className="bg-yellow-400 p-2.5 rounded-2xl shrink-0 shadow-2xs">
            <Shield className="w-5.5 h-5.5 text-black" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight uppercase leading-tight">Admin Console</h1>
            <p className="text-[10px] sm:text-xs text-slate-400 font-extrabold tracking-wider uppercase">PrintDedo Core Audit</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <BrandLogo size="lg" href="/" showSubtitle={false} />
      </div>
    </header>
  );
};
