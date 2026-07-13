'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Printer, FileText, CheckCircle, Edit2, Star, MapPin, LogOut, Upload, X, Shield } from 'lucide-react';
import QRCode from 'react-qr-code';

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

const getSplitShopName = (name: string) => {
  if (!name || name === 'Loading...') return { first: '', rest: 'LOADING...' };
  const parts = name.trim().split(/\s+/);
  if (parts.length > 1) {
    return {
      first: parts[0].toUpperCase(),
      rest: parts.slice(1).join(' ').toUpperCase()
    };
  }
  return {
    first: '',
    rest: name.toUpperCase()
  };
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [shopName, setShopName] = useState('Loading...');
  const [pricingBwSingle, setPricingBwSingle] = useState('0');
  const [pricingBwDouble, setPricingBwDouble] = useState('0');
  const [pricingColorSingle, setPricingColorSingle] = useState('0');
  const [pricingColorDouble, setPricingColorDouble] = useState('0');
  const [upiId, setUpiId] = useState('');
  
  // Custom interactive banner settings
  const [location, setLocation] = useState('Near Market Yard, Pune, Maharashtra.');
  const [logo, setLogo] = useState(''); // Base64 or empty for default
  const [rating, setRating] = useState(4.8);
  const [reviews, setReviews] = useState(128);

  // Subscription States
  const [subExpiresAt, setSubExpiresAt] = useState<string | null>(null);
  const [subPlanName, setSubPlanName] = useState<string | null>(null);

  // Custom add-ons state
  interface Addon {
    id: string;
    name: string;
    price: number;
  }
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isEditingAddons, setIsEditingAddons] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  
  // Modal states
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [tempShopName, setTempShopName] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempLogo, setTempLogo] = useState('');
  
  const [initialData, setInitialData] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [saving, setSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getSubscriptionAlert = () => {
    if (!subExpiresAt) {
      return {
        type: 'expired',
        message: 'Your subscription has ended. Please renew to reactivate your customer dropbox.',
        colorClass: 'bg-red-50 text-red-800 border-red-200'
      };
    }
    const expires = new Date(subExpiresAt).getTime();
    const diffTime = expires - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: 'expired',
        message: `Your subscription for plan "${subPlanName || 'Free Trial'}" has expired. Renew immediately to restore your customer dropbox portal.`,
        colorClass: 'bg-red-50 text-red-800 border-red-200'
      };
    } else if (diffDays <= 5) {
      return {
        type: 'warning',
        message: `Your subscription for plan "${subPlanName || 'Free Trial'}" expires in ${diffDays} day${diffDays > 1 ? 's' : ''}. Renew soon to prevent shop service suspension.`,
        colorClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 animate-pulse'
      };
    }
    return null;
  };

  const getSubStatusLabel = () => {
    if (!subExpiresAt) return { text: 'No Subscription Details', isExpired: true };
    const expires = new Date(subExpiresAt).getTime();
    const diffDays = Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Expired on ${new Date(subExpiresAt).toLocaleDateString()}`, isExpired: true };
    } else {
      return { text: `Active (${diffDays} days left - expires ${new Date(subExpiresAt).toLocaleDateString()})`, isExpired: false };
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      
      // Load interactive settings
      const storedLoc = localStorage.getItem('xeroxflow_location');
      if (storedLoc) setLocation(storedLoc);
      const storedLogo = localStorage.getItem('xeroxflow_logo');
      if (storedLogo) setLogo(storedLogo);
      const storedRating = localStorage.getItem('xeroxflow_rating');
      if (storedRating) setRating(parseFloat(storedRating));
      const storedReviews = localStorage.getItem('xeroxflow_reviews');
      if (storedReviews) setReviews(parseInt(storedReviews));
    }
    
    let subscription: any;

    const loadDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      
      // Load and recalculate ratings from reviews list array if present
      const reviewsKey = `xeroxflow_reviews_list_${session.user.id}`;
      const storedReviewsList = localStorage.getItem(reviewsKey);
      if (storedReviewsList) {
        try {
          const list = JSON.parse(storedReviewsList);
          if (list && list.length > 0) {
            const count = list.length;
            const sum = list.reduce((s: number, r: any) => s + r.rating, 0);
            const average = sum / count;
            setRating(parseFloat(average.toFixed(1)));
            setReviews(count);
            localStorage.setItem('xeroxflow_rating', average.toFixed(1));
            localStorage.setItem('xeroxflow_reviews', count.toString());
          }
        } catch (e) {
          console.error('Failed to parse reviews list:', e);
        }
      }

      // Load custom addons
      const storedAddons = localStorage.getItem(`xeroxflow_addons_${session.user.id}`);
      if (storedAddons) {
        try {
          setAddons(JSON.parse(storedAddons));
        } catch (e) {
          console.error('Failed to parse stored addons:', e);
        }
      } else {
        const defaults = [
          { id: 'lamination', name: 'Lamination', price: 15 },
          { id: 'photoprint', name: 'Photo Paper Print', price: 20 },
          { id: 'spiral', name: 'Spiral Binding', price: 40 }
        ];
        setAddons(defaults);
        localStorage.setItem(`xeroxflow_addons_${session.user.id}`, JSON.stringify(defaults));
      }
      
      let { data: shopData, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      // If the shop row doesn't exist yet, create it on the fly
      if (!shopData) {
        console.warn('Shop not found, creating...', fetchError);
        const fallbackName = session.user.user_metadata?.store_name || 'My Print Shop';
        const { data: newShop, error: insertError } = await supabase
          .from('shops')
          .insert({
            id: session.user.id,
            store_name: fallbackName,
            pricing_bw: 2,
            pricing_bw_double: 3,
            pricing_color: 5,
            pricing_color_double: 8,
          })
          .select()
          .single();
          
        if (insertError) {
          console.error("Failed to auto-create shop:", insertError);
        }
        shopData = newShop;
      }
        
      if (shopData) {
        setShopName(shopData.store_name);
        setSubExpiresAt(shopData.subscription_expires_at || null);
        setSubPlanName(shopData.subscription_plan_name || null);
        if (shopData.pricing_bw !== null) setPricingBwSingle(shopData.pricing_bw.toString());
        // Pull double prices directly from DB if the columns exist, otherwise fallback to 0
        if (shopData.pricing_bw_double !== undefined && shopData.pricing_bw_double !== null) {
          setPricingBwDouble(shopData.pricing_bw_double.toString());
        }
        
        if (shopData.pricing_color !== null) setPricingColorSingle(shopData.pricing_color.toString());
        if (shopData.pricing_color_double !== undefined && shopData.pricing_color_double !== null) {
          setPricingColorDouble(shopData.pricing_color_double.toString());
        }
        
        if (shopData.upi_id) setUpiId(shopData.upi_id);

        // Store a snapshot of what came from the DB to compare later
        setInitialData({
          store_name: shopData.store_name,
          upi_id: shopData.upi_id || '',
          pricing_bw: shopData.pricing_bw !== null ? shopData.pricing_bw.toString() : '0',
          pricing_bw_double: shopData.pricing_bw_double !== null && shopData.pricing_bw_double !== undefined ? shopData.pricing_bw_double.toString() : '0',
          pricing_color: shopData.pricing_color !== null ? shopData.pricing_color.toString() : '0',
          pricing_color_double: shopData.pricing_color_double !== null && shopData.pricing_color_double !== undefined ? shopData.pricing_color_double.toString() : '0',
        });
      }

      // 1. Fetch initial orders
      fetchOrders(session.user.id);

      // 2. Subscribe to real-time changes on the orders table
      subscription = supabase
        .channel(`orders_changes_${Date.now()}`)
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${session.user.id}` }, 
          (payload) => {
            console.log('Live update received!', payload);
            fetchOrders(session.user.id);
          }
        )
        .subscribe();
    };
    
    loadDashboard();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [router]);

  useEffect(() => {
    if (initialData) {
      const isChanged = 
        shopName !== initialData.store_name ||
        upiId !== initialData.upi_id ||
        pricingBwSingle !== initialData.pricing_bw ||
        pricingBwDouble !== initialData.pricing_bw_double ||
        pricingColorSingle !== initialData.pricing_color ||
        pricingColorDouble !== initialData.pricing_color_double;

      setHasChanges(isChanged);
    }
  }, [shopName, upiId, pricingBwSingle, pricingBwDouble, pricingColorSingle, pricingColorDouble, initialData]);

  // Poll and automatically filter out items older than 10 minutes from state in real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        return prevOrders.filter(order => {
          const orderTime = new Date(order.created_at).getTime();
          return orderTime >= tenMinutesAgo;
        });
      });
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleAddAddon = () => {
    if (!newAddonName || !newAddonPrice) return;
    const price = parseFloat(newAddonPrice);
    if (isNaN(price)) return;
    
    const newAddon = {
      id: Date.now().toString(),
      name: newAddonName,
      price: price
    };
    
    const updated = [...addons, newAddon];
    setAddons(updated);
    if (userId) {
      localStorage.setItem(`xeroxflow_addons_${userId}`, JSON.stringify(updated));
    }
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (id: string) => {
    const updated = addons.filter(addon => addon.id !== id);
    setAddons(updated);
    if (userId) {
      localStorage.setItem(`xeroxflow_addons_${userId}`, JSON.stringify(updated));
    }
  };

  const handleSaveBannerSettings = async () => {
    setSaving(true);
    try {
      if (tempShopName !== shopName && userId) {
        const { error } = await supabase
          .from('shops')
          .update({ store_name: tempShopName })
          .eq('id', userId);
        if (error) throw error;
        setShopName(tempShopName);
      }
      
      localStorage.setItem('xeroxflow_location', tempLocation);
      setLocation(tempLocation);
      
      localStorage.setItem('xeroxflow_logo', tempLogo);
      setLogo(tempLogo);
      
      setIsEditingBanner(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save shop details.');
    }
    setSaving(false);
  };

  const fetchOrders = async (shopId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', shopId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }); // Newest first (latest on top)
    
    if (data) {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const activeOrders = data.filter(order => {
        const orderTime = new Date(order.created_at).getTime();
        return orderTime >= tenMinutesAgo;
      });
      setOrders(activeOrders);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSavePricing = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    if (!userId) return;

    try {
      await supabase
        .from('shops')
        .update({ 
          store_name: shopName,
          upi_id: upiId,
          pricing_bw: parseFloat(pricingBwSingle),
          pricing_bw_double: parseFloat(pricingBwDouble),
          pricing_color: parseFloat(pricingColorSingle),
          pricing_color_double: parseFloat(pricingColorDouble)
        })
        .eq('id', userId);
        
      setIsEditingName(false);
      
      // Update our snapshot to match what we just saved to the DB
      setInitialData({
        store_name: shopName,
        upi_id: upiId,
        pricing_bw: pricingBwSingle,
        pricing_bw_double: pricingBwDouble,
        pricing_color: pricingColorSingle,
        pricing_color_double: pricingColorDouble,
      });
      setHasChanges(false);
      
      alert('Shop details saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    }
    setSaving(false);
  };

  const handlePrintQR = () => {
    // Print specifically the QR code avoiding the rest of the dashboard
    window.print();
  };

  const handlePrint = async (order: any) => {
    try {
      // 1. Securely download the PDF blob from Supabase
      const { data, error } = await supabase.storage
        .from('xerox-files')
        .download(order.file_path);

      if (error) throw error;

      // 2. Create a temporary local URL for the blob (force application/pdf type)
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      
      // 3. Create a hidden iframe to bypass popup blockers and print flawlessly
      const iframe = document.createElement('iframe');
      // FIX 1: Don't use display: none! It prevents the browser from rendering the PDF.
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        // Add a tiny delay to ensure the browser's PDF viewer has completely rendered the file
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // FIX 2: Move the confirm box to trigger AFTER the print window closes
          // (The .print() function execution usually halts until the print dialog is closed)
          setTimeout(async () => {
            const didPrint = window.confirm("Did the document print successfully?\n\nClick OK to mark as completed and remove it from the queue.");
            
            if (didPrint) {
              await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', order.id);

              if (userId) fetchOrders(userId);
            }

            // Cleanup
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 500);

        }, 200);
      };

    } catch (err) {
      console.error('Print failed:', err);
      alert('Failed to securely fetch the document for printing.');
    }
  };

  // Helper to make the filename pretty
  const formatFilename = (path: string) => {
    const parts = path.split('_');
    // Remove the timestamp prefix to get the original name
    return parts.slice(1).join('_') || path;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 flex print:bg-white print:block relative overflow-hidden">
      {/* Printable QR Code Overlay specifically for printing */}
      <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:fixed print:inset-0 print:w-full print:h-full print:bg-white text-center">
        <h1 className="text-6xl font-extrabold mb-12 tracking-tight text-slate-900">
          {shopName || 'Your Shop'}
        </h1>
        <div className="scale-150 mb-16">
          {userId && origin && (
            <QRCode value={`${origin}/shop/${userId}`} size={300} level="H" />
          )}
        </div>
        <p className="text-4xl text-slate-800 font-bold mt-8">Scan to Print 🖨️</p>
        <p className="text-xl text-slate-500 mt-4">Send your PDFs securely directly to our queue</p>
      </div>

      {/* Left Sidebar */}
      <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col hidden md:flex print:hidden relative z-10">
        <div className="p-6 border-b border-slate-200 flex flex-col justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-400 p-2 rounded-xl">
              <Printer className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-950">Xerox<span className="text-yellow-500">Flow</span></span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider uppercase ml-12">Smart Printing. Simplified.</span>
        </div>
            <div className="p-6 flex-1 overflow-y-auto">
          {/* QR Code Section */}
          <div className="mb-8 flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-4 inline-block shadow-sm">
              {userId && origin ? (
                <QRCode value={`${origin}/shop/${userId}`} size={120} level="H" />
              ) : (
                <div className="w-[120px] h-[120px] bg-slate-100 rounded animate-pulse" />
              )}
            </div>
            
            <div className="flex flex-col items-center space-y-2.5 w-full">
              <button 
                onClick={handlePrintQR}
                className="w-full text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-500 px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm border-none"
              >
                <Printer className="w-4 h-4" />
                Print / Download QR
              </button>
              
              {userId && origin && (
                <a 
                  href={`${origin}/shop/${userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-yellow-600 hover:text-yellow-700 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Open Customer Dropbox ↗
                </a>
              )}
            </div>

            <button 
              onClick={() => setIsEditingAddons(true)}
              className="w-full text-xs font-bold text-slate-800 border border-slate-200 hover:bg-slate-50 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-5 cursor-pointer shadow-sm"
            >
              <span>Manage Add-ons Menu</span>
            </button>
          </div>

          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Shop & Pricing</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">B&W Single (₹)</label>
                <input type="number" step="0.5" min="0" value={pricingBwSingle} onChange={(e) => {
                  setPricingBwSingle(e.target.value);
                }} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">B&W Double (₹)</label>
                <input type="number" step="0.5" min="0" value={pricingBwDouble} onChange={(e) => setPricingBwDouble(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Color Single (₹)</label>
                <input type="number" step="0.5" min="0" value={pricingColorSingle} onChange={(e) => {
                  setPricingColorSingle(e.target.value);
                }} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Color Double (₹)</label>
                <input type="number" step="0.5" min="0" value={pricingColorDouble} onChange={(e) => setPricingColorDouble(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Store UPI ID (For Payments)</label>
              <input 
                type="text" 
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@upi"
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 focus:outline-none transition-colors text-slate-900 bg-slate-50 focus:bg-white" 
              />
            </div>
            
            <button 
              onClick={handleSavePricing}
              disabled={!hasChanges || saving}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-bold p-3 rounded-xl mt-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm border-none"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
           <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer">
             <div className="border border-slate-200 p-1.5 rounded-full hover:border-yellow-400 hover:text-yellow-600">
               <LogOut className="w-4 h-4" />
             </div>
             <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto w-full max-w-5xl print:hidden relative z-10 space-y-6">
        
        {/* Subscription Alert Banner */}
        {getSubscriptionAlert()?.type === 'warning' && (
          <div className={`border p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in ${getSubscriptionAlert()?.colorClass}`}>
            <div className="flex items-center space-x-3.5">
              <div className="bg-white/70 p-2.5 rounded-2xl shadow-sm text-yellow-600">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-black uppercase tracking-tight text-slate-900 font-extrabold">
                  Subscription Ending Soon
                </h4>
                <p className="text-xs text-slate-650 font-medium mt-0.5">{getSubscriptionAlert()?.message}</p>
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
          onClick={() => {
            setTempShopName(shopName);
            setTempLocation(location);
            setTempLogo(logo);
            setIsEditingBanner(true);
          }}
          className="relative bg-white border border-slate-200 hover:border-yellow-400 rounded-3xl p-6 mb-8 shadow-sm flex items-center justify-between cursor-pointer transition-all overflow-hidden select-none group"
        >
          {/* Yellow brush illustration decoration on far right */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 overflow-hidden pointer-events-none select-none hidden sm:block">
            {/* Yellow brush sweep path */}
            <svg viewBox="0 0 200 200" className="absolute right-0 top-0 bottom-0 h-full w-full text-yellow-400 transition-transform group-hover:scale-105 duration-500" fill="currentColor" preserveAspectRatio="none">
              <path d="M 80,0 C 110,60 70,140 120,200 L 200,200 L 200,0 Z" />
            </svg>
            {/* Copier line drawing */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 text-black">
              <svg viewBox="0 0 100 100" className="w-32 h-32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="25" y="40" width="50" height="40" rx="4" />
                <line x1="25" y1="52" x2="75" y2="52" />
                <rect x="30" y="44" width="12" height="5" rx="1" />
                <path d="M75 45h8a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2h-8" />
                <path d="M25 45h-8a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h-8" />
                <path d="M22 30h56v10H22z" />
                <line x1="25" y1="35" x2="75" y2="35" />
                <path d="M35 18h30l5 12H30z" />
                <path d="M60 18h10a2 2 0 0 1 2 2v4" />
                <line x1="35" y1="65" x2="65" y2="65" />
                <line x1="35" y1="73" x2="65" y2="73" />
              </svg>
            </div>
          </div>

          <div className="relative z-10 flex items-center space-x-6 w-full sm:w-2/3">
            {/* Circular Logo Container */}
            <div className="w-24 h-24 rounded-full border-4 border-yellow-400 bg-white flex items-center justify-center overflow-hidden shadow-sm shrink-0">
              {logo ? (
                <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
              ) : (
                <XeroxLogoSVG />
              )}
            </div>

            {/* Shop Details */}
            <div className="flex-1 min-w-0 @container">
              <h2 
                style={{ fontSize: 'clamp(1.5rem, 8cqi, 2.5rem)' }} 
                className="font-black text-yellow-500 leading-none tracking-tight uppercase truncate"
              >
                {getSplitShopName(shopName).first || "OWNER'S"}
              </h2>
              {getSplitShopName(shopName).rest && (
                <span className="block text-[10px] font-bold text-slate-900 tracking-widest uppercase mt-1">
                  {getSplitShopName(shopName).rest}
                </span>
              )}
              
              {/* Category Badges */}
              <div className="inline-block mt-3 bg-black text-[9px] font-bold text-white px-3 py-1 rounded-full uppercase tracking-wider">
                XEROX • PRINT • SCAN • LAMINATION • SPIRAL BINDING
              </div>
              
              {/* Location Line */}
              <div className="flex items-center space-x-1.5 text-slate-500 text-xs mt-3.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="relative z-10 hidden md:flex flex-col items-center justify-center border-l border-slate-200 pl-8 shrink-0 pr-24">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <span className="text-2xl font-black text-slate-900">{rating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400 text-xs font-bold mt-1">({reviews} Reviews)</span>
            
            {/* Stars rendering */}
            <div className="flex items-center space-x-0.5 mt-2">
              {[...Array(5)].map((_, i) => {
                const isFull = i < Math.floor(rating);
                const isHalf = !isFull && i < rating;
                return (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${isFull ? 'text-yellow-400 fill-yellow-400' : isHalf ? 'text-yellow-400 fill-yellow-400 opacity-60' : 'text-slate-200'}`} 
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Queue Header */}
        <div className="flex justify-between items-center mb-6">
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
          
          {getSubscriptionAlert()?.type === 'expired' ? (
            <div className="flex items-center space-x-2 text-xs font-bold text-red-700 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-100">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span>Updates paused</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-bold text-yellow-700 bg-yellow-50 px-3.5 py-1.5 rounded-full border border-yellow-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              <span>Receiving updates</span>
            </div>
          )}
        </div>

        {/* Subscription Expired Live Queue Banner */}
        {getSubscriptionAlert()?.type === 'expired' && (
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
          {getSubscriptionAlert()?.type === 'expired' ? (
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
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                
                <div className="flex items-center space-x-5">
                  <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                    <FileText className="w-8 h-8 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 truncate max-w-[300px]" title={formatFilename(order.file_path)}>
                      {formatFilename(order.file_path)}
                    </h3>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-slate-500">
                      <span className="font-semibold text-slate-800">{order.customer_name || 'Anonymous'}</span>
                      <span className="text-xs">{order.customer_phone || ''}</span>
                    </div>
                    <div className="flex items-center space-x-3 mt-2 text-sm text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">Qty: {order.quantity}</span>
                      <span className={`px-2 py-0.5 rounded font-semibold uppercase text-xs ${order.color_mode.includes('color') ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-800'}`}>
                        {order.color_mode.replace('_', ' ')}
                      </span>
                      <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100/50">₹{order.total_cost || 0}</span>
                      <span>•</span>
                      <span>Arrived {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handlePrint(order)}
                    className="flex items-center space-x-2 bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-sm cursor-pointer border-none"
                  >
                    <Printer className="w-5 h-5" />
                    <span>Print Now</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </main>

      {/* Banner/Profile Edit Modal */}
      {isEditingBanner && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsEditingBanner(false)}
              className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Shop Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Shop Name</label>
                <input 
                  type="text" 
                  value={tempShopName}
                  onChange={(e) => setTempShopName(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                <input 
                  type="text" 
                  value={tempLocation}
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Logo Image</label>
                <div className="flex items-center space-x-4">
                  {tempLogo ? (
                    <img src={tempLogo} alt="Preview" className="w-14 h-14 rounded-full object-cover border border-slate-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
                      <Printer className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setTempLogo(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <button type="button" className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition">
                      <Upload className="w-3.5 h-3.5" />
                      Upload Logo
                    </button>
                  </div>
                </div>
                {tempLogo && (
                  <button 
                    type="button" 
                    onClick={() => setTempLogo('')} 
                    className="text-xs text-red-500 mt-2 hover:underline block"
                  >
                    Clear custom logo (use default copier icon)
                  </button>
                )}
              </div>

              {/* Current Subscription Status */}
              <div className="pt-4 border-t border-slate-150">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Subscription status</label>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/65">
                  <div className="text-left space-y-0.5">
                    <span className={`text-xs font-black uppercase tracking-tight ${getSubStatusLabel().isExpired ? 'text-red-600' : 'text-green-600'}`}>
                      {getSubStatusLabel().isExpired ? 'Expired' : 'Active'}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-bold leading-normal">
                      {getSubStatusLabel().text}
                    </span>
                  </div>
                  <Link 
                    href="/renew" 
                    className="bg-yellow-400 text-black font-bold px-3.5 py-2 rounded-xl hover:bg-yellow-500 transition text-xs shrink-0 cursor-pointer shadow-sm border-none text-center"
                  >
                    Renew
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-8">
              <button 
                onClick={() => setIsEditingBanner(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveBannerSettings}
                className="px-5 py-2.5 rounded-xl bg-yellow-400 text-black text-sm font-bold hover:bg-yellow-500 transition cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Add-ons Manager Modal */}
      {isEditingAddons && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsEditingAddons(false)}
              className="absolute right-6 top-6 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-slate-900 mb-6">Manage Add-ons & Menu</h3>
            
            {/* Add New Add-on form */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6 space-y-3">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Add Custom Service / Item</span>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="e.g. Lamination" 
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  className="p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 font-medium"
                />
                <input 
                  type="number" 
                  placeholder="Price (₹)" 
                  value={newAddonPrice}
                  onChange={(e) => setNewAddonPrice(e.target.value)}
                  className="p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 focus:outline-none bg-white text-slate-900 font-medium"
                />
              </div>
              <button 
                onClick={handleAddAddon}
                className="w-full text-xs font-bold bg-yellow-400 hover:bg-yellow-500 text-black py-2.5 rounded-xl transition cursor-pointer border-none shadow-sm"
              >
                + Add to Menu
              </button>
            </div>

            {/* List of current add-ons */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Services</span>
              {addons.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">No custom add-ons added yet.</p>
              ) : (
                addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{addon.name}</span>
                      <span className="text-xs text-slate-500 font-bold">₹{addon.price.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveAddon(addon.id)}
                      className="text-xs text-red-500 font-semibold hover:text-red-700 hover:underline p-1 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end mt-8 border-t border-slate-100 pt-4">
              <button 
                onClick={() => setIsEditingAddons(false)}
                className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition cursor-pointer border-none shadow-sm"
              >
                Close / Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
