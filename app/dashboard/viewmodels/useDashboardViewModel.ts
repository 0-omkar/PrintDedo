import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { PDFDocument } from 'pdf-lib';
import { RecentOrder, PriceTier, Addon, ShopProfile } from '../types';
import { ShopReviewItem } from '../components/ShopReviewsModal';
import { toast } from 'sonner';

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
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [tempAlternatePhone, setTempAlternatePhone] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempLogo, setTempLogo] = useState('');
  const [shopPhone, setShopPhone] = useState('');

  // Download & Print Requirements Modal State
  const [downloadModalOrder, setDownloadModalOrder] = useState<any | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const openDownloadModal = (order: any) => {
    setDownloadModalOrder(order);
    setIsDownloadModalOpen(true);
  };

  const closeDownloadModal = () => {
    setIsDownloadModalOpen(false);
    setDownloadModalOrder(null);
  };

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
    // Strip timestamp prefix (e.g. 1721723849_x9k2m_OriginalName.pdf -> OriginalName.pdf)
    const cleaned = filename.replace(/^\d+_[a-z0-9]+_/i, '');
    return cleaned || filename;
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
    const tenMinutesAgoIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // 1. Delete orders & their Cloudflare R2 storage files older than 10 minutes
    try {
      const { data: expiredOrders } = await supabase
        .from('orders')
        .select('file_path')
        .eq('shop_id', sId)
        .eq('status', 'pending')
        .lt('created_at', tenMinutesAgoIso);

      if (expiredOrders && expiredOrders.length > 0) {
        const { deleteR2File } = await import('@/lib/r2');
        for (const exp of expiredOrders) {
          if (exp.file_path) {
            deleteR2File(exp.file_path).catch(() => {});
          }
        }
      }

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
        
        const primaryPhone = shopData.phone || shopData.mobile_number || '';
        const altPhone = shopData.alternate_phone || (typeof window !== 'undefined' ? localStorage.getItem('printdedo_alternate_phone') || '' : '');
        setRegisteredPhone(primaryPhone);
        setAlternatePhone(altPhone);
        setTempAlternatePhone(altPhone);
        setShopPhone(primaryPhone || altPhone || '');
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
        fetchOrders(userId);
        supabase
          .from('orders')
          .delete()
          .eq('shop_id', userId)
          .eq('status', 'pending')
          .lt('created_at', new Date(tenMinutesAgo).toISOString())
          .then(() => {}, () => {});
      }
    }, 3000);

    
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
      if (userId) {
        const updateObj: any = {
          alternate_phone: tempAlternatePhone.trim()
        };
        if (tempShopName !== shopName) updateObj.store_name = tempShopName;

        const { error } = await supabase
          .from('shops')
          .update(updateObj)
          .eq('id', userId);
        if (error) console.error('Supabase shop update info:', error);

        setShopName(tempShopName);
        setAlternatePhone(tempAlternatePhone.trim());
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('printdedo_alternate_phone', tempAlternatePhone.trim());
        localStorage.setItem('printdedo_location', tempLocation);
        localStorage.setItem('printdedo_logo', tempLogo);
      }
      
      setShopPhone(registeredPhone || tempAlternatePhone.trim());
      setLocation(tempLocation);
      setLogo(tempLogo);
      
      setIsEditingBanner(false);
      toast.success('Shop profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save shop details.');
    } finally {
      setSaving(false);
    }
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

  const escapeHtml = (str: string) => {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const completeOrderInDb = async (orderId: string, promptConfirmation = false) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    try {
      const { deleteR2File } = await import('@/lib/r2');
      await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      toast.success(`Order #${orderId.slice(0, 8)} completed & moved to Recents!`);

      setTimeout(async () => {
        try {
          await deleteR2File(targetOrder.file_path);
        } catch (e) {
          console.error('Auto-delete R2 file error:', e);
        }
      }, 3 * 60 * 1000);

      const now = Date.now();
      setRecentOrders(prev => {
        const updated = [
          { order: targetOrder, completedAt: now },
          ...prev.filter(r => r.order.id !== targetOrder.id)
        ];
        if (userId) {
          localStorage.setItem(`printdedo_recent_orders_${userId}`, JSON.stringify(updated));
        }
        return updated;
      });

      if (userId) fetchOrders(userId);
      toast.success('Order completed & moved to Recents Queue!');
    } catch (err) {
      console.error('Failed to complete order in DB:', err);
    }
  };

  useEffect(() => {
    const handleWindowMessage = (event: MessageEvent) => {
      // Production-level origin validation to prevent unauthorized postMessage execution
      if (typeof window !== 'undefined' && event.origin !== window.location.origin) return;
      if (event.data && event.data.type === 'PRINTDEDO_ORDER_COMPLETED' && event.data.orderId) {
        completeOrderInDb(event.data.orderId, false);
      }
    };
    window.addEventListener('message', handleWindowMessage);
    return () => window.removeEventListener('message', handleWindowMessage);
  }, [orders, userId]);

  const slicePdfIfNeeded = async (pdfArrayBuffer: ArrayBuffer, customerName: string): Promise<Uint8Array> => {
    if (!customerName) return new Uint8Array(pdfArrayBuffer);
    
    const match = customerName.match(/\[(?:Pages|All)\s+([^\]]+)\]/i);
    if (!match) return new Uint8Array(pdfArrayBuffer);

    const spec = match[1].trim();
    if (spec.toLowerCase().startsWith('all')) return new Uint8Array(pdfArrayBuffer);

    try {
      const srcDoc = await PDFDocument.load(pdfArrayBuffer, { ignoreEncryption: true });
      const totalPages = srcDoc.getPageCount();

      const selectedIndices: number[] = [];
      const normalizedSpec = spec.replace(/[\u2013\u2014]/g, '-');
      const parts = normalizedSpec.split(',');

      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        if (trimmed.includes('-')) {
          const dashIdx = trimmed.indexOf('-');
          const start = parseInt(trimmed.substring(0, dashIdx).trim(), 10);
          const end = parseInt(trimmed.substring(dashIdx + 1).trim(), 10);
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

      const uniqueIndices = Array.from(new Set(selectedIndices)).sort((a, b) => a - b);
      const dstDoc = await PDFDocument.create();
      const copiedPages = await dstDoc.copyPages(srcDoc, uniqueIndices);
      copiedPages.forEach(p => dstDoc.addPage(p));
      
      return await dstDoc.save();
    } catch (err) {
      console.error('Failed to slice PDF:', err);
      return new Uint8Array(pdfArrayBuffer);
    }
  };

  const executeFileDownload = async (order: any) => {
    try {
      const { getPresignedDownloadUrl } = await import('@/lib/r2');
      const presigned = await getPresignedDownloadUrl(order.file_path);
      if (!presigned.success || !presigned.url) throw new Error('Download URL failed.');

      const filePathLower = (order.file_path || '').toLowerCase();
      const isPdf = order.mime_type ? order.mime_type === 'application/pdf' : filePathLower.endsWith('.pdf');

      let downloadBlob: Blob;
      const filename = formatFilename(order.file_path);

      if (isPdf) {
        const res = await fetch(presigned.url);
        if (!res.ok) throw new Error('Failed to fetch PDF for download.');
        const rawBuffer = await (await res.blob()).arrayBuffer();
        const processedBytes = await slicePdfIfNeeded(rawBuffer, order.customer_name);
        downloadBlob = new Blob([new Uint8Array(processedBytes)], { type: 'application/pdf' });
      } else {
        const res = await fetch(presigned.url);
        if (!res.ok) throw new Error('Failed to fetch file for download.');
        downloadBlob = await res.blob();
      }

      // Local blob URL guarantees direct 1-click download without opening a new tab
      const localBlobUrl = URL.createObjectURL(downloadBlob);
      const a = document.createElement('a');
      a.href = localBlobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(localBlobUrl), 10000);

      toast.success('Download started directly!');
    } catch (err: any) {
      console.error('Download error:', err);
      toast.error('Failed to download file.');
    }
  };

  const handleDownload = async (order: any) => {
    openDownloadModal(order);
  };

  const handlePrint = async (order: any) => {
    const filePathLower = (order.file_path || '').toLowerCase();
    const isPdf = order.mime_type ? order.mime_type === 'application/pdf' : filePathLower.endsWith('.pdf');

    if (!isPdf) {
      openDownloadModal(order);
      return;
    }

    // PDF Flow: Synchronously open popup tab to bypass popup blockers
    const printWin = window.open('about:blank', '_blank');
    if (!printWin) {
      toast.warning('Popup blocked — downloading instead.');
      await handleDownload(order);
      return;
    }

    try {
      // Display sleek dark theme loader in print tab while preparing PDF
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preparing Print Job... - PrintDedo</title>
          <style>
            body { margin:0; padding:0; background:#0f172a; color:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,sans-serif; height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; }
            .spinner { border: 4px solid #334155; border-top: 4px solid #facc15; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h3 { margin: 0 0 8px 0; font-size: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            p { margin: 0; font-size: 13px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="spinner"></div>
          <h3>Preparing Document for Print</h3>
          <p>Please wait while PrintDedo processes page selection and prepares print preview...</p>
        </body>
        </html>
      `);

      const isMobileOrTablet = /Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isMobileOrTablet) {
        printWin.close();
        toast.info('Mobile device detected — downloading file directly.');
        await handleDownload(order);
        return;
      }

      const { getPresignedDownloadUrl } = await import('@/lib/r2');
      const presigned = await getPresignedDownloadUrl(order.file_path);
      if (!presigned.success || !presigned.url) {
        throw new Error(presigned.error || 'Failed to get download URL from R2.');
      }

      const res = await fetch(presigned.url);
      if (!res.ok) throw new Error('Failed to fetch PDF from Cloudflare R2.');

      const fileBlob = await res.blob();
      const rawBuffer = await fileBlob.arrayBuffer();
      const processedPdfBytes = await slicePdfIfNeeded(rawBuffer, order.customer_name);
      const pdfBlobUrl = URL.createObjectURL(new Blob([new Uint8Array(processedPdfBytes)], { type: 'application/pdf' }));

      const rawCustomerName = (order.customer_name || 'Anonymous').replace(/\s*\[[^\]]+\]/g, '').trim();

      let rawPageSpec = 'All Pages';
      const pageMatch = (order.customer_name || '').match(/\[(?:Pages|All)\s+([^\]]+)\]/i);
      if (pageMatch && pageMatch[1]) {
        const clean = pageMatch[1].replace(/^Pages\s*/i, '').trim();
        rawPageSpec = clean;
      }

      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '*';
      const safeFilename = escapeHtml(formatFilename(order.file_path));
      const safeCustomerName = escapeHtml(rawCustomerName || 'Anonymous');
      const safeCustomerPhone = escapeHtml(order.customer_phone || '');
      const safePageSpec = escapeHtml(rawPageSpec);
      const safeColorMode = escapeHtml((order.color_mode || 'bw').replace('_', ' ').toUpperCase());
      const safeOrderId = escapeHtml(order.id);

      // 30-Second Stranded Tab Reminder
      const strandedTimer = setTimeout(() => {
        if (printWin && !printWin.closed) {
          toast.message(`Still printing order #${safeOrderId.slice(0, 8)}?`, {
            action: {
              label: 'Close Tab & Complete',
              onClick: () => {
                if (!printWin.closed) printWin.close();
                completeOrderInDb(order.id, false);
              },
            },
          });
        }
      }, 30000);

      // Write White & Yellow theme print viewer with clean customer requirements & post-print modal card
      printWin.document.open();
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Printing ${safeFilename} - PrintDedo</title>
          <style>
            * { box-sizing: border-box; }
            html, body { margin:0; padding:0; width:100%; height:100%; background:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:#0f172a; overflow:hidden; display:flex; flex-direction:column; }
            
            /* White & Yellow Topbar Header */
            .topbar { background:#ffffff; width:100%; padding:0.8% 2.5%; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; gap:1.5%; box-shadow:0 2px 8px rgba(0,0,0,0.04); z-index:20; }
            .info { flex:1; min-width:45%; }
            .info h2 { margin:0; font-size:1.05rem; color:#0f172a; font-weight:900; text-transform:uppercase; letter-spacing:0.3px; word-break:break-all; }
            
            .req-badges { display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.35rem; align-items:center; }
            .badge { background:#f1f5f9; color:#334155; font-size:0.75rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:0.6rem; border:1px solid #e2e8f0; display:inline-flex; align-items:center; gap:0.25rem; }
            .badge-highlight { background:#fef9c3; color:#854d0e; border-color:#fde047; font-weight:800; }
            
            .btn-group { display:flex; gap:0.8rem; align-items:center; shrink:0; }
            .btn { background:#facc15; color:#000; border:none; padding:0.65rem 1.4rem; font-weight:800; font-size:0.85rem; border-radius:0.75rem; cursor:pointer; transition:all 0.2s ease; display:inline-flex; align-items:center; gap:0.4rem; box-shadow:0 2px 4px rgba(250,204,21,0.25); }
            .btn:hover { background:#eab308; transform:translateY(-1px); }
            .btn-close { background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; box-shadow:none; }
            .btn-close:hover { background:#e2e8f0; color:#0f172a; }
            
            /* PDF Viewer Container */
            .viewer-container { position:relative; flex:1; width:100%; height:90%; background:#cbd5e1; }
            iframe { width:100%; height:100%; border:none; }
            
            /* White & Yellow Centered Modal Overlay Card */
            .modal-overlay { position:fixed; inset:0; width:100%; height:100%; background:rgba(0, 0, 0, 0.45); backdrop-filter:blur(4px); display:none; align-items:center; justify-content:center; z-index:50; padding:3%; }
            .modal-overlay.active { display:flex; animation:fadeIn 0.2s ease-out; }
            
            .modal-card { background:#ffffff; border:1px solid #e2e8f0; width:92%; max-width:580px; border-radius:1.5rem; padding:4% 5%; box-shadow:0 25px 50px -12px rgba(0,0,0,0.18); text-align:center; color:#0f172a; }
            .modal-card h3 { margin:0 0 0.4rem 0; font-size:1.35rem; font-weight:900; text-transform:uppercase; color:#0f172a; letter-spacing:0.3px; }
            .modal-card p { margin:0 0 1.25rem 0; font-size:0.88rem; color:#64748b; font-weight:600; line-height:1.4; }
            
            .modal-summary { background:#f8fafc; border:1px solid #e2e8f0; border-radius:1rem; padding:4% 5%; margin-bottom:1.5rem; text-align:left; font-size:0.88rem; }
            .modal-summary-row { display:flex; justify-content:space-between; align-items:center; padding:0.45rem 0; border-bottom:1px solid #e2e8f0; color:#475569; font-weight:600; }
            .modal-summary-row:last-child { border-bottom:none; }
            .modal-summary-row strong { color:#0f172a; font-weight:800; word-break:break-all; }
            
            .modal-actions { display:flex; gap:0.85rem; justify-content:center; }
            .modal-btn-print { background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; flex:1; padding:0.75rem 1.2rem; font-size:0.9rem; font-weight:800; border-radius:0.75rem; cursor:pointer; }
            .modal-btn-print:hover { background:#e2e8f0; color:#0f172a; }
            .modal-btn-done { background:#facc15; color:#000000; flex:1.2; padding:0.75rem 1.2rem; font-size:0.9rem; font-weight:900; border-radius:0.75rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(250,204,21,0.3); }
            .modal-btn-done:hover { background:#eab308; transform:translateY(-1px); }
            
            @keyframes fadeIn { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
          </style>
        </head>
        <body>
          <div class="topbar">
            <div class="info">
              <h2>🖨️ ${safeFilename}</h2>
              <div class="req-badges">
                <span class="badge">👤 ${safeCustomerName}</span>
                ${safeCustomerPhone ? `<span class="badge">📞 ${safeCustomerPhone}</span>` : ''}
                <span class="badge">📋 Copies: ${order.quantity}</span>
                <span class="badge">✂️ ${safePageSpec}</span>
                <span class="badge">🎨 ${safeColorMode}</span>
                <span class="badge badge-highlight">₹${order.total_cost || 0}</span>
              </div>
            </div>
            <div class="btn-group">
              <button class="btn" onclick="triggerPrint()">🖨️ Print Now</button>
              <button class="btn btn-close" onclick="closeAndComplete()">Done / Complete</button>
            </div>
          </div>

          <div class="viewer-container">
            <iframe id="pdfFrame" src="${pdfBlobUrl}"></iframe>
          </div>

          <!-- Pre-Print Requirements Modal Overlay -->
          <div id="prePrintModal" class="modal-overlay active">
            <div class="modal-card">
              <h3>Job Requirements Summary</h3>
              <p>Review customer print specifications before opening Chrome print menu.</p>
              
              <div class="modal-summary">
                <div class="modal-summary-row"><span>Customer:</span> <strong>${safeCustomerName}</strong></div>
                ${safeCustomerPhone ? `<div class="modal-summary-row"><span>Phone:</span> <strong>${safeCustomerPhone}</strong></div>` : ''}
                <div class="modal-summary-row"><span>Document:</span> <strong>${safeFilename}</strong></div>
                <div class="modal-summary-row"><span>Copies:</span> <strong>${order.quantity}</strong></div>
                <div class="modal-summary-row"><span>Pages Selection:</span> <strong>${safePageSpec}</strong></div>
                <div class="modal-summary-row"><span>Color Mode:</span> <strong>${safeColorMode}</strong></div>
                <div class="modal-summary-row"><span>Total Cost:</span> <strong style="color:#ca8a04;">₹${order.total_cost || 0}</strong></div>
              </div>

              <div class="modal-actions">
                <button class="btn modal-btn-done" onclick="triggerPrint()">🖨️ Open Print Menu</button>
                <button class="btn modal-btn-print" onclick="closeAndComplete()">Done / Complete</button>
              </div>
            </div>
          </div>

          <!-- Post-Print Completion Modal Overlay -->
          <div id="postPrintModal" class="modal-overlay">
            <div class="modal-card">
              <h3>Print Menu Finished</h3>
              <p>Did the document print successfully?</p>
              
              <div class="modal-summary">
                <div class="modal-summary-row"><span>Customer:</span> <strong>${safeCustomerName}</strong></div>
                ${safeCustomerPhone ? `<div class="modal-summary-row"><span>Phone:</span> <strong>${safeCustomerPhone}</strong></div>` : ''}
                <div class="modal-summary-row"><span>Document:</span> <strong>${safeFilename}</strong></div>
                <div class="modal-summary-row"><span>Copies:</span> <strong>${order.quantity}</strong></div>
                <div class="modal-summary-row"><span>Pages Selection:</span> <strong>${safePageSpec}</strong></div>
                <div class="modal-summary-row"><span>Color Mode:</span> <strong>${safeColorMode}</strong></div>
                <div class="modal-summary-row"><span>Total Cost:</span> <strong style="color:#ca8a04;">₹${order.total_cost || 0}</strong></div>
              </div>

              <div class="modal-actions">
                <button class="btn modal-btn-print" onclick="reprint()">🖨️ Print Again</button>
                <button class="btn modal-btn-done" onclick="closeAndComplete()">✅ Done / Complete Order</button>
              </div>
            </div>
          </div>

          <script>
            function showPostPrintModal() {
              document.getElementById('prePrintModal').classList.remove('active');
              const postModal = document.getElementById('postPrintModal');
              if (postModal) postModal.classList.add('active');
            }

            function triggerPrint() {
              document.getElementById('prePrintModal').classList.remove('active');
              document.getElementById('postPrintModal').classList.remove('active');

              setTimeout(() => {
                const frame = document.getElementById('pdfFrame');
                try {
                  frame.contentWindow.focus();
                  frame.contentWindow.print();
                } catch(e) {
                  window.print();
                }
                // Synchronous print call resumes right after Chrome dialog closes:
                setTimeout(showPostPrintModal, 150);
              }, 100);
            }

            function reprint() {
              triggerPrint();
            }

            function closeAndComplete() {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ type: 'PRINTDEDO_ORDER_COMPLETED', orderId: '${safeOrderId}' }, '${currentOrigin}');
                }
              } catch(e) {}
              window.close();
            }

            window.addEventListener('afterprint', () => {
              setTimeout(showPostPrintModal, 150);
            });

            window.addEventListener('focus', () => {
              setTimeout(showPostPrintModal, 200);
            });

            window.addEventListener('beforeunload', () => {
              try {
                if (window.opener && !window.opener.closed) {
                  window.opener.postMessage({ type: 'PRINTDEDO_ORDER_COMPLETED', orderId: '${safeOrderId}' }, '${currentOrigin}');
                }
              } catch(e) {}
            });
          </script>
        </body>
        </html>
      `);
      printWin.document.close();

    } catch (err: any) {
      console.error('Print error:', err);
      if (printWin && !printWin.closed) printWin.close();
      toast.error(err.message || 'Failed to open document for printing.');
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
    shopPhone,
    registeredPhone,
    alternatePhone,
    tempAlternatePhone,
    setTempAlternatePhone,
    tempLocation,
    setTempLocation,
    tempLogo,
    setTempLogo,
    timerTick,
    shopReviews,
    isShopReviewsModalOpen,
    setIsShopReviewsModalOpen,

    // Download & Print Requirements Modal
    downloadModalOrder,
    isDownloadModalOpen,
    openDownloadModal,
    closeDownloadModal,
    completeOrderInDb,
    executeFileDownload,

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
    handleDownload,
  };
}
