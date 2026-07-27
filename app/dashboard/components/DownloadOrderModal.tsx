import { useState } from 'react';
import { Download, CheckCircle, X, FileText, Phone, User, Copy, Layers, Palette, DollarSign } from 'lucide-react';

interface DownloadOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any | null;
  formatFilename: (path: string) => string;
  onConfirmDownload: (order: any) => Promise<void>;
  onCompleteOrder: (orderId: string) => Promise<void>;
}

export const DownloadOrderModal = ({
  isOpen,
  onClose,
  order,
  formatFilename,
  onConfirmDownload,
  onCompleteOrder,
}: DownloadOrderModalProps) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [completing, setCompleting] = useState(false);

  if (!isOpen || !order) return null;

  const rawCustomerName = (order.customer_name || 'Anonymous').replace(/\s*\[[^\]]+\]/g, '').trim();

  let rawPageSpec = 'All Pages';
  const pageMatch = (order.customer_name || '').match(/\[(?:Pages|All)\s+([^\]]+)\]/i);
  if (pageMatch && pageMatch[1]) {
    const clean = pageMatch[1].replace(/^Pages\s*/i, '').trim();
    rawPageSpec = clean;
  }

  const filename = formatFilename(order.file_path);
  const colorModeStr = (order.color_mode || 'bw').replace('_', ' ').toUpperCase();

  const handleDownloadClick = async () => {
    setDownloading(true);
    try {
      await onConfirmDownload(order);
      setDownloaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const handleCompleteClick = async () => {
    setCompleting(true);
    try {
      await onCompleteOrder(order.id);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-xl text-left space-y-6 animate-scale-in relative">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
          <div className="bg-yellow-100 p-3 rounded-2xl text-yellow-700">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">Job Requirements Summary</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Review customer specifications before downloading file.
            </p>
          </div>
        </div>

        {/* Requirements Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><User className="w-4 h-4 text-slate-400" /> Customer</span>
            <strong className="text-slate-950 font-extrabold">{rawCustomerName}</strong>
          </div>

          {order.customer_phone && (
            <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
              <span className="text-slate-500 font-bold flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400" /> Phone</span>
              <strong className="text-slate-950 font-extrabold">{order.customer_phone}</strong>
            </div>
          )}

          <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400" /> Document</span>
            <strong className="text-slate-950 font-extrabold truncate max-w-[240px]" title={filename}>{filename}</strong>
          </div>

          <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Copy className="w-4 h-4 text-slate-400" /> Copies</span>
            <strong className="text-slate-950 font-extrabold">{order.quantity}</strong>
          </div>

          <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Layers className="w-4 h-4 text-slate-400" /> Pages Selection</span>
            <strong className="text-slate-950 font-extrabold">{rawPageSpec}</strong>
          </div>

          <div className="flex justify-between items-center text-sm py-1 border-b border-slate-200/60">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><Palette className="w-4 h-4 text-slate-400" /> Color Mode</span>
            <strong className="text-slate-950 font-extrabold">{colorModeStr}</strong>
          </div>

          <div className="flex justify-between items-center text-sm pt-1">
            <span className="text-slate-500 font-bold flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-400" /> Total Cost</span>
            <strong className="text-yellow-600 font-black text-base">₹{order.total_cost || 0}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full">
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            className="w-full sm:flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-3 px-4 rounded-xl text-sm transition flex items-center justify-center space-x-2 border border-slate-300 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Download File'}</span>
          </button>

          <button
            onClick={handleCompleteClick}
            disabled={completing}
            className="w-full sm:flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-black py-3 px-4 rounded-xl text-sm transition flex items-center justify-center space-x-2 border-none cursor-pointer shadow-sm disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{completing ? 'Completing...' : 'Done / Complete Order'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
