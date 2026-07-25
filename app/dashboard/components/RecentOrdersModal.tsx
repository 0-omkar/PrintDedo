import { useState, useEffect } from 'react';
import { CheckCircle, Printer, Download, X } from 'lucide-react';
import { RecentOrder } from '../types';

interface RecentOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentOrders: RecentOrder[];
  formatFilename: (path: string) => string;
  handlePrint: (order: any) => void;
  handleDownload?: (order: any) => void;
}

export const RecentOrdersModal = ({
  isOpen,
  onClose,
  recentOrders,
  formatFilename,
  handlePrint,
  handleDownload,
}: RecentOrdersModalProps) => {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!isOpen) return;
    setNow(Date.now());
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-lg text-left space-y-5 animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
          <div className="bg-green-100 p-3 rounded-2xl text-green-700">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Recents Queue</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              Completed print jobs (Auto-deleted 3 mins after completion)
            </p>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-3.5 pr-1">
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 p-6">
              <CheckCircle className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">No Recent Prints</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Completed print orders will sit here for 3 minutes before automatic removal.</p>
            </div>
          ) : (
            recentOrders.map(({ order, completedAt }) => {
              const elapsed = now - completedAt;
              const remainingMs = Math.max(0, (3 * 60 * 1000) - elapsed);
              const totalSec = Math.floor(remainingMs / 1000);
              const m = Math.floor(totalSec / 60);
              const s = totalSec % 60;
              const timerStr = `${m}:${s < 10 ? '0' : ''}${s}`;

              return (
                <div 
                  key={order.id}
                  className="p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-950 truncate max-w-[240px]" title={formatFilename(order.file_path)}>
                        {formatFilename(order.file_path)}
                      </h4>
                      <span className="text-[10px] font-mono font-black text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                        ⏳ {timerStr} left
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold">
                      {order.customer_name || 'Anonymous'} {order.customer_phone ? `(${order.customer_phone})` : ''}
                    </div>

                    <div className="text-xs text-slate-500 font-bold pt-0.5">
                      Qty: {order.quantity} • {order.color_mode.replace('_', ' ')} • <span className="text-yellow-600">₹{order.total_cost || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {handleDownload && (
                      <button
                        onClick={() => handleDownload(order)}
                        title="Download file directly"
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2.5 rounded-xl text-xs transition flex justify-center items-center space-x-1 border border-slate-200 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-slate-700" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      onClick={() => handlePrint(order)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2.5 rounded-xl text-xs transition flex justify-center items-center space-x-1.5 border-none cursor-pointer shadow-xs"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Reprint</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
