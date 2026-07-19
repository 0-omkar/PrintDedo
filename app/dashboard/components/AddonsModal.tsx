import { X } from 'lucide-react';
import { Addon } from '../types';

interface AddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  newAddonName: string;
  setNewAddonName: (name: string) => void;
  newAddonPrice: string;
  setNewAddonPrice: (price: string) => void;
  handleAddAddon: () => void;
  addons: Addon[];
  handleRemoveAddon: (id: string) => void;
}

export const AddonsModal = ({
  isOpen,
  onClose,
  newAddonName,
  setNewAddonName,
  newAddonPrice,
  setNewAddonPrice,
  handleAddAddon,
  addons,
  handleRemoveAddon,
}: AddonsModalProps) => {
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
        
        <h3 className="text-xl font-bold text-slate-900 mb-6">Manage Add-ons & Menu</h3>
        
        {/* Add New Add-on form */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6 space-y-3">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Add Custom Service / Item</span>
          <div className="grid grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="e.g. Lamination" 
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              className="p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 font-medium"
              maxLength={50}
            />
            <input 
              type="number" 
              placeholder="Price (₹)" 
              value={newAddonPrice}
              onChange={(e) => setNewAddonPrice(e.target.value)}
              className="p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 font-medium"
            />
          </div>
          <button 
            onClick={handleAddAddon}
            className="w-full text-xs font-bold bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-xl transition cursor-pointer border-none shadow-sm"
          >
            + Add to Menu
          </button>
        </div>

        {/* List of current add-ons */}
        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Services</span>
          {addons.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-4">No custom add-ons added yet.</p>
          ) : (
            addons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">{addon.name}</span>
                  <span className="text-xs text-slate-500 font-bold">₹{addon.price.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => handleRemoveAddon(addon.id)}
                  className="text-xs text-red-500 font-semibold hover:text-red-700 hover:underline p-1 cursor-pointer border-none bg-transparent"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end mt-8 border-t border-slate-100 pt-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition cursor-pointer border-none shadow-sm"
          >
            Close / Done
          </button>
        </div>
      </div>
    </div>
  );
};
