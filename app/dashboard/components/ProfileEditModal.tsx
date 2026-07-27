import Link from 'next/link';
import { Printer, Upload, X, Phone } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempShopName: string;
  setTempShopName: (name: string) => void;
  tempPhone: string;
  setTempPhone: (phone: string) => void;
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
  tempPhone,
  setTempPhone,
  tempLocation,
  setTempLocation,
  tempLogo,
  setTempLogo,
  getSubStatusLabel,
  onSave,
}: ProfileEditModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
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
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-medium"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shop Mobile / Phone Number</label>
            <input 
              type="text" 
              placeholder="e.g. +91 9876543210"
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-medium"
              maxLength={30}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
            <input 
              type="text" 
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-medium"
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
                className="mt-2 text-xs text-red-500 hover:text-red-700 font-medium border-none bg-transparent cursor-pointer"
              >
                Remove Logo
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition border-none bg-transparent cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs transition shadow-2xs cursor-pointer border-none"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
