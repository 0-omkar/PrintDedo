import { AlertTriangle, Calendar, Loader2, Phone, Store, CreditCard, Shield, X, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { ShopItem, PlanItem } from '../types';
import { toast } from 'sonner';

interface AdminModalsProps {
  shopToDelete: ShopItem | null;
  setShopToDelete: (shop: ShopItem | null) => void;
  isDeletingShop: boolean;
  onDeleteShopConfirm: () => void;

  planToDelete: PlanItem | null;
  setPlanToDelete: (plan: PlanItem | null) => void;
  isDeletingPlan: boolean;
  onDeletePlanConfirm: () => void;

  activeRenewalShop: ShopItem | null;
  setActiveRenewalShop: (shop: ShopItem | null) => void;
  renewPlan: string;
  setRenewPlan: (plan: string) => void;
  renewCustomMonths: string;
  setRenewCustomMonths: (months: string) => void;
  plans: PlanItem[];
  isRenewing: boolean;
  onRenewShop: (e: React.FormEvent) => void;

  editingShopModal: ShopItem | null;
  setEditingShopModal: (shop: ShopItem | null) => void;
  editShopName: string;
  setEditShopName: (name: string) => void;
  editShopPhone: string;
  setEditShopPhone: (phone: string) => void;
  editShopAlternatePhone: string;
  setEditShopAlternatePhone: (phone: string) => void;
  editShopUpi: string;
  setEditShopUpi: (upi: string) => void;
  isSavingShopDetails: boolean;
  onSaveShopDetails: (e: React.FormEvent) => void;
}

export const AdminModals = ({
  shopToDelete,
  setShopToDelete,
  isDeletingShop,
  onDeleteShopConfirm,
  planToDelete,
  setPlanToDelete,
  isDeletingPlan,
  onDeletePlanConfirm,
  activeRenewalShop,
  setActiveRenewalShop,
  renewPlan,
  setRenewPlan,
  renewCustomMonths,
  setRenewCustomMonths,
  plans,
  isRenewing,
  onRenewShop,
  editingShopModal,
  setEditingShopModal,
  editShopName,
  setEditShopName,
  editShopPhone,
  setEditShopPhone,
  editShopAlternatePhone,
  setEditShopAlternatePhone,
  editShopUpi,
  setEditShopUpi,
  isSavingShopDetails,
  onSaveShopDetails,
}: AdminModalsProps) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success('Shop ID copied to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <>
      {/* POPUP MODAL 1: Delete Shop Confirmation */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-5 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-3 border border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Delete Xerox Shop?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-900">{shopToDelete.store_name}</strong>?
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                This action cannot be undone. All shop settings and uploaded files will be permanently erased.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={onDeleteShopConfirm}
                disabled={isDeletingShop}
                className="flex-1 bg-red-600 text-white font-bold p-3.5 rounded-xl text-xs hover:bg-red-700 transition flex justify-center items-center cursor-pointer border-none shadow-sm"
              >
                {isDeletingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Shop'}
              </button>
              <button
                type="button"
                onClick={() => setShopToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Delete Plan Confirmation */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-5 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-3 border border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Delete Subscription Plan?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to delete the plan <strong className="text-slate-900">{planToDelete.name}</strong>?
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={onDeletePlanConfirm}
                disabled={isDeletingPlan}
                className="flex-1 bg-red-600 text-white font-bold p-3.5 rounded-xl text-xs hover:bg-red-700 transition flex justify-center items-center cursor-pointer border-none shadow-sm"
              >
                {isDeletingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Plan'}
              </button>
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Shop Subscription Renewal Modal */}
      {activeRenewalShop && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl w-full max-w-md space-y-5 animate-scale-in">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="bg-yellow-400 p-3 rounded-2xl text-black">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Manage Shop Subscription</h3>
                <p className="text-xs text-slate-500 font-bold">{activeRenewalShop.store_name}</p>
              </div>
            </div>

            <form onSubmit={onRenewShop} className="space-y-4 text-left">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Current Plan:</span>
                  <span className="font-extrabold text-slate-900">{activeRenewalShop.subscription_plan_name || 'Free Trial'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Current Expiry:</span>
                  <span className="font-bold text-yellow-600">
                    {activeRenewalShop.subscription_expires_at ? new Date(activeRenewalShop.subscription_expires_at).toLocaleDateString() : 'No expiry set'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Plan / Extension Term</label>
                <select
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white cursor-pointer"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration_months} Month{p.duration_months > 1 ? 's' : ''})
                    </option>
                  ))}
                  <option value="custom">Custom Months Period</option>
                </select>
              </div>

              {renewPlan === 'custom' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Custom Months Input (Use negative/0 to expire)</label>
                  <input 
                    type="number" 
                    min="-120"
                    max="120"
                    placeholder="e.g. -1 for expired, 12 for yearly" 
                    value={renewCustomMonths} 
                    onChange={(e) => setRenewCustomMonths(e.target.value)} 
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit"
                  disabled={isRenewing}
                  className="flex-1 bg-yellow-400 text-black font-bold p-3.5 rounded-xl text-xs hover:bg-yellow-500 transition-all border-none cursor-pointer flex justify-center items-center shadow-sm"
                >
                  {isRenewing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Renewal'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveRenewalShop(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition-all border-none cursor-pointer flex justify-center items-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL 4: Edit Shop Details & Mobile Number Modal (Admin Console) */}
      {editingShopModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-lg space-y-5 animate-scale-in relative">
            <button 
              onClick={() => setEditingShopModal(null)}
              className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="bg-amber-400 p-3 rounded-2xl text-black">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Edit Shop Details &amp; Mobile</h3>
                <p className="text-xs text-slate-500 font-bold">Admin Management Console</p>
              </div>
            </div>

            <form onSubmit={onSaveShopDetails} className="space-y-4 text-left">
              {/* Shop ID Banner */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shop Unique ID:</span>
                  <span className="text-xs font-mono font-bold text-slate-900 select-all">{editingShopModal.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyId(editingShopModal.id)}
                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition border-none bg-transparent cursor-pointer"
                  title="Copy Shop ID"
                >
                  {copiedId ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Store Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Store / Shop Name</label>
                <input 
                  type="text" 
                  value={editShopName}
                  onChange={(e) => setEditShopName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-semibold bg-slate-50 focus:bg-white"
                  required
                  maxLength={100}
                />
              </div>

              {/* Primary Mobile Number (Admin Editable) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Primary Owner Mobile (Registration Number)</span>
                  </label>
                  <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                    Admin Full Access
                  </span>
                </div>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 98765 43210"
                  value={editShopPhone}
                  onChange={(e) => setEditShopPhone(e.target.value)}
                  className="w-full p-3 border border-amber-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-bold bg-amber-50/30 focus:bg-white"
                  maxLength={25}
                />
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  This primary registration mobile number is read-only for shop owners and can only be updated here by Admin.
                </p>
              </div>

              {/* Alternate Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Alternate Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="e.g. +91 91234 56789 (Optional)"
                  value={editShopAlternatePhone}
                  onChange={(e) => setEditShopAlternatePhone(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-semibold bg-slate-50 focus:bg-white"
                  maxLength={25}
                />
              </div>

              {/* UPI ID */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Shop UPI ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. shopname@upi"
                  value={editShopUpi}
                  onChange={(e) => setEditShopUpi(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-semibold bg-slate-50 focus:bg-white"
                  maxLength={60}
                />
              </div>

              {/* Current Pricing Overview Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="font-extrabold text-slate-800 uppercase block mb-1">Pricing Configuration</span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-semibold">
                  <div>B&amp;W Single: <span className="font-bold text-slate-900">₹{editingShopModal.pricing_bw ?? 0}</span></div>
                  <div>B&amp;W Double: <span className="font-bold text-slate-900">₹{editingShopModal.pricing_bw_double ?? 0}</span></div>
                  <div>Color Single: <span className="font-bold text-slate-900">₹{editingShopModal.pricing_color ?? 0}</span></div>
                  <div>Color Double: <span className="font-bold text-slate-900">₹{editingShopModal.pricing_color_double ?? 0}</span></div>
                </div>
              </div>

              <div className="flex space-x-3 pt-3">
                <button 
                  type="submit"
                  disabled={isSavingShopDetails}
                  className="flex-1 bg-amber-400 text-slate-950 font-black p-3.5 rounded-xl text-xs hover:bg-amber-500 transition-all border-none cursor-pointer flex justify-center items-center shadow-xs"
                >
                  {isSavingShopDetails ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingShopModal(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition-all border-none cursor-pointer flex justify-center items-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
