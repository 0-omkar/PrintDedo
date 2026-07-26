'use client';
import { use } from 'react';
import Link from 'next/link';
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react';
import { XeroxLogoSVG } from '@/components/XeroxLogoSVG';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
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
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center mt-10">
        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 mb-6">
          {vm.logo ? (
            <img src={vm.logo} alt="Shop Logo" className="w-full h-full object-cover" />
          ) : (
            <XeroxLogoSVG />
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center text-slate-950 uppercase w-full">
          {vm.shopInfo?.store_name || 'Loading...'}
        </h1>
        <p className="text-slate-500 text-center text-sm font-semibold tracking-wide uppercase mt-2 w-full">
          XEROX • PRINT • SCAN • LAMINATION
        </p>
        <div className="w-full flex justify-end pr-3.5 mb-8 -mt-0.5 animate-pulse">
          <Link href="/" className="text-[10px] font-extrabold text-yellow-600 uppercase tracking-widest hover:underline cursor-pointer">
            Digitalised by PrintDedo
          </Link>
        </div>

        <form onSubmit={vm.handleOpenSummaryModal} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 w-full flex flex-col space-y-5">
          
          {vm.errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
              {vm.errorMsg}
            </div>
          )}

          {/* Attached Documents List */}
          {vm.attachedDocs.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Attached Documents ({vm.attachedDocs.length})
                </span>
                <span className="text-xs font-extrabold text-slate-900 bg-yellow-300/80 px-2 py-0.5 rounded border border-yellow-400">
                  ₹{vm.attachedTotalCost.toFixed(2)} Subtotal
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {vm.attachedDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium shadow-2xs">
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <FileText className="w-5 h-5 text-yellow-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{doc.file.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {doc.selectedPagesCount} Pgs • {doc.quantity} Cop{doc.quantity > 1 ? 'ies' : 'y'} • {doc.printType.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="font-extrabold text-slate-900">₹{doc.itemCost.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => vm.handleRemoveAttachedDoc(doc.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer shrink-0"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Picker Dropzone */}
          <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-yellow-400 transition-colors bg-slate-50/50">
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.pptx,.xlsx,.doc,.ppt,.txt,.csv"
              onChange={vm.handleFileChange}
              disabled={vm.uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            <FileText className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {vm.file ? vm.file.name : (vm.attachedDocs.length > 0 ? 'Attach Another Document / Image' : 'Click to Upload Document / Image')}
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF, Word, PPT, Excel, Images (Max 50MB)</p>

            {vm.file && (
              <div className="mt-2 inline-flex items-center space-x-1.5 bg-yellow-100/80 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 animate-fade-in">
                {vm.isRawOfficeDoc ? (
                  <span>📄 {vm.pdfPageCount || 1} {vm.file.name.toLowerCase().endsWith('.pptx') || vm.file.name.toLowerCase().endsWith('.ppt') ? 'Slides' : 'Pages'} Detected ({vm.file.name.split('.').pop()?.toUpperCase()})</span>
                ) : (
                  <span>📄 {vm.pdfPageCount || 1} {vm.pdfPageCount === 1 ? 'Page' : 'Pages'} Detected</span>
                )}
              </div>
            )}
          </div>

          {/* Office Document Slide / Page Count Control */}
          {vm.file && vm.isRawOfficeDoc && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total {vm.file.name.toLowerCase().endsWith('.pptx') || vm.file.name.toLowerCase().endsWith('.ppt') ? 'Slides' : 'Pages'} to Print
                </span>
                <span className="text-xs font-extrabold text-slate-900 bg-yellow-300/80 px-2 py-0.5 rounded border border-yellow-400">
                  {vm.pdfPageCount || 1} {vm.file.name.toLowerCase().endsWith('.pptx') || vm.file.name.toLowerCase().endsWith('.ppt') ? 'Slides' : 'Pages'}
                </span>
              </div>
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
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 outline-none focus:border-yellow-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Auto-detected from document file. You can adjust if needed.</p>
            </div>
          )}

          {/* Page Selection Controls (Only for PDF Documents) */}
          {vm.file && !vm.isRawOfficeDoc && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pages to Print
                </span>
                <span className="text-xs font-extrabold text-slate-900 bg-yellow-300/80 px-2 py-0.5 rounded border border-yellow-400">
                  {vm.selectedPagesCount} {vm.selectedPagesCount === 1 ? 'Page' : 'Pages'} Selected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs font-bold text-slate-700">
                <button
                  type="button"
                  onClick={() => vm.setPageSelectionMode('all')}
                  className={`py-1.5 rounded-lg transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'all' ? 'bg-yellow-400 text-black shadow-xs' : 'hover:bg-slate-200/80 bg-transparent'}`}
                >
                  All Pages {vm.pdfPageCount ? `(${vm.pdfPageCount})` : ''}
                </button>
                <button
                  type="button"
                  onClick={() => vm.setPageSelectionMode('range')}
                  className={`py-1.5 rounded-lg transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'range' ? 'bg-yellow-400 text-black shadow-xs' : 'hover:bg-slate-200/80 bg-transparent'}`}
                >
                  Page Range
                </button>
                <button
                  type="button"
                  onClick={() => vm.setPageSelectionMode('custom')}
                  className={`py-1.5 rounded-lg transition-all border-none cursor-pointer ${vm.pageSelectionMode === 'custom' ? 'bg-yellow-400 text-black shadow-xs' : 'hover:bg-slate-200/80 bg-transparent'}`}
                >
                  Specific Pages
                </button>
              </div>

              {/* Page Range Inputs */}
              {vm.pageSelectionMode === 'range' && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Page</label>
                    <input
                      type="number"
                      min="1"
                      max={vm.pdfPageCount || undefined}
                      placeholder="e.g. 1"
                      value={vm.fromPage}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                        vm.setFromPage(val);
                      }}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Page</label>
                    <input
                      type="number"
                      min="1"
                      max={vm.pdfPageCount || undefined}
                      placeholder={vm.pdfPageCount ? `e.g. ${vm.pdfPageCount}` : 'e.g. 10'}
                      value={vm.toPage}
                      onChange={(e) => {
                        const val = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                        vm.setToPage(val);
                      }}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              )}

              {/* Specific Pages Input */}
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
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white focus:outline-none focus:border-yellow-400"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Use commas for individual pages and hyphens for page ranges.</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Add-ons Checkboxes */}
          {vm.file && vm.addons.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Add-on Services (Optional)
              </span>
              <div className="space-y-2">
                {vm.addons.map((addon) => {
                  const isChecked = vm.selectedAddons.includes(addon.id);
                  return (
                    <label 
                      key={addon.id} 
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer select-none ${isChecked ? 'bg-yellow-50/50 border-yellow-400 text-slate-900 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-700'}`}
                    >
                      <div className="flex items-center space-x-2.5">
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
                          className="w-4 h-4 accent-yellow-400 cursor-pointer rounded focus:ring-0"
                        />
                        <span>{addon.name}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-bold">
                        +₹{addon.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Copies & Print Type Settings */}
          {vm.file && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Copies</label>
                <input 
                  type="number" 
                  min="1"
                  max="100"
                  value={vm.quantity}
                  onChange={(e) => vm.setQuantity(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Print Type</label>
                <select 
                  value={vm.printType}
                  onChange={(e) => vm.setPrintType(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 text-sm font-medium"
                >
                  <option value="bw">B&W (Single)</option>
                  <option value="bw_double">B&W (Double)</option>
                  <option value="color">Color (Single)</option>
                  <option value="color_double">Color (Double)</option>
                </select>
              </div>
            </div>
          )}

          {/* Button to attach current document */}
          {vm.file && (
            <button
              type="button"
              onClick={vm.handleAttachAnother}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl transition cursor-pointer border border-slate-200 flex items-center justify-center gap-2 text-sm shadow-xs"
            >
              <Plus className="w-4 h-4 text-slate-700" />
              <span>Attach Document</span>
            </button>
          )}

          {/* Name & Phone Fields */}
          <div className="space-y-4 pt-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input 
                type="text" 
                value={vm.name}
                onChange={(e) => vm.setName(e.target.value)}
                placeholder="Name"
                required
                maxLength={100}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="tel" 
                value={vm.phone}
                onChange={(e) => vm.setPhone(e.target.value)}
                placeholder="Phone Number"
                maxLength={20}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={vm.totalBatchDocsCount === 0 || vm.uploading || !vm.name}
            className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-between items-center px-6 mt-2 cursor-pointer shadow-sm border-none"
          >
            {vm.uploading ? (
              <div className="flex items-center space-x-2 mx-auto">
                <Loader2 className="w-5 h-5 text-black animate-spin" />
                <span className="font-extrabold uppercase text-xs tracking-wider">Uploading Document...</span>
              </div>
            ) : (
              <>
                <span>Review Order</span>
                <span className="bg-black/10 px-3 py-1 rounded-lg text-sm font-bold">
                  ₹{vm.grandTotalCost.toFixed(2)}
                </span>
              </>
            )}
          </button>
        </form>

        {/* Screen Loader Overlay during document upload */}
        {vm.uploading && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-xs border border-slate-100 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 shadow-inner">
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
        
        <p className="text-xs text-slate-400 mt-8 text-center px-4">
          Documents are encrypted and automatically deleted 10 minutes after upload to protect your privacy.
        </p>
      </main>
    </div>
  );
}
