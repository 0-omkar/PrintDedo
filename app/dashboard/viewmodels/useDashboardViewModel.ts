import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PDFDocument } from 'pdf-lib';
import { RecentOrder, PriceTier, Addon, ShopProfile } from '../types';
import { ShopReviewItem } from '../components/ShopReviewsModal';

export function useDashboardViewModel() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [timerTick, setTimerTick] = useState<number>(0);
  const [isRecentsModalOpen, setIsRecentsModalOpen] = useState(false);
  const [isShopPricingOpen, setIsShopPricingOpen] = useState(false);
  const [isAddonsDropdownOpen, setIsAddonsDropdownOpen] = useState(false);

  // Page Range Price Tiers State & Selection
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([]);
  const [selectedTierId, setSelectedTierId] = useState<string>('');

  // Add / Edit Pricing Modal state
  const [isAddPricingModalOpen, setIsAddPricingModalOpen] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [newFromPage, setNewFromPage] = useState('1');
  const [newToPage, setNewToPage] = useState('50');
  const [newPricingBwSingle, setNewPricingBwSingle] = useState('2');
  const [newPricingBwDouble, setNewPricingBwDouble] = useState('3');
  const [newPricingColorSingle, setNewPricingColorSingle] = useState('5');
  const [newPricingColorDouble, setNewPricingColorDouble] = useState('8');

  const [shopName, setShopName] = useState('Loading...');
  const [pricingBwSingle, setPricingBwSingle] = useState('0');
  const [pricingBwDouble, setPricingBwDouble] = useState('0');
  const [pricingColorSingle, setPricingColorSingle] = useState('0');
  const [pricingColorDouble, setPricingColorDouble] = useState('0');

  // Editing Banner States
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [tempShopName, setTempShopName] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempLogo, setTempLogo] = useState('');

  // Local interactive settings state
  const [location, setLocation] = useState('MIT-WPU Campus, Pune');
  const [logo, setLogo] = useState('');
  const [rating, setRating] = useState(5.0);
  const [reviews, setReviews] = useState(0);

  // Custom Addons State
  const [addons, setAddons] = useState<Addon[]>([]);
  const [isEditingAddons, setIsEditingAddons] = useState(false);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');

  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>('');

  // Subscription state
  const [shopProfile, setShopProfile] = useState<ShopProfile | null>(null);

  const activeTier = priceTiers.find(t => t.id === selectedTierId) || priceTiers[0];

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

  const formatFilename = (filePath: string) => {
    if (!filePath) return 'Document.pdf';
    const filename = filePath.split('/').pop() || filePath;
    return filename.replace(/^\d+_[a-z0-9]+_/i, '');
  };

  const getSubscriptionAlert = () => {
    if (!shopProfile) return null;
    if (!shopProfile.subscription_expires_at) {
      return {
        type: 'expired' as const,
        message: 'No active subscription plan found.',
        colorClass: 'bg-red-50 text-red-700 border-red-200'
      };
    }

    const expires = new Date(shopProfile.subscription_expires_at).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        type: 'expired' as const,
        message: `Subscription expired on ${new Date(expires).toLocaleDateString()}. Customer uploads are currently blocked.`,
        colorClass: 'bg-red-50 text-red-700 border-red-200'
      };
    } else if (diffDays <= 5) {
      return {
        type: 'warning' as const,
        message: `Subscription expires in ${diffDays} day${diffDays > 1 ? 's' : ''} (${new Date(expires).toLocaleDateString()}). Renew to avoid service interruption.`,
        colorClass: 'bg-amber-50 text-amber-800 border-amber-200'
      };
    }

    return null;
  };

  const getSubStatusLabel = () => {
    if (!shopProfile || !shopProfile.subscription_expires_at) {
      return { text: 'No active plan', isExpired: true };
    }
    const expires = new Date(shopProfile.subscription_expires_at).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { text: `Expired on ${new Date(expires).toLocaleDateString()}`, isExpired: true };
    }
    return { text: `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''} (${new Date(expires).toLocaleDateString()})`, isExpired: false };
  };

  const fetchOrders = async (sId: string) => {
    const tenMinutesAgoDate = new Date(Date.now() - 10 * 60 * 1000);
    const tenMinutesAgoIso = tenMinutesAgoDate.toISOString();

    try {
      await supabase
        .from('orders')
        .delete()
        .eq('shop_id', sId)
        .eq('status', 'pending')
        .lt('created_at', tenMinutesAgoIso);
    } catch (e) {}

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('shop_id', sId)
      .eq('status', 'pending')
      .gte('created_at', tenMinutesAgoIso)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setOrders(data);
    }
  };

  const handleOpenAddPricingModal = () => {
    setEditingTierId(null);
    setModalError(null);
    const lastTier = priceTiers[priceTiers.length - 1];
    const nextFrom = lastTier && lastTier.toPage ? lastTier.toPage + 1 : (lastTier ? lastTier.fromPage + 50 : 1);
    setNewFromPage(nextFrom.toString());
    setNewToPage((nextFrom + 49).toString());
    setNewPricingBwSingle(lastTier ? lastTier.pricingBwSingle.toString() : '2');
    setNewPricingBwDouble(lastTier ? lastTier.pricingBwDouble.toString() : '3');
    setNewPricingColorSingle(lastTier ? lastTier.pricingColorSingle.toString() : '5');
    setNewPricingColorDouble(lastTier ? lastTier.pricingColorDouble.toString() : '8');
    setIsAddPricingModalOpen(true);
  };

  const handleOpenEditPricingModal = (tier: PriceTier) => {
    setEditingTierId(tier.id);
    setModalError(null);
    setNewFromPage(tier.fromPage.toString());
    setNewToPage(tier.toPage !== null ? tier.toPage.toString() : '');
    setNewPricingBwSingle(tier.pricingBwSingle.toString());
    setNewPricingBwDouble(tier.pricingBwDouble.toString());
    setNewPricingColorSingle(tier.pricingColorSingle.toString());
    setNewPricingColorDouble(tier.pricingColorDouble.toString());
    setIsAddPricingModalOpen(true);
  };

  const handleSaveNewPricingModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const fromP = parseInt(newFromPage) || 1;
    const toP = newToPage.trim() === '' ? null : (parseInt(newToPage) || null);
    const bwSingle = parseFloat(newPricingBwSingle) || 0;
    const bwDouble = parseFloat(newPricingBwDouble) || 0;
    const colorSingle = parseFloat(newPricingColorSingle) || 0;
    const colorDouble = parseFloat(newPricingColorDouble) || 0;

    if (toP !== null && fromP > toP) {
      setModalError(`Invalid Range: "From Page" (${fromP}) cannot be greater than "To Page" (${toP}).`);
      return;
    }

    const otherTiers = priceTiers.filter(t => t.id !== editingTierId);
    const newMax = toP === null ? Infinity : toP;

    for (const existing of otherTiers) {
      const existMax = existing.toPage === null ? Infinity : existing.toPage;
      const hasOverlap = (fromP <= existMax) && (existing.fromPage <= newMax);

      if (hasOverlap) {
        const existStr = `${existing.fromPage} - ${existing.toPage ? existing.toPage + ' Pages' : '∞ Pages'}`;
        const newStr = `${fromP} - ${toP ? toP + ' Pages' : '∞ Pages'}`;
        setModalError(`Overlapping Range Error: Range (${newStr}) overlaps with existing range (${existStr}). Multiple prices cannot be assigned to overlapping page ranges.`);
        return;
      }
    }

    let updatedTiers: PriceTier[] = [];

    if (editingTierId) {
      updatedTiers = priceTiers.map(t => t.id === editingTierId ? {
        ...t,
        fromPage: fromP,
        toPage: toP,
        pricingBwSingle: bwSingle,
        pricingBwDouble: bwDouble,
        pricingColorSingle: colorSingle,
        pricingColorDouble: colorDouble
      } : t);
    } else {
      const newTier: PriceTier = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 6),
        fromPage: fromP,
        toPage: toP,
        pricingBwSingle: bwSingle,
        pricingBwDouble: bwDouble,
        pricingColorSingle: colorSingle,
        pricingColorDouble: colorDouble
      };
      updatedTiers = [...priceTiers, newTier];
      setSelectedTierId(newTier.id);
    }

    updatedTiers.sort((a, b) => a.fromPage - b.fromPage);
    setPriceTiers(updatedTiers);

    if (userId) {
      localStorage.setItem(`printdedo_price_tiers_${userId}`, JSON.stringify(updatedTiers));
      const baseTier = updatedTiers[0];
      if (baseTier) {
        await supabase.from('shops').update({
          pricing_bw: baseTier.pricingBwSingle,
          pricing_bw_double: baseTier.pricingBwDouble,
          pricing_color: baseTier.pricingColorSingle,
          pricing_color_double: baseTier.pricingColorDouble
        }).eq('id', userId);
      }
    }

    setIsAddPricingModalOpen(false);
    setEditingTierId(null);
    setModalError(null);
  };

  const handleRemovePriceTier = async (id: string) => {
    const updatedTiers = priceTiers.filter(t => t.id !== id);
    setPriceTiers(updatedTiers);
    if (updatedTiers.length > 0) {
      setSelectedTierId(updatedTiers[0].id);
    } else {
      setSelectedTierId('');
    }

    if (userId) {
      localStorage.setItem(`printdedo_price_tiers_${userId}`, JSON.stringify(updatedTiers));
      if (updatedTiers.length > 0) {
        const baseTier = updatedTiers[0];
        await supabase.from('shops').update({
          pricing_bw: baseTier.pricingBwSingle,
          pricing_bw_double: baseTier.pricingBwDouble,
          pricing_color: baseTier.pricingColorSingle,
          pricing_color_double: baseTier.pricingColorDouble
        }).eq('id', userId);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      
      const storedLoc = localStorage.getItem('printdedo_location');
      if (storedLoc) setLocation(storedLoc);
      const storedLogo = localStorage.getItem('printdedo_logo');
      if (storedLogo) setLogo(storedLogo);
      const storedRating = localStorage.getItem('printdedo_rating');
      if (storedRating) setRating(parseFloat(storedRating));
      const storedReviews = localStorage.getItem('printdedo_reviews');
      if (storedReviews) setReviews(parseInt(storedReviews));
    }
    
    let subscription: any;

    const loadDashboard = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        if (error) {
          await supabase.auth.signOut().catch(() => {});
        }
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      
      const reviewsKey = `printdedo_reviews_list_${session.user.id}`;
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
            localStorage.setItem('printdedo_rating', average.toFixed(1));
            localStorage.setItem('printdedo_reviews', count.toString());
          }
        } catch (e) {
          console.error('Failed to parse reviews list:', e);
        }
      }

      const storedAddons = localStorage.getItem(`printdedo_addons_${session.user.id}`);
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
        localStorage.setItem(`printdedo_addons_${session.user.id}`, JSON.stringify(defaults));
      }
      
      let { data: shopData, error: fetchError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (fetchError || !shopData) {
        setShopName('Shop Owner');
        setShopProfile(null);
      } else {
        setShopName(shopData.store_name);
        setShopProfile(shopData);
        if (shopData.pricing_bw !== null && shopData.pricing_bw !== undefined) {
          setPricingBwSingle(shopData.pricing_bw.toString());
        }
        if (shopData.pricing_bw_double !== null && shopData.pricing_bw_double !== undefined) {
          setPricingBwDouble(shopData.pricing_bw_double.toString());
        }
        if (shopData.pricing_color !== null && shopData.pricing_color !== undefined) {
          setPricingColorSingle(shopData.pricing_color.toString());
        }
        if (shopData.pricing_color_double !== null && shopData.pricing_color_double !== undefined) {
          setPricingColorDouble(shopData.pricing_color_double.toString());
        }

        const storedTiers = localStorage.getItem(`printdedo_price_tiers_${session.user.id}`);
        if (storedTiers) {
          try {
            const parsed = JSON.parse(storedTiers);
            setPriceTiers(parsed);
            if (parsed.length > 0) setSelectedTierId(parsed[0].id);
          } catch (e) {}
        } else {
          const defaultTier: PriceTier = {
            id: 'tier_default',
            fromPage: 1,
            toPage: null,
            pricingBwSingle: shopData.pricing_bw ?? 2,
            pricingBwDouble: shopData.pricing_bw_double ?? 3,
            pricingColorSingle: shopData.pricing_color ?? 5,
            pricingColorDouble: shopData.pricing_color_double ?? 8,
          };
          setPriceTiers([defaultTier]);
          setSelectedTierId('tier_default');
          localStorage.setItem(`printdedo_price_tiers_${session.user.id}`, JSON.stringify([defaultTier]));
        }

        setInitialData({
          store_name: shopData.store_name,
          pricing_bw: shopData.pricing_bw !== null ? shopData.pricing_bw.toString() : '0',
          pricing_bw_double: shopData.pricing_bw_double !== null && shopData.pricing_bw_double !== undefined ? shopData.pricing_bw_double.toString() : '0',
          pricing_color: shopData.pricing_color !== null ? shopData.pricing_color.toString() : '0',
          pricing_color_double: shopData.pricing_color_double !== null && shopData.pricing_color_double !== undefined ? shopData.pricing_color_double.toString() : '0',
        });
      }

      fetchOrders(session.user.id);

      subscription = supabase
        .channel(`orders_changes_${Date.now()}`)
        .on(
          'postgres_changes', 
          { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${session.user.id}` }, 
          (payload) => {
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
        pricingBwSingle !== initialData.pricing_bw ||
        pricingBwDouble !== initialData.pricing_bw_double ||
        pricingColorSingle !== initialData.pricing_color ||
        pricingColorDouble !== initialData.pricing_color_double;

      setHasChanges(isChanged);
    }
  }, [shopName, pricingBwSingle, pricingBwDouble, pricingColorSingle, pricingColorDouble, initialData]);

  useEffect(() => {
    if (typeof window !== 'undefined' && userId) {
      const stored = localStorage.getItem(`printdedo_recent_orders_${userId}`);
      if (stored) {
        try {
          const parsed: RecentOrder[] = JSON.parse(stored);
          const now = Date.now();
          const threeMin = 3 * 60 * 1000;
          const valid = parsed.filter(item => (now - item.completedAt) < threeMin);
          setRecentOrders(valid);
        } catch (e) {}
      }
    }
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const threeMinMs = 3 * 60 * 1000;

      setRecentOrders(prev => {
        let hasChanges = false;
        const remaining = prev.filter(item => {
          const elapsed = now - item.completedAt;
          if (elapsed >= threeMinMs) {
            hasChanges = true;
            if (item.order?.id) {
              if (item.order?.file_path) {
                import('@/lib/r2').then(r2 => r2.deleteR2File(item.order.file_path)).catch(() => {});
              }
              supabase.from('orders').delete().eq('id', item.order.id).then(() => {}, () => {});
            }
            return false;
          }
          return true;
        });

        if (hasChanges && userId) {
          localStorage.setItem(`printdedo_recent_orders_${userId}`, JSON.stringify(remaining));
        }
        return remaining;
      });

      setTimerTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

      setOrders(prevOrders => {
        const remaining: any[] = [];
        for (const order of prevOrders) {
          const orderTime = new Date(order.created_at).getTime();
          if (orderTime < tenMinutesAgo) {
            if (order.id) {
              if (order.file_path) {
                import('@/lib/r2').then(r2 => r2.deleteR2File(order.file_path)).catch(() => {});
              }
              supabase.from('orders').delete().eq('id', order.id).then(() => {}, () => {});
            }
          } else {
            remaining.push(order);
          }
        }
        return remaining;
      });

      if (userId) {
        supabase
          .from('orders')
          .delete()
          .eq('shop_id', userId)
          .eq('status', 'pending')
          .lt('created_at', new Date(tenMinutesAgo).toISOString())
          .then(() => {}, () => {});
      }
    }, 5000);

    
    return () => clearInterval(interval);
  }, [userId]);

  // Shop Reviews State
  const [shopReviews, setShopReviews] = useState<ShopReviewItem[]>([]);
  const [isShopReviewsModalOpen, setIsShopReviewsModalOpen] = useState(false);

  const fetchShopReviews = async (sId: string) => {
    let list: ShopReviewItem[] = [];

    try {
      const { data, error } = await supabase
        .from('shop_reviews')
        .select('*')
        .eq('shop_id', sId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data;
      }
    } catch (e) {}

    // Fallback to localStorage
    if (list.length === 0 && typeof window !== 'undefined') {
      const stored = localStorage.getItem(`printdedo_reviews_list_${sId}`);
      if (stored) {
        try { list = JSON.parse(stored); } catch (e) {}
      }
    }

    setShopReviews(list);

    if (list.length > 0) {
      const count = list.length;
      const sum = list.reduce((acc, r) => acc + r.rating, 0);
      const avg = parseFloat((sum / count).toFixed(1));
      setRating(avg);
      setReviews(count);
    }
  };

  const handleDeleteShopReview = async (id: string) => {
    if (!userId) return;
    try {
      await supabase.from('shop_reviews').delete().eq('id', id);
    } catch (e) {}

    const updated = shopReviews.filter(r => r.id !== id);
    setShopReviews(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`printdedo_reviews_list_${userId}`, JSON.stringify(updated));
    }

    const count = updated.length;
    const avg = count > 0 ? parseFloat((updated.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1)) : 5.0;
    setRating(avg);
    setReviews(count);
  };

  const handleReplyShopReview = async (id: string, reply: string) => {
    if (!userId) return;
    try {
      await supabase.from('shop_reviews').update({ reply }).eq('id', id);
    } catch (e) {}

    const updated = shopReviews.map(r => r.id === id ? { ...r, reply } : r);
    setShopReviews(updated);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`printdedo_reviews_list_${userId}`, JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (userId) {
      fetchShopReviews(userId);
    }
  }, [userId]);

  const handleAddAddon = () => {
    if (!newAddonName || !newAddonPrice) return;
    const price = Math.max(0, Math.min(100000, parseFloat(newAddonPrice) || 0));
    const trimmedName = newAddonName.trim().substring(0, 50);
    if (!trimmedName) return;
    
    const newAddon = {
      id: Date.now().toString(),
      name: trimmedName,
      price: price
    };
    
    const updated = [...addons, newAddon];
    setAddons(updated);
    if (userId) {
      localStorage.setItem(`printdedo_addons_${userId}`, JSON.stringify(updated));
    }
    setNewAddonName('');
    setNewAddonPrice('');
  };

  const handleRemoveAddon = (id: string) => {
    const updated = addons.filter(addon => addon.id !== id);
    setAddons(updated);
    if (userId) {
      localStorage.setItem(`printdedo_addons_${userId}`, JSON.stringify(updated));
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
      
      localStorage.setItem('printdedo_location', tempLocation);
      setLocation(tempLocation);
      
      localStorage.setItem('printdedo_logo', tempLogo);
      setLogo(tempLogo);
      
      setIsEditingBanner(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save shop details.');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handlePrintQR = () => {
    const prevTitle = document.title;
    document.title = '';
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 500);
  };

  const slicePdfIfNeeded = async (pdfArrayBuffer: ArrayBuffer, customerName: string): Promise<Uint8Array> => {
    if (!customerName) return new Uint8Array(pdfArrayBuffer);
    
    const match = customerName.match(/\[Pages\s+([^\]]+)\]/i);
    if (!match) return new Uint8Array(pdfArrayBuffer);

    const spec = match[1].trim();
    if (spec.toLowerCase().startsWith('all')) return new Uint8Array(pdfArrayBuffer);

    try {
      const srcDoc = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      const selectedIndices: number[] = [];
      const parts = spec.split(',');
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = parseInt(startStr, 10);
          const end = parseInt(endStr, 10);
          if (!isNaN(start) && !isNaN(end)) {
            const s = Math.max(1, Math.min(start, end));
            const e = Math.min(totalPages, Math.max(start, end));
            for (let i = s; i <= e; i++) {
              selectedIndices.push(i - 1);
            }
          }
        } else {
          const p = parseInt(trimmed, 10);
          if (!isNaN(p) && p >= 1 && p <= totalPages) {
            selectedIndices.push(p - 1);
          }
        }
      }

      if (selectedIndices.length === 0) return new Uint8Array(pdfArrayBuffer);

      const uniqueIndices = Array.from(new Set(selectedIndices));
      const dstDoc = await PDFDocument.create();
      const copiedPages = await dstDoc.copyPages(srcDoc, uniqueIndices);
      copiedPages.forEach(p => dstDoc.addPage(p));
      
      return await dstDoc.save();
    } catch (err) {
      console.error('Failed to slice PDF:', err);
      return new Uint8Array(pdfArrayBuffer);
    }
  };

  const handlePrint = async (order: any) => {
    try {
      const { getPresignedDownloadUrl, deleteR2File } = await import('@/lib/r2');
      const presigned = await getPresignedDownloadUrl(order.file_path);
      if (!presigned.success || !presigned.url) {
        throw new Error(presigned.error || 'Failed to get download URL from Cloudflare R2.');
      }

      const res = await fetch(presigned.url);
      if (!res.ok) throw new Error('Failed to fetch PDF from Cloudflare R2.');

      const fileBlob = await res.blob();
      const rawBuffer = await fileBlob.arrayBuffer();
      const processedPdfBytes = await slicePdfIfNeeded(rawBuffer, order.customer_name);
      const url = URL.createObjectURL(new Blob([new Uint8Array(processedPdfBytes)], { type: 'application/pdf' }));
      
      const iframe = document.createElement('iframe');
      iframe.style.visibility = 'hidden';
      iframe.style.position = 'absolute';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.border = 'none';
      
      iframe.src = url;
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(async () => {
            const didPrint = window.confirm("Did the document print successfully?\n\nClick OK to mark as completed and move it to Recents queue.");
            
            if (didPrint) {
              await supabase
                .from('orders')
                .update({ status: 'completed' })
                .eq('id', order.id);

              // Auto-delete file from Cloudflare R2 3 minutes after being moved to Recents queue
              setTimeout(async () => {
                try {
                  await deleteR2File(order.file_path);
                } catch (e) {
                  console.error('Auto-delete R2 file error:', e);
                }
              }, 3 * 60 * 1000); // 3 minutes


              const now = Date.now();
              setRecentOrders(prev => {
                const updated = [
                  { order, completedAt: now },
                  ...prev.filter(r => r.order.id !== order.id)
                ];
                if (userId) {
                  localStorage.setItem(`printdedo_recent_orders_${userId}`, JSON.stringify(updated));
                }
                return updated;
              });

              if (userId) fetchOrders(userId);
            }

            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          }, 500);

        }, 200);
      };
    } catch (err) {
      console.error(err);
      alert('Failed to load PDF for printing.');
    }
  };

  return {
    // State
    orders,
    recentOrders,
    isRecentsModalOpen,
    setIsRecentsModalOpen,
    isShopPricingOpen,
    setIsShopPricingOpen,
    isAddonsDropdownOpen,
    setIsAddonsDropdownOpen,
    priceTiers,
    selectedTierId,
    setSelectedTierId,
    activeTier,
    isAddPricingModalOpen,
    setIsAddPricingModalOpen,
    editingTierId,
    modalError,
    newFromPage,
    setNewFromPage,
    newToPage,
    setNewToPage,
    newPricingBwSingle,
    setNewPricingBwSingle,
    newPricingBwDouble,
    setNewPricingBwDouble,
    newPricingColorSingle,
    setNewPricingColorSingle,
    newPricingColorDouble,
    setNewPricingColorDouble,
    shopName,
    location,
    logo,
    rating,
    reviews,
    addons,
    isEditingAddons,
    setIsEditingAddons,
    newAddonName,
    setNewAddonName,
    newAddonPrice,
    setNewAddonPrice,
    hasChanges,
    userId,
    origin,
    isEditingBanner,
    setIsEditingBanner,
    tempShopName,
    setTempShopName,
    tempLocation,
    setTempLocation,
    tempLogo,
    setTempLogo,
    timerTick,
    shopReviews,
    isShopReviewsModalOpen,
    setIsShopReviewsModalOpen,

    // Methods / Helpers
    getSplitShopName,
    formatFilename,
    getSubscriptionAlert,
    getSubStatusLabel,
    handleOpenAddPricingModal,
    handleOpenEditPricingModal,
    handleSaveNewPricingModal,
    handleRemovePriceTier,
    handleAddAddon,
    handleRemoveAddon,
    handleSaveBannerSettings,
    handleDeleteShopReview,
    handleReplyShopReview,
    handleLogout,
    handlePrintQR,
    handlePrint,
  };
}
