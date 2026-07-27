import { useState } from 'react';
import { Wifi, HardDrive, Clock, Store, Search, ArrowUpRight, Activity, ShieldCheck, Database, Layers } from 'lucide-react';
import { ShopItem, StorageMetrics } from '../types';

interface AnalyticsTabProps {
  shops: ShopItem[];
  totalBandwidth: number;
  currentMemory: number;
  gbHoursUsed: number;
  storageMetrics: Record<string, StorageMetrics>;
  formatBytes: (bytes: number) => string;
  formatGBHours: (gbh: number) => string;
}

export const AnalyticsTab = ({
  shops,
  totalBandwidth,
  currentMemory,
  gbHoursUsed,
  storageMetrics,
  formatBytes,
  formatGBHours,
}: AnalyticsTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShops = shops.filter((s) =>
    s.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSubscriptionsCount = shops.filter((s) => {
    if (!s.subscription_expires_at) return false;
    return new Date(s.subscription_expires_at) > new Date();
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-200">
              Live Cloudflare Telemetry
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-2 uppercase">
            Platform Analytics & Cloudflare R2 Metrics
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time infrastructure bandwidth, object storage, and Xerox shop usage audit.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 p-3 rounded-2xl">
          <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">System Status</span>
            <span className="text-xs font-black text-slate-900">Cloudflare R2 Online</span>
          </div>
        </div>
      </div>

      {/* 4 Core Infrastructure Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Bandwidth */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">R2 Bandwidth</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatBytes(totalBandwidth)}</h3>
            </div>
            <div className="bg-amber-400/20 text-amber-600 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <Wifi className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Egress Data Transfer</span>
            <span className="text-emerald-600 font-bold flex items-center">
              Active <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>
        </div>

        {/* Metric 2: R2 Storage Memory */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">R2 Storage Memory</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatBytes(currentMemory)}</h3>
            </div>
            <div className="bg-blue-400/20 text-blue-600 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>WAS Bucket Memory</span>
            <span className="text-blue-600 font-bold">R2 Storage</span>
          </div>
        </div>

        {/* Metric 3: GB-Hours */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Storage GB-Hours</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatGBHours(gbHoursUsed)}</h3>
            </div>
            <div className="bg-purple-400/20 text-purple-600 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Cumulative Usage</span>
            <span className="text-purple-600 font-bold">Monthly Meter</span>
          </div>
        </div>

        {/* Metric 4: Active Shops Health */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs hover:shadow-sm transition flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Shop Subscriptions</span>
              <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">
                {activeSubscriptionsCount} / {shops.length} Active
              </h3>
            </div>
            <div className="bg-emerald-400/20 text-emerald-600 p-3 rounded-2xl group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Subscription Health</span>
            <span className="text-emerald-600 font-bold">
              {shops.length > 0 ? Math.round((activeSubscriptionsCount / shops.length) * 100) : 0}% Active
            </span>
          </div>
        </div>

      </div>

      {/* Per-Shop Storage & Telemetry Audit Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-6">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight flex items-center space-x-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Per-Shop R2 Storage Audit</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Detailed file usage and Cloudflare storage consumption per registered Xerox shop.</p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search shop by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-amber-400 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Responsive Table & Card List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 rounded-l-2xl">Shop Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Current R2 Memory</th>
                <th className="py-3 px-4">Subscription Plan</th>
                <th className="py-3 px-4 rounded-r-2xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                    No matching print shops found.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const metrics = storageMetrics[shop.id];
                  const shopBytes = metrics?.current || 0;
                  const isSubActive = shop.subscription_expires_at ? new Date(shop.subscription_expires_at) > new Date() : false;

                  return (
                    <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-black text-slate-950">
                        {shop.store_name}
                        <span className="block text-[10px] text-slate-400 font-mono font-normal">ID: {shop.id}</span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {shop.phone || shop.mobile_number || shop.shop_phone || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {formatBytes(shopBytes)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {shop.subscription_plan_name || 'Standard Tier'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isSubActive ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-red-50 text-red-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-red-200">
                            <span>Expired</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
