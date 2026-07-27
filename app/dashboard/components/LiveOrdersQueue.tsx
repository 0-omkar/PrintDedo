import Link from 'next/link';
import { 
  CheckCircle, 
  MapPin, 
  Printer, 
  Shield, 
  Star, 
  Download, 
  FileText,
  Phone
} from 'lucide-react';
import { XeroxLogoSVG } from '@/components/XeroxLogoSVG';

interface LiveOrdersQueueProps {
  shopName: string;
  shopPhone?: string;
  location: string;
  logo: string;
  rating: number;
  reviews: number;
  orders: any[];
  recentOrdersCount: number;
  getSplitShopName: (name: string) => { first: string; rest: string };
  getSubscriptionAlert: () => { type: 'warning' | 'expired'; message: string; colorClass: string } | null;
  onOpenProfileEdit: () => void;
  onOpenRecents: () => void;
  onOpenShopReviews?: () => void;
  handlePrint: (order: any) => void;
  handleDownload?: (order: any) => void;
  formatFilename: (path: string) => string;
}

export const LiveOrdersQueue = ({
  shopName,
  shopPhone,
  location,
  logo,
  rating,
  reviews,
  orders,
  recentOrdersCount,
  getSplitShopName,
  getSubscriptionAlert,
  onOpenProfileEdit,
  onOpenRecents,
  onOpenShopReviews,
  handlePrint,
  handleDownload,
  formatFilename,
}: LiveOrdersQueueProps) => {
  const subAlert = getSubscriptionAlert();

  return (
    <main className="flex-1 flex flex-col h-screen max-h-screen p-6 md:p-8 overflow-hidden w-full max-w-full print:hidden relative z-10 space-y-6">
      {/* Subscription Alert Banner */}
      {subAlert?.type === 'warning' && (
        <div className={`shrink-0 border p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in ${subAlert.colorClass}`}>
          <div className="flex items-center space-x-3.5">
            <div className="bg-white/70 p-2.5 rounded-2xl shadow-2xs text-yellow-600">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                Subscription Ending Soon
              </h4>
              <p className="text-xs text-slate-650 font-medium mt-0.5">{subAlert.message}</p>
            </div>
          </div>
          <Link 
            href="/renew" 
            className="bg-yellow-400 text-black font-bold px-5 py-3 rounded-2xl hover:bg-yellow-500 transition text-xs shrink-0 cursor-pointer shadow-2xs border-none text-center block w-full sm:w-auto"
          >
            Renew Now
          </Link>
        </div>
      )}

      {/* Profile/Banner Card - Compact Height */}
      <div 
        onClick={onOpenProfileEdit}
        className="shrink-0 relative bg-white border border-slate-200 hover:border-amber-400 rounded-3xl p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer transition-all overflow-hidden select-none group"
      >
        {/* Yellow brush decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 overflow-hidden pointer-events-none select-none hidden sm:block">
          <svg viewBox="0 0 200 200" className="absolute right-0 top-0 bottom-0 h-full w-full text-amber-400/90 transition-transform group-hover:scale-105 duration-500" fill="currentColor" preserveAspectRatio="none">
            <path d="M 120,0 C 140,60 110,140 150,200 L 200,200 L 200,0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center space-x-4 sm:space-x-5 flex-1 min-w-0 pr-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center overflow-hidden shadow-2xs shrink-0">
            {logo ? (
              <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <XeroxLogoSVG />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* One Liner Shop Name */}
            <h2 className="font-black text-amber-500 text-xl sm:text-2xl md:text-3xl leading-tight tracking-tight uppercase truncate">
              {shopName}
            </h2>
            
            {/* Shop Contact Mobile Number */}
            {shopPhone && (
              <div className="flex items-center space-x-1.5 text-slate-700 text-xs md:text-sm font-extrabold mt-0.5">
                <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{shopPhone}</span>
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>

        <button 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenShopReviews) onOpenShopReviews();
          }}
          title="Click to view all shop reviews"
          className="relative z-10 hidden md:flex flex-col items-center justify-center bg-white/95 border border-slate-200/80 shadow-2xs backdrop-blur-xs p-3 px-5 rounded-2xl shrink-0 space-y-1 border-l-4 border-l-amber-400 cursor-pointer hover:border-amber-400 hover:scale-105 transition-all text-left"
        >
          <div className="flex items-center space-x-1.5">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xl font-black text-slate-950">{rating}</span>
          </div>
          
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => {
              const numRating = parseFloat(rating.toString()) || 5;
              const isFull = i < Math.floor(numRating);
              const isHalf = !isFull && i < numRating;
              return (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${isFull ? 'text-amber-400 fill-amber-400' : isHalf ? 'text-amber-400 fill-amber-400 opacity-60' : 'text-slate-200'}`} 
                />
              );
            })}
          </div>

          <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60 tracking-wider">
            {reviews} Reviews
          </span>
        </button>
      </div>

      {/* Subscription Expired Live Queue Banner */}
      {subAlert?.type === 'expired' && (
        <div className="shrink-0 bg-red-50 border border-red-200 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="bg-red-100 p-2.5 rounded-2xl shadow-2xs text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-tight text-red-800">
                Subscription Expired
              </h4>
              <p className="text-xs text-red-750 font-semibold mt-0.5">
                Your subscription has ended. Please renew to reactivate your customer dropbox.
              </p>
            </div>
          </div>
          <Link 
            href="/renew" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl transition text-xs shrink-0 cursor-pointer shadow-2xs border-none text-center block w-full sm:w-auto"
          >
            Renew Subscription
          </Link>
        </div>
      )}

      {/* Live Queue Card Table Container - Fits 100% Screen Height */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4 overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Live Queue</h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full border border-amber-200/60">
              {orders.length}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenRecents}
              className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Recents</span>
              <span className="bg-green-200 text-green-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {recentOrdersCount}
              </span>
            </button>
          </div>
        </div>

        {/* Table Content Area */}
        {subAlert?.type === 'expired' ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center my-auto">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 border border-red-100">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Print Queue Locked</h2>
            <p className="text-slate-500 font-medium">Your subscription has ended. Customer uploads are suspended until renewed.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/60 border border-slate-200 border-dashed rounded-3xl p-8 text-center my-auto">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
              <Printer className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Queue is fully clear</h2>
            <p className="text-slate-500 font-medium">New print orders will appear here in real-time when<br/>customers upload them.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto min-h-0 pr-1">
            <table className="w-full text-left border-separate border-spacing-y-2.5">
              <thead>
                <tr className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider sticky top-0 bg-white z-10 shadow-2xs">
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Customer</th>
                  <th className="py-2.5 px-4">Files</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Pages</th>
                  <th className="py-2.5 px-4">Side</th>
                  <th className="py-2.5 px-4">Add-ons</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {orders.map((order, index) => {
                  let cleanCustomerName = 'Anonymous';
                  let extractedPagesTag: string | null = null;
                  let extractedAddonsTag: string | null = null;

                  if (order.customer_name) {
                    const bracketIdx = order.customer_name.indexOf('[');
                    cleanCustomerName = bracketIdx !== -1 
                      ? order.customer_name.substring(0, bracketIdx).trim() 
                      : order.customer_name.trim();

                    if (bracketIdx !== -1) {
                      const detailsStr = order.customer_name.substring(bracketIdx);
                      const pageMatch = detailsStr.match(/\[(?:Pages|All)\s+([^\]]+)\]/i);
                      if (pageMatch && pageMatch[1]) {
                        extractedPagesTag = pageMatch[1].replace(/\s*\(\d+\s*Total\)/i, '').trim();
                      }
                      const addonMatch = detailsStr.match(/\[\+\s*([^\]]+)\]/);
                      if (addonMatch && addonMatch[1]) {
                        extractedAddonsTag = addonMatch[1].trim();
                      }
                    }
                  }

                  const isRawOfficeDoc = (order.file_path || '').toLowerCase().match(/\.(pptx|ppt|docx|doc|xlsx|xls)$/i);
                  
                  // Side determination (single-sided vs double-sided)
                  const isDoubleSided = order.print_sides === 'double' || 
                    order.is_double_sided === true || 
                    (order.customer_name && order.customer_name.toLowerCase().includes('double'));
                  const sideLabel = isDoubleSided ? 'Double' : 'Single';

                  return (
                    <tr 
                      key={order.id} 
                      className="bg-white hover:bg-slate-50/90 border border-slate-200/80 rounded-2xl shadow-2xs transition-all group"
                    >
                      {/* Index Column */}
                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm text-center">
                        {index + 1}
                      </td>

                      {/* Customer Column */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 text-sm block truncate" title={cleanCustomerName}>
                            {cleanCustomerName}
                          </span>
                          {order.customer_phone && (
                            <span className="text-[11px] font-semibold text-slate-400 block truncate">
                              📞 {order.customer_phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Files Column */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-slate-800">
                            1
                          </span>
                          <div className="w-7 h-7 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-red-500" />
                          </div>
                          <span className="text-xs font-semibold text-slate-500 truncate max-w-[140px]" title={formatFilename(order.file_path)}>
                            {formatFilename(order.file_path)}
                          </span>
                        </div>
                      </td>

                      {/* Type Column */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-xs text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                          {order.color_mode === 'color' || order.color_mode === 'COLOR' ? 'Color' : 'B&W'}
                        </span>
                      </td>

                      {/* Pages Column */}
                      <td className="py-3.5 px-4 font-bold text-sm text-slate-900">
                        {extractedPagesTag || order.quantity || '1'}
                      </td>

                      {/* Side Column */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-xs text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                          {sideLabel}
                        </span>
                      </td>

                      {/* Add-ons Column */}
                      <td className="py-3.5 px-4">
                        {extractedAddonsTag ? (
                          <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg font-extrabold text-xs">
                            + {extractedAddonsTag}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-bold text-xs">—</span>
                        )}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!isRawOfficeDoc && handleDownload && (
                            <button
                              onClick={() => handleDownload(order)}
                              title="Download file directly"
                              className="px-3.5 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center space-x-1"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Download</span>
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrint(order)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs rounded-xl transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
                          >
                            {isRawOfficeDoc ? <Download className="w-3.5 h-3.5" /> : <Printer className="w-3.5 h-3.5" />}
                            <span>{isRawOfficeDoc ? 'Download & Print' : 'Print Now'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </main>
  );
};
