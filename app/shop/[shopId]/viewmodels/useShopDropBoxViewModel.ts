import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { AttachedDoc, Addon, PriceTier, ShopInfo } from '../types';

export function useShopDropBoxViewModel(shopId: string) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [printType, setPrintType] = useState('bw');
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [logo, setLogo] = useState('');

  // Multi-document list state
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([]);
  const [submittedDocCount, setSubmittedDocCount] = useState(1);

  // PDF Page Counting & Page Selection States
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pageSelectionMode, setPageSelectionMode] = useState<'all' | 'range' | 'custom'>('all');
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [customPagesInput, setCustomPagesInput] = useState<string>('');

  // Custom addons state
  const [addons, setAddons] = useState<Addon[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Page Range Price Tiers State
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [appliedBulkRate, setAppliedBulkRate] = useState<number | null>(null);

  // Review states
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSubscriptionExpired = () => {
    if (!shopInfo) return false;
    if (!shopInfo.subscription_expires_at) return true;
    const expires = new Date(shopInfo.subscription_expires_at).getTime();
    return expires < Date.now();
  };

  useEffect(() => {
    // Log the user in anonymously if they aren't already, so they bypass upload RLS
    const initAnonAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          await supabase.auth.signInAnonymously().catch(() => {});
        }
      } catch (e) {
        // Ignore anonymous auth exceptions
      }
    };
    initAnonAuth();

    const fetchShopInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (error) throw error;
        setShopInfo(data);
      } catch (err: any) {
        setErrorMsg('Shop not found or invalid shop link.');
      }
    };
    fetchShopInfo();

    // Load custom addons and logo from local storage if available
    if (typeof window !== 'undefined') {
      const storedLogo = localStorage.getItem('printdedo_logo');
      if (storedLogo) setLogo(storedLogo);

      const storedTiers = localStorage.getItem(`printdedo_price_tiers_${shopId}`);
      if (storedTiers) {
        try {
          setPriceTiers(JSON.parse(storedTiers));
        } catch (e) {}
      }

      const stored = localStorage.getItem(`printdedo_addons_${shopId}`);
      if (stored) {
        try {
          setAddons(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse addons:', e);
        }
      }
    }
  }, [shopId]);

  // Calculate selected pages count based on pageSelectionMode
  const getSelectedPagesCount = (): number => {
    if (!pdfPageCount) return 1;
    if (pageSelectionMode === 'all') return pdfPageCount;
    if (pageSelectionMode === 'range') {
      if (fromPage > toPage) return 0;
      const count = toPage - fromPage + 1;
      return Math.max(0, Math.min(count, pdfPageCount));
    }
    if (pageSelectionMode === 'custom') {
      if (!customPagesInput.trim()) return 0;
      const parts = customPagesInput.split(',');
      const pageSet = new Set<number>();
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const s = Math.max(1, Math.min(start, end));
            const e = Math.min(pdfPageCount, Math.max(start, end));
            for (let i = s; i <= e; i++) {
              pageSet.add(i);
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= pdfPageCount) {
            pageSet.add(p);
          }
        }
      }
      return pageSet.size;
    }
    return pdfPageCount;
  };

  const selectedPagesCount = getSelectedPagesCount();

  // Helper cost calculation
  const calculateItemCost = (
    pagesCount: number,
    qty: number,
    type: string,
    addonsSelected: string[]
  ): number => {
    if (!shopInfo) return 0;

    let baseRate = 0;
    if (priceTiers && priceTiers.length > 0) {
      const matchingTier = priceTiers.find(t => {
        if (t.toPage === null) return pagesCount >= t.fromPage;
        return pagesCount >= t.fromPage && pagesCount <= t.toPage;
      });

      if (matchingTier) {
        if (type === 'bw') baseRate = matchingTier.pricingBwSingle;
        else if (type === 'bw_double') baseRate = matchingTier.pricingBwDouble;
        else if (type === 'color') baseRate = matchingTier.pricingColorSingle;
        else if (type === 'color_double') baseRate = matchingTier.pricingColorDouble;
      }
    }

    if (baseRate === 0) {
      if (type === 'bw') baseRate = shopInfo.pricing_bw ?? 2;
      else if (type === 'bw_double') baseRate = shopInfo.pricing_bw_double ?? 3;
      else if (type === 'color') baseRate = shopInfo.pricing_color ?? 5;
      else if (type === 'color_double') baseRate = shopInfo.pricing_color_double ?? 8;
    }

    let calculatedCost = pagesCount * baseRate * qty;

    const addonsCost = addonsSelected.reduce((acc, addonId) => {
      const addon = addons.find(a => a.id === addonId);
      return acc + (addon ? addon.price : 0);
    }, 0);

    return calculatedCost + (addonsCost * qty);
  };

  const currentDocCost = file ? calculateItemCost(selectedPagesCount, quantity, printType, selectedAddons) : 0;
  const attachedTotalCost = attachedDocs.reduce((sum, doc) => sum + doc.itemCost, 0);
  const grandTotalCost = attachedTotalCost + currentDocCost;

  const [isParsingPdf, setIsParsingPdf] = useState(false);

  const convertFileToPdfIfNeeded = async (selectedFile: File): Promise<File> => {
    const nameLower = selectedFile.name.toLowerCase();

    if (nameLower.endsWith('.pdf')) {
      return selectedFile;
    }

    // Images (.jpg, .jpeg, .png, .webp)
    if (nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg') || nameLower.endsWith('.png') || nameLower.endsWith('.webp')) {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.create();
      let embeddedImg;

      if (nameLower.endsWith('.png')) {
        try {
          embeddedImg = await pdfDoc.embedPng(arrayBuffer);
        } catch (e) {
          const imgBlobUrl = URL.createObjectURL(selectedFile);
          const img = new Image();
          img.src = imgBlobUrl;
          await new Promise((res) => { img.onload = res; img.onerror = res; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 1000;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(imgBlobUrl);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = jpegDataUrl.split(',')[1];
          const jpegBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          embeddedImg = await pdfDoc.embedJpg(jpegBytes.buffer);
        }
      } else {
        try {
          embeddedImg = await pdfDoc.embedJpg(arrayBuffer);
        } catch (e) {
          const imgBlobUrl = URL.createObjectURL(selectedFile);
          const img = new Image();
          img.src = imgBlobUrl;
          await new Promise((res) => { img.onload = res; img.onerror = res; });
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width || 800;
          canvas.height = img.height || 1000;
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(imgBlobUrl);

          const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
          const base64Data = jpegDataUrl.split(',')[1];
          const jpegBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          embeddedImg = await pdfDoc.embedJpg(jpegBytes.buffer);
        }
      }

      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = embeddedImg.scaleToFit(540, 780);
      const x = (595.28 - width) / 2;
      const y = (841.89 - height) / 2;

      page.drawImage(embeddedImg, { x, y, width, height });
      const pdfBytes = await pdfDoc.save();

      const pdfFileName = selectedFile.name.replace(/\.[^/.]+$/, '') + '.pdf';
      return new File([Buffer.from(pdfBytes)], pdfFileName, { type: 'application/pdf' });
    }

    // Text / CSV documents (.txt, .csv, .log)
    if (nameLower.endsWith('.txt') || nameLower.endsWith('.csv') || nameLower.endsWith('.log')) {
      const text = await selectedFile.text();
      const pdfDoc = await PDFDocument.create();
      const lines = text.split('\n');
      const linesPerPage = 45;
      
      for (let i = 0; i < lines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([595.28, 841.89]);
        const pageLines = lines.slice(i, i + linesPerPage);
        let yPos = 800;
        
        for (const line of pageLines) {
          const cleanLine = line.replace(/[^\x20-\x7E]/g, '');
          page.drawText(cleanLine.substring(0, 80), { x: 40, y: yPos, size: 10 });
          yPos -= 16;
        }
      }

      if (pdfDoc.getPageCount() === 0) {
        pdfDoc.addPage([595.28, 841.89]);
      }

      const pdfBytes = await pdfDoc.save();
      const pdfFileName = selectedFile.name.replace(/\.[^/.]+$/, '') + '.pdf';
      return new File([Buffer.from(pdfBytes)], pdfFileName, { type: 'application/pdf' });
    }

    throw new Error('Unsupported format');
  };

  /**
   * Fast Client-Side Office Document Slide & Page Count Extractor
   * Uses JSZip to inspect OpenXML zip archives in browser memory (<2ms execution).
   * 1. For PowerPoint (.pptx): Counts exact 'ppt/slides/slide*.xml' files inside the zip archive.
   * 2. For Word/Excel (.docx/.xlsx): Parses '<Pages>N</Pages>' from 'docProps/app.xml'.
   */
  const extractOfficePageCount = async (selectedFile: File): Promise<number> => {
    try {
      const zip = await JSZip.loadAsync(selectedFile);
      
      // 1. PowerPoint (.pptx / .ppt): Count ppt/slides/slide*.xml entries in ZIP archive
      const slideFiles = Object.keys(zip.files).filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/i));
      if (slideFiles.length > 0) {
        return slideFiles.length;
      }

      // 2. Word (.docx / .doc) or PPT fallback: Parse docProps/app.xml metadata
      const appXmlFile = zip.file('docProps/app.xml');
      if (appXmlFile) {
        const appXmlText = await appXmlFile.async('text');
        
        const slidesMatch = appXmlText.match(/<Slides>(\d+)<\/Slides>/i);
        if (slidesMatch && slidesMatch[1]) {
          const count = parseInt(slidesMatch[1], 10);
          if (!isNaN(count) && count > 0) return count;
        }

        const pagesMatch = appXmlText.match(/<Pages>(\d+)<\/Pages>/i);
        if (pagesMatch && pagesMatch[1]) {
          const count = parseInt(pagesMatch[1], 10);
          if (!isNaN(count) && count > 0) return count;
        }
      }
    } catch (e) {
      console.warn('Failed to parse zip contents of Office document:', e);
    }

    return 1;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let selectedFile = e.target.files[0];
      const nameLower = selectedFile.name.toLowerCase();

      if (selectedFile.size > 50 * 1024 * 1024) {
        setErrorMsg('File size exceeds maximum limit of 50MB.');
        setFile(null);
        setPdfPageCount(null);
        return;
      }

      setErrorMsg('');
      setIsParsingPdf(true);

      try {
        if (
          nameLower.endsWith('.pptx') || 
          nameLower.endsWith('.ppt') || 
          nameLower.endsWith('.docx') || 
          nameLower.endsWith('.doc') || 
          nameLower.endsWith('.xlsx') || 
          nameLower.endsWith('.xls')
        ) {
          // Detect PPTX slide count & Word page count from document XML properties
          const detectedCount = await extractOfficePageCount(selectedFile);
          setFile(selectedFile);
          setPageSelectionMode('all');
          setPdfPageCount(detectedCount);
          setFromPage(1);
          setToPage(detectedCount);
          setCustomPagesInput(`1-${detectedCount}`);
        } else {
          selectedFile = await convertFileToPdfIfNeeded(selectedFile);
          setFile(selectedFile);
          setPageSelectionMode('all');

          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          const count = pdfDoc.getPageCount();
          setPdfPageCount(count);
          setFromPage(1);
          setToPage(count);
          setCustomPagesInput(`1-${count}`);
        }
      } catch (err: any) {
        console.error('Failed to parse or convert document:', err);
        setErrorMsg('Please select a valid document or image file.');
        setFile(null);
        setPdfPageCount(null);
      } finally {
        setIsParsingPdf(false);
      }
    }
  };

  const handleAttachAnother = () => {
    if (!file) return;

    const newAttachedDoc: AttachedDoc = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 5),
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
    };

    setAttachedDocs(prev => [...prev, newAttachedDoc]);

    // Reset current active file form
    setFile(null);
    setPdfPageCount(null);
    setPageSelectionMode('all');
    setSelectedAddons([]);
    setQuantity(1);
    setPrintType('bw');
  };

  const handleRemoveAttachedDoc = (id: string) => {
    setAttachedDocs(prev => prev.filter(doc => doc.id !== id));
  };

  const handleOpenSummaryModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (attachedDocs.length === 0 && !file) {
      setErrorMsg('Please upload at least one PDF document.');
      return;
    }
    setErrorMsg('');
    setIsSummaryModalOpen(true);
  };

  const executeFinalUpload = async () => {
    setIsSummaryModalOpen(false);
    setUploading(true);

    const docsToUpload: AttachedDoc[] = [
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

    try {
      for (const doc of docsToUpload) {
        const sanitizedOriginalName = doc.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${shopId}/${Date.now()}_${Math.random().toString(36).substring(7)}_${sanitizedOriginalName}`;

        let uploadedSuccessfully = false;

        // Try direct browser upload via presigned URL first
        try {
          const { getPresignedUploadUrl } = await import('@/lib/r2');
          const presigned = await getPresignedUploadUrl(fileName);

          if (presigned.success && presigned.url) {
            const uploadRes = await fetch(presigned.url, {
              method: 'PUT',
              body: doc.file,
            });

            if (uploadRes.ok) {
              uploadedSuccessfully = true;
            } else {
              console.warn('Presigned upload HTTP status:', uploadRes.status);
            }
          }
        } catch (clientErr) {
          console.warn('Presigned browser upload failed or blocked by CORS/network. Trying direct server upload fallback...', clientErr);
        }

        // Automatic Fallback: If client-side fetch failed (CORS/Adblocker/Network), upload via direct Server Action
        if (!uploadedSuccessfully) {
          const { uploadR2Direct } = await import('@/lib/r2');
          const formData = new FormData();
          formData.append('file', doc.file);
          formData.append('fileName', fileName);

          const serverUpload = await uploadR2Direct(formData);
          if (!serverUpload.success) {
            throw new Error(serverUpload.error || 'Failed to upload PDF file to Cloudflare R2.');
          }
        }


        let pageSelectionStr = '';
        if (doc.pageSelectionMode === 'range') {
          pageSelectionStr = ` [Pages ${doc.fromPage}-${doc.toPage}]`;
        } else if (doc.pageSelectionMode === 'custom') {
          pageSelectionStr = ` [Pages ${doc.customPagesInput}]`;
        } else if (doc.pdfPageCount) {
          pageSelectionStr = ` [All ${doc.pdfPageCount} Pgs]`;
        }

        const addonNames = doc.selectedAddons
          .map(id => addons.find(a => a.id === id)?.name)
          .filter(Boolean);

        const addonsStr = addonNames.length > 0 ? ` [+ ${addonNames.join(', ')}]` : '';
        const phoneStr = phone ? ` (${phone})` : '';

        const finalCustomerNameString = `${name.trim()}${phoneStr}${pageSelectionStr}${addonsStr}`;

        const { error: dbError } = await supabase
          .from('orders')
          .insert({
            shop_id: shopId,
            customer_name: finalCustomerNameString,
            customer_phone: phone.trim() || null,
            file_path: fileName,
            quantity: doc.quantity,
            color_mode: doc.printType || 'bw',
            total_cost: doc.itemCost,
            status: 'pending',
            created_at: new Date().toISOString()
          });

        if (dbError) {
          console.error('Supabase DB Insert Error:', dbError);
          throw new Error(dbError.message || 'Failed to save order to database.');
        }

        // Log upload for storage usage metrics
        if (typeof window !== 'undefined') {
          const uploadLog = {
            shopId: shopId,
            size: doc.file.size,
            timestamp: Date.now()
          };
          const storedLogs = localStorage.getItem('printdedo_storage_logs');
          let logs = [];
          if (storedLogs) {
            try {
              logs = JSON.parse(storedLogs);
            } catch (e) {}
          }
          logs.push(uploadLog);
          const fortyEightHoursAgo = Date.now() - 48 * 60 * 60 * 1000;
          logs = logs.filter((log: any) => log.timestamp >= fortyEightHoursAgo);
          localStorage.setItem('printdedo_storage_logs', JSON.stringify(logs));
        }
      }

      setSubmittedDocCount(docsToUpload.length);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const [shopRating, setShopRating] = useState(5);
  const [shopComment, setShopComment] = useState('');
  const [platformRating, setPlatformRating] = useState(5);
  const [platformComment, setPlatformComment] = useState('');

  const handleAddReview = async () => {
    const customerName = name.trim() || 'Anonymous';
    const currentShopName = shopInfo?.store_name || 'Print Shop';

    // 1. Submit Shop Review to Supabase
    try {
      await supabase.from('shop_reviews').insert({
        shop_id: shopId,
        name: customerName,
        rating: shopRating,
        comment: shopComment,
        created_at: new Date().toISOString()
      });
    } catch (e) {}

    // Save to local storage for shop owner fallback
    const reviewsKey = `printdedo_reviews_list_${shopId}`;
    let list = [];
    const stored = localStorage.getItem(reviewsKey);
    if (stored) {
      try { list = JSON.parse(stored); } catch (e) {}
    }
    const newShopReview = {
      id: Date.now().toString(),
      shop_id: shopId,
      name: customerName,
      rating: shopRating,
      comment: shopComment,
      created_at: new Date().toISOString()
    };
    list.unshift(newShopReview);
    localStorage.setItem(reviewsKey, JSON.stringify(list));

    // Calculate average for shop profile
    const count = list.length;
    const sum = list.reduce((s: number, r: any) => s + r.rating, 0);
    const average = sum / count;
    localStorage.setItem(`printdedo_rating_${shopId}`, average.toFixed(1));
    localStorage.setItem(`printdedo_reviews_${shopId}`, count.toString());

    // 2. Submit PrintDedo Platform Review to Supabase
    try {
      await supabase.from('platform_reviews').insert({
        name: customerName,
        shop_name: currentShopName,
        rating: platformRating,
        comment: platformComment,
        created_at: new Date().toISOString()
      });
    } catch (e) {}

    // Save to local storage for admin fallback
    const platformKey = 'printdedo_platform_reviews';
    let pList = [];
    const pStored = localStorage.getItem(platformKey);
    if (pStored) {
      try { pList = JSON.parse(pStored); } catch (e) {}
    }
    pList.unshift({
      id: Date.now().toString(),
      name: customerName,
      shop_name: currentShopName,
      rating: platformRating,
      comment: platformComment,
      created_at: new Date().toISOString()
    });
    localStorage.setItem(platformKey, JSON.stringify(pList));

    setReviewSubmitted(true);
    setIsReviewOpen(false);
  };

  const totalBatchDocsCount = attachedDocs.length + (file ? 1 : 0);

  const isRawOfficeDoc = file ? !!file.name.toLowerCase().match(/\.(pptx|ppt|docx|doc|xlsx|xls)$/i) : false;

  return {
    // State
    file,
    name,
    setName,
    phone,
    setPhone,
    quantity,
    setQuantity,
    printType,
    setPrintType,
    shopInfo,
    logo,
    attachedDocs,
    submittedDocCount,
    pdfPageCount,
    setPdfPageCount,
    pageSelectionMode,
    setPageSelectionMode,
    fromPage,
    setFromPage,
    toPage,
    setToPage,
    customPagesInput,
    setCustomPagesInput,
    selectedPagesCount,
    addons,
    selectedAddons,
    setSelectedAddons,
    isReviewOpen,
    setIsReviewOpen,
    shopRating,
    setShopRating,
    shopComment,
    setShopComment,
    platformRating,
    setPlatformRating,
    platformComment,
    setPlatformComment,
    reviewSubmitted,
    uploading,
    isSuccess,
    setIsSuccess,
    setFile,
    setAttachedDocs,
    setReviewSubmitted,
    isSummaryModalOpen,
    setIsSummaryModalOpen,
    errorMsg,
    currentDocCost,
    attachedTotalCost,
    grandTotalCost,
    totalBatchDocsCount,
    isSubscriptionExpired,
    isParsingPdf,
    isRawOfficeDoc,
    // Handlers
    handleFileChange,
    handleAttachAnother,
    handleRemoveAttachedDoc,
    handleOpenSummaryModal,
    executeFinalUpload,
    handleAddReview,
  };
}
