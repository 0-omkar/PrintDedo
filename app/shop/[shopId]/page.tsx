'use client';
import { use } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Loader2, 
  Store, 
  User, 
  ShieldCheck, 
  Minus,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { SuccessScreen } from './components/SuccessScreen';
import { ExpiredSubscriptionScreen } from './components/ExpiredSubscriptionScreen';
import { OrderSummaryModal } from './components/OrderSummaryModal';
import { useShopDropBoxViewModel } from './viewmodels/useShopDropBoxViewModel';

export default function ShopDropBoxPage({ params }: { params: Promise<{ shopId: string }> }) {
  const resolvedParams = use(params);
  const vm = useShopDropBoxViewModel(resolvedParams.shopId);

  if (vm.isSuccess) {
    return (
      <SuccessScreen
        shopName={vm.shopInfo?.store_name}
        logo={vm.logo}
        name={vm.name}
        submittedDocCount={vm.submittedDocCount}
        onAttachAnother={() => {
          vm.setIsSuccess(false);
          vm.setFile(null);
          vm.setAttachedDocs([]);
          vm.setReviewSubmitted(false);
        }}
        reviewSubmitted={vm.reviewSubmitted}
        isReviewOpen={vm.isReviewOpen}
        setIsReviewOpen={vm.setIsReviewOpen}
        shopRating={vm.shopRating}
        setShopRating={vm.setShopRating}
        shopComment={vm.shopComment}
        setShopComment={vm.setShopComment}
        platformRating={vm.platformRating}
        setPlatformRating={vm.setPlatformRating}
        platformComment={vm.platformComment}
        setPlatformComment={vm.setPlatformComment}
        onAddReview={vm.handleAddReview}
      />
    );
  }

  if (vm.isSubscriptionExpired()) {
    return <ExpiredSubscriptionScreen storeName={vm.shopInfo?.store_name} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] font-sans text-slate-900 flex flex-col items-center py-6 px-4 relative">
      
      {/* Top Header Logo */}
      <header className="mb-5 text-center">
        <BrandLogo size="lg" showSubtitle href="/" />
      </header>

      <main className="relative z-10 w-full max-w-md flex flex-col space-y-4">
        
        {/* 1. Shop Info Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shrink-0 overflow-hidden">
            {vm.logo ? (
              <img src={vm.logo} alt="Shop Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-7 h-7 text-amber-500" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {vm.shopInfo?.store_name || 'Loading...'}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-0.5">
              ID: <span className="text-amber-500 uppercase font-black">{resolvedParams.shopId}</span>
            </p>
          </div>
        </div>

        <form onSubmit={vm.handleOpenSummaryModal} className="flex flex-col space-y-4">
          
          {vm.errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3.5 rounded-2xl text-xs font-semibold text-center">
              {vm.errorMsg}
            </div>
          )}

          {/* 2. Your Name Card */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-2">
            <label className="block text-xs font-bold text-slate-900">
              Your Name <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                placeholder="Enter your name"
                required
                maxLength={100}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:outline-none text-slate-900 bg-white"
              />
            </div>
          </div>

          {/* Attached Documents List */}
          {vm.attachedDocs.length > 0 && (
            <div className="space-y-3">
              {vm.attachedDocs.map((doc, idx) => (
                <div key={doc.id} className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900">Document {idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => vm.handleRemoveAttachedDoc(doc.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition border-none bg-transparent cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3 flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-slate-900 truncate" title={doc.file.name}>{doc.file.name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {doc.selectedPagesCount} Page • {doc.quantity} Cop{doc.quantity > 1 ? 'ies' : 'y'} • {doc.printType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 font-bold text-[11px] px-2.5 py-1 rounded-full shrink-0">
                      📄 {doc.selectedPagesCount} Page Detected
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active File Card or File Picker Dropzone */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-2xs space-y-4">
            
            {/* Header / Document Picker */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">
                Document {vm.attachedDocs.length + 1}
              </span>
              {vm.file && (
                <button
                  type="button"
                  onClick={() => vm.setFile(null)}
                  className="p-1 text-red-500 hover:text-red-700 transition border-none bg-transparent cursor-pointer"
                  title="Remove current document"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {!vm.file ? (
              <div className="relative border-2 border-dashed border-amber-300 hover:border-amber-400 rounded-2xl p-6 text-center transition-colors bg-amber-50/20">
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.xlsx,.doc,.ppt,.txt,.csv"
                  onChange={vm.handleFileChange}
                  disabled={vm.uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                />
                <FileText className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {vm.attachedDocs.length > 0 ? 'Attach Another Document / Image' : 'Click to Upload Document / Image'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, Word, PPT, Excel, Images (Max 50MB)</p>
              </div>
            ) : (
              <>
                {/* File info banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between space-x-3">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-red-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate" title={vm.file.name}>
                        {vm.file.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {vm.pdfPageCount || 1} Page • PDF • {(vm.file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-700 font-bold text-[11px] px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                    📄 {vm.pdfPageCount || 1} Page Detected
                  </span>
                </div>

                {/* Pages to Print Section */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-900">Pages to Print</label>
                    <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {vm.selectedPagesCount} {vm.selectedPagesCount === 1 ? 'Page' : 'Pages'} Selected
                    </span>
                  </div>

                  {!vm.isRawOfficeDoc ? (
                    <>
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-700">
                        <button
                          type="button"
                          onClick={() => vm.setPageSelectionMode('all')}
                          className={`py-2 rounded-xl transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'all' ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold' : 'hover:bg-slate-200/80 bg-transparent text-slate-600'}`}
                        >
                          All Pages {vm.pdfPageCount ? `(${vm.pdfPageCount})` : ''}
                        </button>
                        <button
                          type="button"
                          onClick={() => vm.setPageSelectionMode('range')}
                          className={`py-2 rounded-xl transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'range' ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold' : 'hover:bg-slate-200/80 bg-transparent text-slate-600'}`}
                        >
                          Page Range
                        </button>
                        <button
                          type="button"
                          onClick={() => vm.setPageSelectionMode('custom')}
                          className={`py-2 rounded-xl transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'custom' ? 'bg-amber-400 text-slate-950 shadow-2xs font-extrabold' : 'hover:bg-slate-200/80 bg-transparent text-slate-600'}`}
                        >
                          Specific Pages
                        </button>
                      </div>

                      {/* Range Inputs */}
                      {vm.pageSelectionMode === 'range' && (
                        <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Page</label>
                            <input
                              type="number"
                              min="1"
                              max={vm.pdfPageCount || undefined}
                              placeholder="1"
                              value={vm.fromPage}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                                vm.setFromPage(val);
                              }}
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Page</label>
                            <input
                              type="number"
                              min="1"
                              max={vm.pdfPageCount || undefined}
                              placeholder={vm.pdfPageCount ? `${vm.pdfPageCount}` : '10'}
                              value={vm.toPage}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                                vm.setToPage(val);
                              }}
                              className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>
                      )}

                      {/* Custom Input */}
                      {vm.pageSelectionMode === 'custom' && (
                        <div className="pt-1 animate-fade-in space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Specific Pages (e.g. 1, 3, 5-8)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1, 3, 5-8"
                            value={vm.customPagesInput}
                            onChange={(e) => vm.setCustomPagesInput(e.target.value)}
                            maxLength={100}
                            className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={vm.pdfPageCount || 1}
                        onChange={(e) => {
                          const val = Math.max(1, parseInt(e.target.value) || 1);
                          vm.setPdfPageCount(val);
                          vm.setFromPage(1);
                          vm.setToPage(val);
                          vm.setCustomPagesInput(`1-${val}`);
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>

                {/* Copies & Print Type Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">Copies</label>
                    <div className="flex items-center justify-between border border-slate-200 rounded-2xl p-1.5 bg-white">
                      <button 
                        type="button"
                        onClick={() => vm.setQuantity(Math.max(1, vm.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-black flex items-center justify-center transition border-none cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-sm text-slate-900">{vm.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => vm.setQuantity(Math.min(100, vm.quantity + 1))}
                        className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 font-black flex items-center justify-center transition border-none cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">Print Type</label>
                    <div className="relative">
                      <select 
                        value={vm.printType}
                        onChange={(e) => vm.setPrintType(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-2xl bg-white text-slate-900 text-xs font-bold outline-none focus:border-amber-400 appearance-none pr-8 cursor-pointer"
                      >
                        <option value="bw">B&W (Single)</option>
                        <option value="bw_double">B&W (Double)</option>
                        <option value="color">Color (Single)</option>
                        <option value="color_double">Color (Double)</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Add-on Services (Optional) */}
                {vm.addons.length > 0 && (
                  <div className="space-y-2.5 pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-900">
                      Add-on Services <span className="text-slate-400 font-medium">(Optional)</span>
                    </label>

                    <div className="space-y-2">
                      {vm.addons.map((addon) => {
                        const isChecked = vm.selectedAddons.includes(addon.id);
                        return (
                          <label 
                            key={addon.id} 
                            className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer select-none ${isChecked ? 'bg-amber-50/50 border-amber-400 text-slate-900 shadow-2xs' : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-700'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <input 
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    vm.setSelectedAddons(vm.selectedAddons.filter(id => id !== addon.id));
                                  } else {
                                    vm.setSelectedAddons([...vm.selectedAddons, addon.id]);
                                  }
                                }}
                                className="w-4 h-4 accent-amber-400 cursor-pointer rounded focus:ring-0"
                              />
                              <span>{addon.name}</span>
                            </div>
                            <span className="text-xs text-slate-900 font-bold">
                              +₹{addon.price.toFixed(2)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Button to attach document if current document is configured */}
          {vm.file && (
            <button
              type="button"
              onClick={vm.handleAttachAnother}
              className="w-full border-2 border-dashed border-amber-300 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-600 font-bold py-3.5 rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 text-xs shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>Attach Another Document</span>
            </button>
          )}

          {/* Submit Review Order Button */}
          <button 
            type="submit" 
            disabled={vm.totalBatchDocsCount === 0 || vm.uploading || !vm.name}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black py-4 px-6 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-between items-center cursor-pointer shadow-md border-none text-sm"
          >
            {vm.uploading ? (
              <div className="flex items-center space-x-2 mx-auto">
                <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                <span className="font-extrabold uppercase text-xs tracking-wider">Uploading Document...</span>
              </div>
            ) : (
              <>
                <span className="font-black text-base">Review Order</span>
                <span className="bg-slate-950/10 px-3 py-1 rounded-xl text-sm font-black">
                  ₹{vm.grandTotalCost.toFixed(2)}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Security Privacy Shield Note */}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium justify-center pt-2 text-center max-w-xs mx-auto">
          <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
          <span>Documents are encrypted and automatically deleted 10 minutes after upload to protect your privacy.</span>
        </div>

        {/* Screen Loader Overlay during document upload */}
        {vm.uploading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-xs border border-slate-100 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner">
                <Loader2 className="w-9 h-9 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">Sending to Shop Queue...</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">Please wait while your document is uploaded.</p>
              </div>
            </div>
          </div>
        )}

        <OrderSummaryModal
          isOpen={vm.isSummaryModalOpen}
          onClose={() => vm.setIsSummaryModalOpen(false)}
          attachedDocs={vm.attachedDocs}
          file={vm.file}
          pdfPageCount={vm.pdfPageCount}
          pageSelectionMode={vm.pageSelectionMode}
          fromPage={typeof vm.fromPage === 'number' ? vm.fromPage : 1}
          toPage={typeof vm.toPage === 'number' ? vm.toPage : (vm.pdfPageCount || 1)}
          customPagesInput={vm.customPagesInput}
          selectedPagesCount={vm.selectedPagesCount}
          quantity={vm.quantity}
          printType={vm.printType}
          selectedAddons={vm.selectedAddons}
          currentDocCost={vm.currentDocCost}
          grandTotalCost={vm.grandTotalCost}
          totalBatchDocsCount={vm.totalBatchDocsCount}
          addons={vm.addons}
          uploading={vm.uploading}
          onConfirmUpload={vm.executeFinalUpload}
        />
      </main>
    </div>
  );
}
