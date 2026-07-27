import Link from 'next/link';
import { Printer, Upload, X, Phone, Lock } from 'lucide-react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempShopName: string;
  setTempShopName: (name: string) => void;
  registeredPhone: string; // Primary Phone (Set by admin, read-only)
  tempAlternatePhone: string; // Alternate Phone (Editable by shop owner)
  setTempAlternatePhone: (phone: string) => void;
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
  registeredPhone,
  tempAlternatePhone,
  setTempAlternatePhone,
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
        
        <h3 className="text-xl font-black text-slate-950 mb-6">Edit Shop Profile</h3>
        
        <div className="space-y-5">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shop Name</label>
            <input 
              type="text" 
              value={tempShopName}
              onChange={(e) => setTempShopName(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-semibold bg-slate-50 focus:bg-white"
              maxLength={100}
            />
          </div>

          {/* Primary Registered Mobile Number (Read-Only / Admin Managed) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Primary Mobile (Admin Managed)</span>
              </label>
              <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 border border-amber-300/80 px-2 py-0.5 rounded-full uppercase">
                Admin Only
              </span>
            </div>
            <div className="w-full p-3 bg-slate-100/90 border border-slate-200 rounded-xl text-slate-700 text-sm font-extrabold flex items-center justify-between select-none">
              <span>{registeredPhone || 'Not Registered by Admin'}</span>
              <Lock className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-tight pt-0.5">
              This main number was configured during registration and can only be modified via Admin.
            </p>
          </div>

          {/* Alternate Mobile Number (Editable by Shop Owner) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>Alternate Contact Mobile</span>
            </label>
            <input 
              type="tel" 
              placeholder="e.g. +91 98765 43210 (Optional)"
              value={tempAlternatePhone}
              onChange={(e) => setTempAlternatePhone(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-semibold bg-slate-50 focus:bg-white"
              maxLength={25}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
            <input 
              type="text" 
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 text-sm font-semibold bg-slate-50 focus:bg-white"
              maxLength={150}
            />
          </div>

          {/* Logo Image */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Logo Image</label>
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
                  className="hidden"
                  id="logo-upload-modal"
                />
                <label 
                  htmlFor="logo-upload-modal"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-2 cursor-pointer transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={onSave}
            className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs transition cursor-pointer shadow-2xs border-none"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};
