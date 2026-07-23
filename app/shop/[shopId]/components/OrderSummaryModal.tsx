import { FileText, X, Loader2 } from 'lucide-react';
import { AttachedDoc, Addon } from '../types';

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachedDocs: AttachedDoc[];
  file: File | null;
  pdfPageCount: number | null;
  pageSelectionMode: 'all' | 'range' | 'custom';
  fromPage: number;
  toPage: number;
  customPagesInput: string;
  selectedPagesCount: number;
  quantity: number;
  printType: string;
  selectedAddons: string[];
  currentDocCost: number;
  grandTotalCost: number;
  totalBatchDocsCount: number;
  addons: Addon[];
  uploading: boolean;
  onConfirmUpload: () => void;
}

export const OrderSummaryModal = ({
  isOpen,
  onClose,
  attachedDocs,
  file,
  pdfPageCount,
  pageSelectionMode,
  fromPage,
  toPage,
  customPagesInput,
  selectedPagesCount,
  quantity,
  printType,
  selectedAddons,
  currentDocCost,
  grandTotalCost,
  totalBatchDocsCount,
  addons,
  uploading,
  onConfirmUpload,
}: OrderSummaryModalProps) => {
  if (!isOpen) return null;

  const allDocsToReview = [
    ...attachedDocs,
    ...(file ? [{
      id: 'active_doc',
      file,
      pdfPageCount,
      pageSelectionMode,
      fromPage,
      toPage,
      customPagesInput,
      selectedPagesCount,
      quantity,
      printType,
      selectedAddons: [...selectedAddons],
      itemCost: currentDocCost
    }] : [])
  ];

  const formatPrintTypeLabel = (t: string) => {
    if (t === 'bw') return 'B&W (Single)';
    if (t === 'bw_double') return 'B&W (Double)';
    if (t === 'color') return 'Color (Single)';
    if (t === 'color_double') return 'Color (Double)';
    return t;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md text-left space-y-4 animate-scale-in relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          disabled={uploading}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent cursor-pointer disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 pr-8">
          <div className="bg-yellow-100 p-2.5 rounded-2xl text-yellow-700 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-950 uppercase tracking-wide leading-tight">
              Please review your settings before submitting
            </h3>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-2">
          <span className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">
            Configured Documents ({totalBatchDocsCount})
          </span>
          <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
            {allDocsToReview.map((doc, idx) => {
              let pageText = 'All Pages';
              if (doc.pageSelectionMode === 'range') pageText = `Pages ${doc.fromPage} - ${doc.toPage}`;
              else if (doc.pageSelectionMode === 'custom') pageText = `Pages ${doc.customPagesInput || 'Custom'}`;
              else if (doc.pdfPageCount) pageText = `All ${doc.pdfPageCount} Pages`;

              const addonNames = doc.selectedAddons
                .map(id => addons.find(a => a.id === id)?.name)
                .filter(Boolean);

              return (
                <div key={doc.id || idx} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/90 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-slate-900 truncate" title={doc.file.name}>{doc.file.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{pageText}</p>
                    </div>
                    <span className="text-xs font-black text-yellow-600 shrink-0 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                      ₹{doc.itemCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-600 font-medium pt-1 border-t border-slate-200/60">
                    <span>Print Mode: <strong className="text-slate-900">{formatPrintTypeLabel(doc.printType)}</strong></span>
                    <span>•</span>
                    <span>Copies: <strong className="text-slate-900">{doc.quantity}</strong></span>
                  </div>

                  {addonNames.length > 0 && (
                    <div className="text-[11px] text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                      + Add-ons: {addonNames.join(', ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Amount Card */}
        <div className="bg-white border-2 border-yellow-400 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Grand Total</p>
            <p className="text-[11px] text-slate-600 font-semibold mt-0.5">{totalBatchDocsCount} {totalBatchDocsCount > 1 ? 'Files' : 'File'} Configured</p>
          </div>
          <p className="text-2xl font-black text-slate-950">₹{grandTotalCost.toFixed(2)}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onConfirmUpload}
            disabled={uploading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black py-3.5 rounded-xl transition shadow-sm cursor-pointer border-none text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {uploading ? 'Sending to Queue...' : 'Confirm & Submit to Queue'}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl border border-slate-200 transition cursor-pointer text-xs disabled:opacity-50"
          >
            Edit Order / Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
