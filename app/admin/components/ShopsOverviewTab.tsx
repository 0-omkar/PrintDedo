import { Database, UserPlus, CreditCard, ChevronRight, Search, ArrowUpDown, Loader2, HardDrive, Trash2, ArrowLeft, Phone } from 'lucide-react';
import { ActiveView, ShopItem, PlanItem, StorageMetrics } from '../types';

interface ShopsOverviewTabProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  shops: ShopItem[];
  plans: PlanItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  loadingShops: boolean;
  getFilteredShops: () => ShopItem[];
  storageMetrics: Record<string, StorageMetrics>;
  getSubStatus: (expiresAt?: string) => { label: string; color: string };
  formatSize: (bytes: number) => string;
  setActiveRenewalShop: (shop: ShopItem) => void;
  setShopToDelete: (shop: ShopItem) => void;
}

export const ShopsOverviewTab = ({
  activeView,
  setActiveView,
  shops,
  plans,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  loadingShops,
  getFilteredShops,
  storageMetrics,
  getSubStatus,
  formatSize,
  setActiveRenewalShop,
  setShopToDelete,
}: ShopsOverviewTabProps) => {
  if (activeView === 'overview') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Management Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Manage Subscriptions Action Card */}
            <button
              onClick={() => setActiveView('plans')}
              className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-yellow-400 text-black p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                    {plans.length} Plans Active
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                  Manage Subs
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Configure subscription pricing tiers, create new plans, edit durations, or remove obsolete plans.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                <span>Open Plans Editor</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 2. Register Shop Action Card */}
            <button
              onClick={() => setActiveView('register')}
              className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-slate-900 text-yellow-400 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                    Onboard Shop
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                  Register Shop
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Create new Xerox shop owner accounts, generate login credentials, and assign initial subscription periods.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                <span>Open Shop Registration</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* 3. Audit Shops Action Card */}
            <button
              onClick={() => setActiveView('audit')}
              className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-600 text-white p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                    <Database className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {shops.length} Shops Registered
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                  Audit Shops
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Inspect active shops, monitor real-time storage & daily usage, extend subscriptions, or delete shop accounts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                <span>Open Shop Audit List</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

          </div>
        </div>

        {/* Quick Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Registered Shops Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-950 uppercase text-sm">Recent Registered Shops</h3>
              <button 
                onClick={() => setActiveView('audit')}
                className="text-xs font-bold text-yellow-600 hover:underline border-none bg-transparent cursor-pointer"
              >
                View All ({shops.length}) →
              </button>
            </div>
            <div className="space-y-3">
              {shops.slice(0, 4).map(shop => (
                <div key={shop.id} className="p-3.5 border border-slate-100 bg-slate-50/60 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 uppercase">{shop.store_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{shop.id}</div>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                    {shop.subscription_plan_name || 'Free Trial'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans Overview Preview */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-950 uppercase text-sm">Active Subscription Tiers</h3>
              <button 
                onClick={() => setActiveView('plans')}
                className="text-xs font-bold text-yellow-600 hover:underline border-none bg-transparent cursor-pointer"
              >
                Manage Plans ({plans.length}) →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {plans.map(p => (
                <div key={p.id} className="p-3.5 border border-slate-100 bg-slate-50/60 rounded-2xl">
                  <div className="font-extrabold text-xs text-slate-900 uppercase">{p.name}</div>
                  <div className="text-yellow-600 font-black text-sm">₹{p.price}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{p.duration_months} Month(s)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeView === 'audit') {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => setActiveView('overview')}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Overview</span>
        </button>

        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-3 rounded-2xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Active Shops Audit</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Storage consumption, subscriptions & shop management</p>
              </div>
            </div>

            <span className="text-xs bg-slate-100 px-4 py-1.5 rounded-full font-bold text-slate-700 w-fit border border-slate-200">
              {getFilteredShops().length} Shops Total
            </span>
          </div>

          {/* Search & Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search shop by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white bg-slate-50"
              />
            </div>

            <div className="relative">
              <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer bg-slate-50"
              >
                <option value="newest">Sort by: Newest Registered</option>
                <option value="alphabetical">Sort by: Alphabetical (A-Z)</option>
                <option value="soonest_expiry">Sort by: Expiry (Soonest First)</option>
                <option value="expired_first">Sort by: Expired Shops First</option>
                <option value="active_first">Sort by: Active Shops First</option>
              </select>
            </div>
          </div>

          {loadingShops ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gathering Storage Metrics...</p>
            </div>
          ) : getFilteredShops().length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
              <p className="text-slate-400 text-sm italic">No matching registered shops found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredShops().map((shop) => {
                const shopMetrics = storageMetrics[shop.id] || { current: 0, daily: 0 };
                const sub = getSubStatus(shop.subscription_expires_at);
                return (
                  <div 
                    key={shop.id} 
                    className="p-6 border border-slate-200 rounded-2xl hover:border-yellow-400 transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white"
                  >
                    <div className="space-y-1.5 flex-1 select-all">
                      <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        <h3 className="text-lg font-black text-slate-950 uppercase">{shop.store_name}</h3>
                        
                        <button
                          onClick={() => setActiveRenewalShop(shop)}
                          className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border cursor-pointer hover:scale-105 transition-all text-left ${sub.color}`}
                          title="Click to view details or renew subscription"
                        >
                          {sub.label}
                        </button>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider">{shop.id}</p>
                      
                      <div className="flex flex-wrap items-center gap-2 my-1.5">
                        <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 border border-amber-200/80 px-2.5 py-1 rounded-lg text-xs font-extrabold w-fit">
                          <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Owner Mobile: {shop.phone || shop.mobile_number || shop.shop_phone || 'Not Registered'}</span>
                        </div>
                        {shop.alternate_phone && (
                          <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-bold w-fit">
                            <span>Alt: {shop.alternate_phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 font-semibold pt-0.5">
                        Plan: <span className="text-slate-900 font-bold">{shop.subscription_plan_name || 'Free Trial'}</span> 
                        {shop.subscription_expires_at && ` (Expires: ${new Date(shop.subscription_expires_at).toLocaleDateString()})`}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">UPI: {shop.upi_id || 'Not Set'}</span>
                        <span>•</span>
                        <span>B&amp;W: ₹{shop.pricing_bw}/₹{shop.pricing_bw_double}</span>
                        <span>•</span>
                        <span>Color: ₹{shop.pricing_color}/₹{shop.pricing_color_double}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-3.5 bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl shrink-0">
                        <HardDrive className="w-6 h-6 text-amber-600" />
                        <div className="text-left space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider block">CLOUDFLARE R2:</span>
                            <span className="text-xs font-black text-slate-900">{formatSize(shopMetrics.current)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">LAST 24H:</span>
                            <span className="text-xs font-black text-amber-600">{formatSize(shopMetrics.daily)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShopToDelete(shop)}
                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl transition cursor-pointer border border-red-100 bg-white"
                        title="Delete Shop"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
