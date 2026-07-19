import Link from 'next/link';
import { Printer, Upload, X } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempShopName: string;
  setTempShopName: (name: string) => void;
  tempLocation: string;
  setTempLocation: (loc: string) => void;
  tempLogo: string;
  setTempLogo: (logo: string) => void;
  getSubStatusLabel: () => { text: string; isExpired: boolean };
  onSave: () => void;
}

export const ProfileEditModal = ({
  isOpen,
  onClose,
  tempShopName,
  setTempShopName,
  tempLocation,
  setTempLocation,
  tempLogo,
  setTempLogo,
  getSubStatusLabel,
  onSave,
}: ProfileEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Shop Profile</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shop Name</label>
            <input 
              type="text" 
              value={tempShopName}
              onChange={(e) => setTempShopName(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
            <input 
              type="text" 
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              maxLength={150}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Logo Image</label>
            <div className="flex items-center space-x-4">
              {tempLogo ? (
                <img src={tempLogo} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                  <Printer className="w-6 h-6 text-slate-400" />
                </div>
              )}
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setTempLogo(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button type="button" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Logo
                </button>
              </div>
            </div>
            {tempLogo && (
              <button 
                type="button" 
                onClick={() => setTempLogo('')} 
                className="text-xs text-red-500 mt-2 hover:underline block bg-transparent border-none cursor-pointer"
              >
                Clear custom logo (use default copier icon)
              </button>
            )}
          </div>

          {/* Current Subscription Status */}
          <div className="pt-4 border-t border-slate-150">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subscription status</label>
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/65">
              <div className="text-left space-y-0.5">
                <span className={`text-xs font-black uppercase tracking-tight ${getSubStatusLabel().isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {getSubStatusLabel().isExpired ? 'Expired' : 'Active'}
                </span>
                <span className="block text-[10px] text-slate-500 font-bold leading-normal">
                  {getSubStatusLabel().text}
                </span>
              </div>
              <Link 
                href="/renew" 
                className="bg-yellow-400 text-black font-bold px-3.5 py-2 rounded-xl hover:bg-yellow-500 transition text-xs shrink-0 cursor-pointer shadow-sm border-none text-center"
              >
                Renew
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-8">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 transition cursor-pointer border-none"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
