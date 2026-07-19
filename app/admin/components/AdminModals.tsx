import { AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import { ShopItem, PlanItem } from '../types';

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
}: AdminModalsProps) => {
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

      {/* POPUP MODAL 3: Subscription Renewal Modal */}
      {activeRenewalShop && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-6 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mb-3 border border-yellow-200">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Renew Subscription</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {activeRenewalShop.store_name}
              </p>
            </div>

            <form onSubmit={onRenewShop} className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Expiry Status</span>
                <div className="text-xs font-bold text-slate-800">
                  Plan: {activeRenewalShop.subscription_plan_name || 'Free Trial'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Date: {activeRenewalShop.subscription_expires_at ? new Date(activeRenewalShop.subscription_expires_at).toLocaleString() : 'Expired'}
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
    </>
  );
};
