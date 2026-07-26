import Link from 'next/link';
import { CheckCircle, MapPin, Printer, Shield, Star, Download } from 'lucide-react';
import { XeroxLogoSVG } from '@/components/XeroxLogoSVG';

interface LiveOrdersQueueProps {
  shopName: string;
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
  const nameParts = getSplitShopName(shopName);

  return (
    <main className="flex-1 p-8 overflow-y-auto w-full max-w-5xl print:hidden relative z-10 space-y-6">
      {/* Subscription Alert Banner */}
      {subAlert?.type === 'warning' && (
        <div className={`border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in ${subAlert.colorClass}`}>
          <div className="flex items-center space-x-3.5">
            <div className="bg-white/70 p-2.5 rounded-2xl shadow-sm text-yellow-600">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 font-extrabold">
                Subscription Ending Soon
              </h4>
              <p className="text-xs text-slate-650 font-medium mt-0.5">{subAlert.message}</p>
            </div>
          </div>
          <Link 
            href="/renew" 
            className="bg-yellow-400 text-black font-bold px-5 py-3 rounded-2xl hover:bg-yellow-500 transition text-xs shrink-0 cursor-pointer shadow-sm border-none text-center block w-full sm:w-auto"
          >
            Renew Now
          </Link>
        </div>
      )}

      {/* Profile/Banner Card */}
      <div 
        onClick={onOpenProfileEdit}
        className="relative bg-white border border-slate-200 hover:border-yellow-400 rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between cursor-pointer transition-all overflow-hidden select-none group"
      >
        {/* Yellow brush illustration decoration on far right background */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 overflow-hidden pointer-events-none select-none hidden sm:block">
          <svg viewBox="0 0 200 200" className="absolute right-0 top-0 bottom-0 h-full w-full text-yellow-400/90 transition-transform group-hover:scale-105 duration-500" fill="currentColor" preserveAspectRatio="none">
            <path d="M 120,0 C 140,60 110,140 150,200 L 200,200 L 200,0 Z" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center space-x-6 flex-1 min-w-0 pr-4">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            {logo ? (
              <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <XeroxLogoSVG />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-black text-yellow-500 text-2xl md:text-3xl leading-none tracking-tight uppercase truncate">
              {nameParts.first || "OWNER'S"}
            </h2>
            {nameParts.rest && (
              <span className="block text-xs font-bold text-slate-900 tracking-widest uppercase mt-1">
                {nameParts.rest}
              </span>
            )}
            
            <div className="inline-block mt-3 bg-black text-[9px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider">
              XEROX • PRINT • SCAN • LAMINATION • SPIRAL BINDING
            </div>
            
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-3.5 font-medium">
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
          className="relative z-10 hidden md:flex flex-col items-center justify-center bg-white/95 border border-slate-200/80 shadow-xs backdrop-blur-xs p-3 px-5 rounded-2xl shrink-0 space-y-1 border-l-4 border-l-yellow-400 cursor-pointer hover:border-yellow-400 hover:scale-105 transition-all text-left"
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

      {/* Live Queue Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3.5">
          <div className="bg-yellow-100 p-2.5 rounded-xl text-yellow-600 border border-yellow-100/50">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Live Queue</h1>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">Real-time incoming print requests (auto-deleted 10 mins after upload)</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenRecents}
            className="flex items-center space-x-2 text-xs font-extrabold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 hover:border-yellow-400 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer shadow-xs"
          >
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Recents</span>
            <span className="bg-green-100 text-green-800 text-[10px] font-black px-2 py-0.5 rounded-full">
              {recentOrdersCount}
            </span>
          </button>

          {subAlert?.type === 'expired' ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-red-700 bg-red-50 px-3.5 py-2.5 rounded-2xl border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Updates paused</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-bold text-yellow-700 bg-yellow-50 px-3.5 py-2.5 rounded-2xl border border-yellow-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span>Receiving updates</span>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Expired Live Queue Banner */}
      {subAlert?.type === 'expired' && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-fade-in">
          <div className="flex items-center space-x-3.5">
            <div className="bg-red-100 p-2.5 rounded-2xl shadow-sm text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black uppercase tracking-tight text-red-800 font-extrabold">
                Subscription Expired
              </h4>
              <p className="text-xs text-red-750 font-semibold mt-0.5">
                Your subscription has ended. Please renew to reactivate your customer dropbox.
              </p>
            </div>
          </div>
          <Link 
            href="/renew" 
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-3 rounded-2xl transition text-xs shrink-0 cursor-pointer shadow-sm border-none text-center block w-full sm:w-auto"
          >
            Renew Subscription
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {subAlert?.type === 'expired' ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Print Queue Locked</h2>
            <div className="w-8 h-1 bg-red-400 mx-auto mb-4 rounded-full" />
            <p className="text-slate-500 font-medium">Your subscription has ended. All incoming customer uploads are suspended and no documents will be shown here until the subscription is renewed.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-100">
              <Printer className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-2">Queue is fully clear</h2>
            <div className="w-8 h-1 bg-yellow-400 mx-auto mb-4 rounded-full" />
            <p className="text-slate-500 font-medium">New print orders will appear here instantly when<br/>customers upload them.</p>
          </div>
        ) : (
          orders.map((order, index) => {
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

            return (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                
                <div className="flex items-center space-x-3.5 md:space-x-4 min-w-0 flex-1">
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="w-7 h-7 rounded-full bg-white border border-slate-300 text-slate-900 font-extrabold text-xs md:text-sm flex items-center justify-center shadow-2xs">
                      {index + 1}
                    </span>
                    <span className="font-extrabold text-base md:text-lg text-slate-950 tracking-tight" title={cleanCustomerName}>
                      {cleanCustomerName}
                    </span>
                    <div className="h-5 w-px bg-slate-200 ml-1 select-none" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base md:text-lg text-slate-900 truncate" title={formatFilename(order.file_path)}>
                      {formatFilename(order.file_path)}
                    </h3>

                    <div className="flex items-center space-x-2 md:space-x-2.5 mt-1.5 text-xs md:text-sm text-slate-500 flex-wrap gap-y-1">
                      {order.customer_phone && (
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          📞 {order.customer_phone}
                        </span>
                      )}
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                        Copies: {order.quantity}
                      </span>
                      {extractedPagesTag && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">
                          Pages: {extractedPagesTag}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-xs bg-slate-100 text-slate-900 border border-slate-200">
                        {order.color_mode.replace('_', ' ')}
                      </span>
                      {extractedAddonsTag && (
                        <span className="bg-white text-slate-950 border border-slate-300 px-2.5 py-0.5 rounded-lg font-black text-xs">
                          + {extractedAddonsTag}
                        </span>
                      )}
                      <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100/50">₹{order.total_cost || 0}</span>
                      <span>•</span>
                      <span>Arrived {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 shrink-0">
                  {!isRawOfficeDoc && handleDownload && (
                    <button
                      onClick={() => handleDownload(order)}
                      title="Download file directly"
                      className="flex items-center space-x-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 px-4 py-3 rounded-xl font-bold transition-colors cursor-pointer border border-slate-200 text-sm md:text-base"
                    >
                      <Download className="w-5 h-5 text-slate-700" />
                      <span>Download</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handlePrint(order)}
                    className="flex items-center space-x-2 bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm cursor-pointer border-none text-sm md:text-base"
                  >
                    {isRawOfficeDoc ? <Download className="w-5 h-5" /> : <Printer className="w-5 h-5" />}
                    <span>{isRawOfficeDoc ? 'Download & Print' : 'Print Now'}</span>
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>
    </main>
  );
};
