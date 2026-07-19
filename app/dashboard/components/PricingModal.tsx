import { Tag, Shield, X } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTierId: string | null;
  modalError: string | null;
  newFromPage: string;
  setNewFromPage: (v: string) => void;
  newToPage: string;
  setNewToPage: (v: string) => void;
  newPricingBwSingle: string;
  setNewPricingBwSingle: (v: string) => void;
  newPricingBwDouble: string;
  setNewPricingBwDouble: (v: string) => void;
  newPricingColorSingle: string;
  setNewPricingColorSingle: (v: string) => void;
  newPricingColorDouble: string;
  setNewPricingColorDouble: (v: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export const PricingModal = ({
  isOpen,
  onClose,
  editingTierId,
  modalError,
  newFromPage,
  setNewFromPage,
  newToPage,
  setNewToPage,
  newPricingBwSingle,
  setNewPricingBwSingle,
  newPricingBwDouble,
  setNewPricingBwDouble,
  newPricingColorSingle,
  setNewPricingColorSingle,
  newPricingColorDouble,
  setNewPricingColorDouble,
  onSave,
}: PricingModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm text-left space-y-5 animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-700">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">
              {editingTierId ? 'Edit Page Range & Pricing' : 'Add Page Range & Pricing'}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Set range & rates for printing</p>
          </div>
        </div>

        {modalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-2xl font-bold flex items-start gap-2.5 animate-in fade-in">
            <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-tight">{modalError}</span>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          {/* Page Range From - To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From Page</label>
              <input
                type="number"
                min="1"
                value={newFromPage}
                onChange={(e) => setNewFromPage(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-slate-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To Page (Blank = ∞)</label>
              <input
                type="number"
                min={parseInt(newFromPage) || 1}
                placeholder="Unlimited"
                value={newToPage}
                onChange={(e) => setNewToPage(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          {/* 4 Pricing Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">B&W Single (₹)</label>
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                value={newPricingBwSingle} 
                onChange={(e) => setNewPricingBwSingle(e.target.value)} 
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-slate-50 focus:bg-white text-slate-900" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">B&W Double (₹)</label>
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                value={newPricingBwDouble} 
                onChange={(e) => setNewPricingBwDouble(e.target.value)} 
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-slate-50 focus:bg-white text-slate-900" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Color Single (₹)</label>
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                value={newPricingColorSingle} 
                onChange={(e) => setNewPricingColorSingle(e.target.value)} 
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-slate-50 focus:bg-white text-slate-900" 
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Color Double (₹)</label>
              <input 
                type="number" 
                step="0.5" 
                min="0" 
                value={newPricingColorDouble} 
                onChange={(e) => setNewPricingColorDouble(e.target.value)} 
                className="w-full p-2.5 text-xs border border-slate-200 rounded-xl font-semibold bg-slate-50 focus:bg-white text-slate-900" 
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold p-3.5 rounded-xl text-xs transition-all border-none cursor-pointer shadow-sm mt-2"
          >
            {editingTierId ? 'Save Changes' : 'Save & Add Range Pricing'}
          </button>
        </form>
      </div>
    </div>
  );
};
