'use client';
import { useState, use, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Star, X, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

const XeroxLogoSVG = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 text-slate-800" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {/* Copier Main Body */}
    <rect x="25" y="40" width="50" height="40" rx="4" fill="none" />
    <line x1="25" y1="52" x2="75" y2="52" />
    {/* Control Panel */}
    <rect x="30" y="44" width="12" height="5" rx="1" fill="currentColor" />
    {/* Paper Trays / Output side */}
    <path d="M75 45h8a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-8" />
    <path d="M25 45h-8a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h-8" />
    {/* Top Scanner Lid */}
    <path d="M22 30h56v10H22z" fill="none" />
    <line x1="25" y1="35" x2="75" y2="35" />
    {/* Top Document Feeder */}
    <path d="M35 18h30l5 12H30z" fill="none" />
    <path d="M60 18h10a2 2 0 0 1 2 2v4" />
    {/* Lower Drawers / Paper Cassette */}
    <line x1="35" y1="65" x2="65" y2="65" />
    <line x1="35" y1="73" x2="65" y2="73" />
    <circle cx="50" cy="65" r="1.5" fill="currentColor" />
    <circle cx="50" cy="73" r="1.5" fill="currentColor" />
  </svg>
);

export default function ShopDropBoxPage({ params }: { params: Promise<{ shopId: string }> }) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [printType, setPrintType] = useState('bw');
  const [shopInfo, setShopInfo] = useState<any>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [logo, setLogo] = useState('');

  // PDF Page Counting & Page Selection States
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pageSelectionMode, setPageSelectionMode] = useState<'all' | 'range' | 'custom'>('all');
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [customPagesInput, setCustomPagesInput] = useState<string>('');

  // Custom addons state
  interface Addon {
    id: string;
    name: string;
    price: number;
  }
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Bulk Pricing Rules State
  interface BulkPriceRule {
    id: string;
    minPages: number;
    printType: string;
    pricePerPage: number;
  }
  const [bulkPrices, setBulkPrices] = useState<BulkPriceRule[]>([]);
  const [appliedBulkRate, setAppliedBulkRate] = useState<number | null>(null);

  // Review states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const resolvedParams = use(params);

  const isSubscriptionExpired = () => {
    if (!shopInfo) return false;
    if (!shopInfo.subscription_expires_at) return true;
    const expires = new Date(shopInfo.subscription_expires_at).getTime();
    return expires < Date.now();
  };

  useEffect(() => {
    // Log the user in anonymously if they aren't already, so they bypass upload RLS
    const initAnonAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        if (error) {
          await supabase.auth.signOut().catch(() => {});
        }
        await supabase.auth.signInAnonymously().catch(() => {});
      }
    };
    initAnonAuth();

    const fetchShopInfo = async () => {
      const { data } = await supabase.from('shops').select('*').eq('id', resolvedParams.shopId).single();
      if (data) setShopInfo(data);
    };
    fetchShopInfo();

    // Load custom addons and logo from local storage if available
    if (typeof window !== 'undefined') {
      const storedLogo = localStorage.getItem('xeroxflow_logo');
      if (storedLogo) setLogo(storedLogo);

      const stored = localStorage.getItem(`xeroxflow_addons_${resolvedParams.shopId}`);
      if (stored) {
        try {
          setAddons(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse addons:', e);
        }
      } else {
        const defaults = [
          { id: 'lamination', name: 'Lamination', price: 15 },
          { id: 'photoprint', name: 'Photo Paper Print', price: 20 },
          { id: 'spiral', name: 'Spiral Binding', price: 40 }
        ];
        setAddons(defaults);
      }

      const storedBulk = localStorage.getItem(`xeroxflow_bulk_prices_${resolvedParams.shopId}`);
      if (storedBulk) {
        try {
          setBulkPrices(JSON.parse(storedBulk));
        } catch (e) {}
      }
    }
  }, [resolvedParams.shopId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setPdfPageCount(null);

    if (selectedFile) {
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const count = pdfDoc.getPageCount();
        setPdfPageCount(count);
        setFromPage(1);
        setToPage(count);
      } catch (err) {
        console.error('Could not parse PDF page count:', err);
      }
    }
  };

  const calculateSelectedPagesCount = (): number => {
    if (pageSelectionMode === 'all') {
      return Math.max(1, pdfPageCount || 1);
    }

    if (pageSelectionMode === 'range') {
      const f = Math.max(1, Math.min(fromPage || 1, pdfPageCount || 9999));
      const t = Math.max(f, Math.min(toPage || 1, pdfPageCount || 9999));
      return Math.max(1, t - f + 1);
    }

    if (pageSelectionMode === 'custom') {
      if (!customPagesInput.trim()) return 1;
      const pagesSet = new Set<number>();
      const parts = customPagesInput.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const s = Math.max(1, Math.min(start, end));
            const e = Math.max(s, Math.max(start, end));
            for (let i = s; i <= e; i++) {
              if (pdfPageCount ? i <= pdfPageCount : true) {
                pagesSet.add(i);
              }
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p > 0 && (pdfPageCount ? p <= pdfPageCount : true)) {
            pagesSet.add(p);
          }
        }
      }
      return pagesSet.size > 0 ? pagesSet.size : 1;
    }

    return 1;
  };

  const selectedPagesCount = calculateSelectedPagesCount();

  useEffect(() => {
    if (shopInfo) {
      let basePrice = 0;
      if (printType === 'bw') basePrice = shopInfo.pricing_bw || 0;
      else if (printType === 'bw_double') basePrice = shopInfo.pricing_bw_double || 0;
      else if (printType === 'color') basePrice = shopInfo.pricing_color || 0;
      else if (printType === 'color_double') basePrice = shopInfo.pricing_color_double || 0;
      
      const pagesPerCopy = calculateSelectedPagesCount();
      const totalPrintedPages = pagesPerCopy * Math.max(1, quantity);

      let finalPrice = basePrice;
      let activeBulk: number | null = null;

      if (bulkPrices.length > 0) {
        const matching = bulkPrices.filter(r => {
          const typeMatch = r.printType === 'all' || r.printType === printType;
          const pageMatch = totalPrintedPages >= r.minPages;
          return typeMatch && pageMatch;
        });

        if (matching.length > 0) {
          const bestRate = Math.min(...matching.map(r => r.pricePerPage));
          if (bestRate < basePrice) {
            finalPrice = bestRate;
            activeBulk = bestRate;
          }
        }
      }

      setAppliedBulkRate(activeBulk);

      const addonsPrice = selectedAddons.reduce((sum, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return sum + (addon ? addon.price : 0);
      }, 0);
      
      setTotalCost((finalPrice * pagesPerCopy * quantity) + addonsPrice);
    }
  }, [quantity, printType, shopInfo, selectedAddons, addons, pageSelectionMode, pdfPageCount, fromPage, toPage, customPagesInput, bulkPrices]);

  const handleUpload = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (!file || !name) return;

    setUploading(true);
    setErrorMsg('');
    
    try {
      // 1. Clean the filename to store it safely in the path without a separate column
      const safeOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${Date.now()}_${safeOriginalName}`;
      const filePath = `${resolvedParams.shopId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('xerox-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Fetch the anonymous user ID to link to the order
      const { data: { user } } = await supabase.auth.getUser();

      // Format customer name to include page selection details & add-ons
      let pageDetailsStr = 'All Pages';
      if (pageSelectionMode === 'range') {
        pageDetailsStr = `Pages ${fromPage}-${toPage}`;
      } else if (pageSelectionMode === 'custom') {
        pageDetailsStr = `Pages ${customPagesInput || 'Custom'}`;
      } else if (pdfPageCount) {
        pageDetailsStr = `All ${pdfPageCount} Pgs (${selectedPagesCount} Total)`;
      }

      let finalCustomerName = `${name} [${pageDetailsStr}]`;
      if (selectedAddons.length > 0) {
        const addonNames = selectedAddons
          .map(id => addons.find(a => a.id === id)?.name)
          .filter(Boolean);
        finalCustomerName += ` [+ ${addonNames.join(', ')}]`;
      }

      // 3. Add to orders table exactly matching your existing schema
      const { error: dbError } = await supabase
        .from('orders')
        .insert({
          shop_id: resolvedParams.shopId,
          customer_id: user?.id,
          file_path: filePath,
          quantity: quantity,
          color_mode: printType,
          status: 'pending',
          customer_name: finalCustomerName,
          customer_phone: phone || '',
          total_cost: totalCost
        });

      if (dbError) throw dbError;

      // Log the upload file size and timestamp to localStorage for admin metrics auditing
      if (typeof window !== 'undefined') {
        const uploadLog = {
          shopId: resolvedParams.shopId,
          size: file.size,
          timestamp: Date.now()
        };
        const storedLogs = localStorage.getItem('xeroxflow_storage_logs');
        let logs = [];
        if (storedLogs) {
          try {
            logs = JSON.parse(storedLogs);
          } catch (e) {}
        }
        logs.push(uploadLog);
        // Only keep the last 48 hours to prevent LocalStorage bloat
        const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
        logs = logs.filter((log: any) => log.timestamp >= fortyEightHoursAgo);
        localStorage.setItem('xeroxflow_storage_logs', JSON.stringify(logs));
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleAddReview = () => {
    const newReview = {
      rating: reviewRating,
      comment: reviewComment,
      name: name || 'Anonymous',
      timestamp: Date.now()
    };
    
    // Save to reviews list in localStorage
    const reviewsKey = `xeroxflow_reviews_list_${resolvedParams.shopId}`;
    let list = [];
    const stored = localStorage.getItem(reviewsKey);
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) {}
    }
    list.push(newReview);
    localStorage.setItem(reviewsKey, JSON.stringify(list));
    
    // Re-calculate average rating and counts
    const count = list.length;
    const sum = list.reduce((s: number, r: any) => s + r.rating, 0);
    const average = sum / count;
    
    // Store average and count so dashboard banner can read it
    localStorage.setItem('xeroxflow_rating', average.toFixed(1));
    localStorage.setItem('xeroxflow_reviews', count.toString());
    
    setReviewSubmitted(true);
    setIsReviewOpen(false);
  };

  if (isSuccess) {
    const upiLink = shopInfo?.upi_id 
      ? `upi://pay?pa=${shopInfo.upi_id}&pn=${encodeURIComponent(shopInfo.store_name || 'Print Shop')}&am=${totalCost.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Print Order for ${name}`)}`
      : '';

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm">
          <CheckCircle className="w-16 h-16 text-yellow-500 mb-4" />
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center">Sent Successfully!</h1>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6 w-full text-center">
            <p className="text-slate-500 text-sm mb-2">Total Amount</p>
            <p className="text-4xl font-black text-slate-900 mb-4">₹{totalCost.toFixed(2)}</p>
            <p className="text-slate-600 text-sm mb-6">
              Please show your name (<strong>{name}</strong>) to the shop owner after you receive your prints to collect.
            </p>
            
            {upiLink && totalCost > 0 && (
              <a 
                href={upiLink}
                className="flex items-center justify-center space-x-2 w-full bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition shadow-sm cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 text-black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span>Pay ₹{totalCost.toFixed(2)} via UPI</span>
              </a>
            )}
          </div>
          <button 
            onClick={() => { setIsSuccess(false); setFile(null); setReviewSubmitted(false); }}
            className="w-full bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-bold hover:bg-yellow-500 transition cursor-pointer border-none shadow-sm"
          >
            Send Another Document
          </button>

          {!reviewSubmitted && (
            <button 
              onClick={() => {
                setReviewRating(5);
                setReviewComment('');
                setIsReviewOpen(true);
              }}
              className="w-full mt-3 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl font-bold hover:bg-slate-50 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span>Write a Review</span>
            </button>
          )}

          {reviewSubmitted && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl p-3 text-xs font-bold text-center w-full">
              Review submitted! Thank you.
            </div>
          )}
        </div>

        {/* Simple Review Modal */}
        {isReviewOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150 text-slate-900">
              <button 
                onClick={() => setIsReviewOpen(false)}
                className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition border-none bg-transparent"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-extrabold mb-1">Write a Review</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">How was your printing experience?</p>
              
              <div className="space-y-5">
                {/* Star rating selector */}
                <div className="flex items-center justify-center space-x-2.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition cursor-pointer border-none bg-transparent"
                    >
                      <Star 
                        className={`w-9 h-9 ${star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
                      />
                    </button>
                  ))}
                </div>

                {/* Comment textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Comment (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-sm font-medium"
                  />
                </div>

                <button 
                  onClick={handleAddReview}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl transition shadow-sm border-none cursor-pointer text-sm"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isSubscriptionExpired()) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

        <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 mb-6 text-yellow-500 animate-pulse">
            <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-center text-slate-950 uppercase w-full">
            {shopInfo?.store_name}
          </h1>
          
          <p className="text-slate-500 text-center text-xs font-semibold tracking-wide uppercase mt-2 w-full mb-8">
            XEROX • PRINT • SCAN • LAMINATION
          </p>

          <div className="bg-yellow-50 border border-yellow-100 rounded-3xl p-6.5 w-full shadow-sm text-center space-y-4">
            <h2 className="text-lg font-black text-yellow-800 uppercase tracking-tight">Service Suspended</h2>
            <p className="text-xs text-yellow-750 font-semibold leading-relaxed">
              This shop's print dropbox portal is temporarily disabled due to an expired subscription.
            </p>
            <Link 
              href="/renew"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3.5 px-6 rounded-xl transition shadow-sm border-none cursor-pointer text-sm block w-full text-center"
            >
              Contact Admin to Renew
            </Link>
          </div>

          <div className="mt-8">
            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-650 transition-colors">← Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col items-center py-10 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

      <main className="relative z-10 w-full max-w-md flex flex-col items-center mt-10">
        <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0 mb-6">
          {logo ? (
            <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
          ) : (
            <XeroxLogoSVG />
          )}
        </div>

        <h1 className="text-3xl font-black tracking-tight text-center text-slate-950 uppercase w-full">
          {shopInfo?.store_name || 'Loading...'}
        </h1>
        <p className="text-slate-500 text-center text-sm font-semibold tracking-wide uppercase mt-2 w-full">
          XEROX • PRINT • SCAN • LAMINATION
        </p>
        <div className="w-full flex justify-end pr-3.5 mb-8 -mt-0.5 animate-pulse">
          <Link href="/" className="text-[10px] font-extrabold text-yellow-600 uppercase tracking-widest hover:underline cursor-pointer">
            Digitalised by XeroxFlow
          </Link>
        </div>

        <form onSubmit={handleUpload} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 w-full flex flex-col space-y-5">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
              {errorMsg}
            </div>
          )}

          {/* Dropbox File Upload Box */}
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-yellow-400 transition-colors relative cursor-pointer">
            <input 
              type="file" 
              onChange={handleFileChange} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf"
              required
            />
            <FileText className={`w-10 h-10 mb-3 ${file ? 'text-yellow-500 animate-bounce' : 'text-slate-400'}`} />
            {file ? (
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-slate-900 bg-yellow-100 px-3 py-1 rounded-full overflow-hidden text-ellipsis max-w-[200px] whitespace-nowrap">
                  {file.name}
                </span>
                {pdfPageCount !== null ? (
                  <span className="text-xs font-bold text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-md mt-2 border border-yellow-200">
                    📄 {pdfPageCount} Page{pdfPageCount > 1 ? 's' : ''} Detected
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 mt-2">Reading PDF pages...</span>
                )}
              </div>
            ) : (
              <>
                <span className="text-sm font-semibold text-slate-700">Tap to select a PDF</span>
                <span className="text-xs text-slate-400 mt-1">Maximum size: 25MB</span>
              </>
            )}
          </div>

          {/* Page Selection Options (All / Range / Custom Specific Pages) */}
          {file && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between">
                <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pages to Print
                </span>
                <span className="text-xs font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedPagesCount} Page{selectedPagesCount > 1 ? 's' : ''} Selected
                </span>
              </div>

              {/* Mode Buttons */}
              <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPageSelectionMode('all')}
                  className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-center text-[11px] ${
                    pageSelectionMode === 'all'
                      ? 'bg-yellow-400 border-yellow-400 text-slate-950 shadow-xs font-black'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Pages ({pdfPageCount || 1})
                </button>

                <button
                  type="button"
                  onClick={() => setPageSelectionMode('range')}
                  className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-center text-[11px] ${
                    pageSelectionMode === 'range'
                      ? 'bg-yellow-400 border-yellow-400 text-slate-950 shadow-xs font-black'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Page Range
                </button>

                <button
                  type="button"
                  onClick={() => setPageSelectionMode('custom')}
                  className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-center text-[11px] ${
                    pageSelectionMode === 'custom'
                      ? 'bg-yellow-400 border-yellow-400 text-slate-950 shadow-xs font-black'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Specific Pages
                </button>
              </div>

              {/* Range Mode Input (From - To) */}
              {pageSelectionMode === 'range' && (
                <div className="grid grid-cols-2 gap-3 pt-1 animate-fade-in">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Page</label>
                    <input
                      type="number"
                      min="1"
                      max={pdfPageCount || 9999}
                      value={fromPage}
                      onChange={(e) => setFromPage(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Page</label>
                    <input
                      type="number"
                      min={fromPage}
                      max={pdfPageCount || 9999}
                      value={toPage}
                      onChange={(e) => setToPage(parseInt(e.target.value) || 1)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Custom Pages Input */}
              {pageSelectionMode === 'custom' && (
                <div className="pt-1 animate-fade-in">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Enter Page Numbers / Ranges</label>
                  <input
                    type="text"
                    placeholder="e.g. 1-5, 8, 11-13"
                    value={customPagesInput}
                    onChange={(e) => setCustomPagesInput(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-semibold bg-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">Use commas and hyphens (e.g. 1-3, 5, 8-10)</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Add-ons Checkboxes */}
          {file && addons.length > 0 && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Add-on Services (Optional)
              </span>
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
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
                              setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                            } else {
                              setSelectedAddons([...selectedAddons, addon.id]);
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

          {/* Copies & Print Type Settings (Side-by-side in grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Copies/Pages</label>
              <input 
                type="number" 
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Print Type</label>
              <select 
                value={printType}
                onChange={(e) => setPrintType(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 text-sm font-medium"
              >
                <option value="bw">B&W (Single)</option>
                <option value="bw_double">B&W (Double)</option>
                <option value="color">Color (Single)</option>
                <option value="color_double">Color (Double)</option>
              </select>
            </div>
          </div>

          {/* Name & Phone Fields (Name above Phone) */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                required
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
              />
            </div>
          </div>

          {appliedBulkRate !== null && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-2.5 rounded-xl text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span>🏷️ Bulk Discount Applied!</span>
              <span className="font-extrabold text-green-700 bg-white px-2 py-0.5 rounded border border-green-200">
                ₹{appliedBulkRate.toFixed(2)} / page
              </span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={!file || uploading || !name}
            className="w-full bg-yellow-400 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-between items-center px-6 mt-2 cursor-pointer shadow-sm border-none"
          >
            <span>{uploading ? 'Sending...' : 'Send to Printer Queue'}</span>
            {!uploading && (
              <span className="bg-black/10 px-3 py-1 rounded-lg text-sm font-bold">
                ₹{totalCost.toFixed(2)}
              </span>
            )}
          </button>
        </form>
        
        <p className="text-xs text-slate-400 mt-8 text-center px-4">
          Documents are encrypted and automatically deleted 10 minutes after upload to protect your privacy.
        </p>
      </main>
    </div>
  );
}
