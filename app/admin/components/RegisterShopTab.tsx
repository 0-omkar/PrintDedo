import { ArrowLeft, Loader2, UserPlus, Phone } from 'lucide-react';
import { ActiveView, PlanItem } from '../types';

interface RegisterShopTabProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  shopName: string;
  setShopName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  selectedPlan: string;
  setSelectedPlan: (val: string) => void;
  customMonths: string;
  setCustomMonths: (val: string) => void;
  plans: PlanItem[];
  registerLoading: boolean;
  registerSuccess: string | null;
  registerError: string | null;
  onRegisterSubmit: (e: React.FormEvent) => void;
}

export const RegisterShopTab = ({
  activeView,
  setActiveView,
  shopName,
  setShopName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  selectedPlan,
  setSelectedPlan,
  customMonths,
  setCustomMonths,
  plans,
  registerLoading,
  registerSuccess,
  registerError,
  onRegisterSubmit,
}: RegisterShopTabProps) => {
  if (activeView !== 'register') return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => setActiveView('overview')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Overview</span>
      </button>

      <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
          <div className="bg-yellow-400 p-3 rounded-2xl text-black">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Register New Xerox Shop</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Onboard shop owner &amp; provision initial subscription</p>
          </div>
        </div>

        <form onSubmit={onRegisterSubmit} className="space-y-5">
          {registerSuccess && (
            <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-xs font-bold text-center border border-green-200">
              {registerSuccess}
            </div>
          )}
          {registerError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold text-center border border-red-200">
              {registerError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Store / Shop Name</label>
            <input 
              type="text" 
              placeholder="e.g. Ambika Copies &amp; Prints" 
              value={shopName} 
              onChange={(e) => setShopName(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
              required
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Owner Mobile Number</span>
            </label>
            <input 
              type="tel" 
              placeholder="e.g. +91 98765 43210" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Email</label>
              <input 
                type="email" 
                placeholder="owner@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                required
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
              <input 
                type="password" 
                placeholder="Password (min 6 chars)" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                required
                minLength={6}
                maxLength={128}
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Subscription Plan</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white cursor-pointer"
            >
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.duration_months} Month{p.duration_months > 1 ? 's' : ''}) - ₹{p.price}
                </option>
              ))}
              <option value="custom">Custom Months Period</option>
            </select>
          </div>

          {selectedPlan === 'custom' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Custom Duration (Months)</label>
              <input 
                type="number" 
                min="-120"
                max="120"
                placeholder="e.g. 6" 
                value={customMonths} 
                onChange={(e) => setCustomMonths(e.target.value)} 
                className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={registerLoading}
            className="w-full bg-yellow-400 text-black font-bold p-4 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer shadow-sm text-sm border-none mt-4"
          >
            {registerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Register Print Shop'}
          </button>
        </form>
      </div>
    </div>
  );
};
