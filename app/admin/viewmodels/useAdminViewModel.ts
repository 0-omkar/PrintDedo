import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { ActiveView, PlanItem, ShopItem, AdminMessage, StorageMetrics, PlatformReview } from '../types';

export function useAdminViewModel() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);

  // Shop Management State
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [storageMetrics, setStorageMetrics] = useState<Record<string, StorageMetrics>>({});
  const [totalBandwidth, setTotalBandwidth] = useState<number>(0);
  const [currentMemory, setCurrentMemory] = useState<number>(0);
  const [gbHoursUsed, setGbHoursUsed] = useState<number>(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Registration Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('free_trial');
  const [customMonths, setCustomMonths] = useState<string>('1');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Subscription Plans State
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('1');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [createPlanLoading, setCreatePlanLoading] = useState(false);

  // Edit Plan State
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanDuration, setEditPlanDuration] = useState('1');
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [planSaveLoading, setPlanSaveLoading] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<PlanItem | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Admin Messages State
  const [adminMessages, setAdminMessages] = useState<AdminMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Deletion Modal State
  const [shopToDelete, setShopToDelete] = useState<ShopItem | null>(null);
  const [isDeletingShop, setIsDeletingShop] = useState(false);

  // Subscription Renewal Modal State
  const [activeRenewalShop, setActiveRenewalShop] = useState<ShopItem | null>(null);
  const [renewPlan, setRenewPlan] = useState<string>('free_trial');
  const [renewCustomMonths, setRenewCustomMonths] = useState<string>('1');
  const [isRenewing, setIsRenewing] = useState(false);

  // Edit Shop Details Modal State (Admin can edit primary phone, alternate phone, store name, upi)
  const [editingShopModal, setEditingShopModal] = useState<ShopItem | null>(null);
  const [editShopName, setEditShopName] = useState('');
  const [editShopPhone, setEditShopPhone] = useState('');
  const [editShopAlternatePhone, setEditShopAlternatePhone] = useState('');
  const [editShopUpi, setEditShopUpi] = useState('');
  const [isSavingShopDetails, setIsSavingShopDetails] = useState(false);

  const openEditShopModal = (shop: ShopItem) => {
    setEditingShopModal(shop);
    setEditShopName(shop.store_name || '');
    setEditShopPhone(shop.phone || shop.mobile_number || shop.shop_phone || '');
    setEditShopAlternatePhone(shop.alternate_phone || '');
    setEditShopUpi(shop.upi_id || '');
  };

  const closeEditShopModal = () => {
    setEditingShopModal(null);
  };

  const handleSaveShopDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShopModal) return;
    setIsSavingShopDetails(true);

    try {
      const { updateShopDetailsServer } = await import('@/lib/adminActions');
      const res = await updateShopDetailsServer(
        editingShopModal.id,
        {
          store_name: editShopName.trim(),
          phone: editShopPhone.trim(),
          alternate_phone: editShopAlternatePhone.trim(),
          upi_id: editShopUpi.trim(),
        },
        { adminEmail, adminPassword }
      );

      if (res.success) {
        toast.success(`Updated shop details successfully!`);
        fetchShops();
        setEditingShopModal(null);
      } else {
        toast.error(res.error || 'Failed to update shop details');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating shop details');
    } finally {
      setIsSavingShopDetails(false);
    }
  };

  useEffect(() => {
    const checkAdminAuth = async () => {
      const storedToken = localStorage.getItem('printdedo_admin_token');

      if (storedToken) {
        try {
          const parsed = JSON.parse(storedToken);
          // Check 24 hour session expiration
          if (parsed && parsed.authenticated && parsed.timestamp && (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000)) {
            if (parsed.email) setAdminEmail(parsed.email);
            setIsAdminAuthenticated(true);
            fetchShops();
            fetchPlans();
            fetchAdminMessages();
            return;
          }
        } catch (e) {}
        localStorage.removeItem('printdedo_admin_token');
      }

      setIsAdminAuthenticated(false);
    };
    checkAdminAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'printdedo_admin_token' && (!e.newValue || e.newValue === 'null')) {
        setIsAdminAuthenticated(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanInputEmail = adminEmail.trim().toLowerCase();
    const cleanInputPassword = adminPassword.trim();

    // 1. Authenticate securely via Server Action
    try {
      const { verifyAdminCredentials } = await import('@/lib/adminAuth');
      const authResult = await verifyAdminCredentials(cleanInputEmail, cleanInputPassword);
      if (authResult.success) {
        localStorage.setItem('printdedo_admin_token', JSON.stringify({ authenticated: true, email: cleanInputEmail, timestamp: Date.now() }));
        setAdminPassword(''); // Wipe password state from memory
        setIsAdminAuthenticated(true);
        fetchShops();
        fetchPlans();
        fetchAdminMessages();
        return;
      }
    } catch (err) {
      console.warn('Server auth action error:', err);
    }

    // 2. Try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanInputEmail,
        password: cleanInputPassword,
      });

      if (!error && data?.session) {
        localStorage.setItem('printdedo_admin_token', JSON.stringify({ authenticated: true, email: cleanInputEmail, timestamp: Date.now() }));
        setAdminPassword(''); // Wipe password state from memory
        setIsAdminAuthenticated(true);
        fetchShops();
        fetchPlans();
        fetchAdminMessages();
        return;
      }
    } catch (err) {
      console.warn('Supabase auth signin exception:', err);
    }

    setLoginError('Invalid login credentials');
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut().catch(() => {});
    localStorage.removeItem('printdedo_admin_token');
    localStorage.removeItem('printdedo_admin_auth');
    setIsAdminAuthenticated(false);
  };

  const [readMessageIds, setReadMessageIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('printdedo_read_admin_messages');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [];
  });

  const fetchAdminMessages = async () => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const formatted: AdminMessage[] = data.map((msg: any) => {
          const msgId = msg.id ? String(msg.id) : Math.random().toString();
          const isRead = msg.is_read !== undefined && msg.is_read !== null ? Boolean(msg.is_read) : readMessageIds.includes(msgId);
          return {
            id: msgId,
            name: msg.name || 'Anonymous',
            contact_info: msg.contact_info || msg.contact || 'N/A',
            message: msg.message || '',
            created_at: msg.created_at ? new Date(msg.created_at).toLocaleString() : new Date().toLocaleString(),
            is_read: isRead,
          };
        });
        setAdminMessages(formatted);
        setLoadingMessages(false);
        return;
      }
    } catch (e) {
      console.warn('Supabase admin_messages fetch fallback:', e);
    }

    const stored = localStorage.getItem('printdedo_admin_messages');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const formatted = parsed.map((msg: any) => ({
          ...msg,
          is_read: msg.is_read || readMessageIds.includes(String(msg.id)),
        }));
        setAdminMessages(formatted);
      } catch (e) {
        setAdminMessages([]);
      }
    } else {
      setAdminMessages([]);
    }
    setLoadingMessages(false);
  };

  useEffect(() => {
    if (activeView === 'messages' && adminMessages.length > 0) {
      const unreadMsgs = adminMessages.filter(m => !m.is_read && !readMessageIds.includes(m.id));
      if (unreadMsgs.length > 0) {
        const unreadIds = unreadMsgs.map(m => m.id);
        const updatedReadIds = Array.from(new Set([...readMessageIds, ...unreadIds]));
        setReadMessageIds(updatedReadIds);
        if (typeof window !== 'undefined') {
          localStorage.setItem('printdedo_read_admin_messages', JSON.stringify(updatedReadIds));
        }
        supabase.from('admin_messages').update({ is_read: true }).in('id', unreadIds).then(() => {}, () => {});
        setAdminMessages(prev => prev.map(m => ({ ...m, is_read: true })));
      }
    }
  }, [activeView, adminMessages, readMessageIds]);

  const unreadMessagesCount = adminMessages.filter(m => !m.is_read && !readMessageIds.includes(m.id)).length;

  const handleDeleteAdminMessage = async (id: string) => {
    try {
      const { deleteAdminMessageServer } = await import('@/lib/adminActions');
      const res = await deleteAdminMessageServer(id, { adminEmail, adminPassword });
      if (!res.success) {
        toast.error(res.error || 'Failed to delete message');
        return;
      }
    } catch (e) {
      toast.error('Server error deleting message');
      return;
    }

    const updated = adminMessages.filter(m => m.id !== id);
    setAdminMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('printdedo_admin_messages', JSON.stringify(updated));
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    const { data, error } = await supabase.from('plans').select('*').order('price', { ascending: true });
    if (!error && data) {
      setPlans(data);
    } else {
      setPlans([]);
    }
    setLoadingPlans(false);
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePlanLoading(true);
    const newPlanObj: PlanItem = {
      id: newPlanId.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newPlanName.trim(),
      price: parseFloat(newPlanPrice) || 0,
      duration_months: parseInt(newPlanDuration) || 1,
      description: newPlanDesc.trim()
    };

    try {
      const { createSubscriptionPlanServer } = await import('@/lib/adminActions');
      const res = await createSubscriptionPlanServer(newPlanObj, { adminEmail, adminPassword });
      if (res.success) {
        fetchPlans();
      } else {
        toast.error(res.error || 'Failed to create plan');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating plan');
    }

    setShowCreatePlan(false);
    setNewPlanId('');
    setNewPlanName('');
    setNewPlanPrice('');
    setNewPlanDuration('1');
    setNewPlanDesc('');
    setCreatePlanLoading(false);
  };

  const startEditPlan = (plan: PlanItem) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price.toString());
    setEditPlanDuration(plan.duration_months.toString());
    setEditPlanDesc(plan.description || '');
  };

  const handleUpdatePlan = async (planId: string) => {
    setPlanSaveLoading(true);
    const updatedObj = {
      name: editPlanName.trim(),
      price: parseFloat(editPlanPrice) || 0,
      duration_months: parseInt(editPlanDuration) || 1,
      description: editPlanDesc.trim()
    };

    try {
      const { updateSubscriptionPlanServer } = await import('@/lib/adminActions');
      const res = await updateSubscriptionPlanServer(planId, updatedObj, { adminEmail, adminPassword });
      if (res.success) {
        fetchPlans();
      } else {
        toast.error(res.error || 'Failed to update plan');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating plan');
    }

    setEditingPlanId(null);
    setPlanSaveLoading(false);
  };

  const handleDeletePlanConfirm = async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);
    try {
      const { deleteSubscriptionPlanServer } = await import('@/lib/adminActions');
      const res = await deleteSubscriptionPlanServer(planToDelete.id, { adminEmail, adminPassword });
      if (res.success) {
        fetchPlans();
      } else {
        toast.error(res.error || 'Failed to delete plan');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error deleting plan');
    }
    setIsDeletingPlan(false);
    setPlanToDelete(null);
  };

  const fetchShops = async () => {
    setLoadingShops(true);
    const { data: shopsData, error } = await supabase
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shops:', error);
      setLoadingShops(false);
      return;
    }

    setShops(shopsData || []);
    calculateStorageMetrics(shopsData || []);
  };

  const calculateStorageMetrics = async (shopList: ShopItem[]) => {
    const { data: files, error } = await supabase.storage.from('xerox-files').list('', { limit: 1000 });
    
    if (error || !files) {
      setLoadingShops(false);
      return;
    }

    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    const metricsMap: Record<string, StorageMetrics> = {};
    let totalBytesSum = 0;
    let dailyBytesSum = 0;

    shopList.forEach(shop => {
      metricsMap[shop.id] = { current: 0, daily: 0 };
    });

    files.forEach(file => {
      const parts = file.name.split('_');
      if (parts.length >= 2) {
        const shopId = parts[0];
        const fileSize = file.metadata?.size || 0;
        const fileCreatedAt = file.created_at ? new Date(file.created_at).getTime() : 0;

        totalBytesSum += fileSize;

        if (metricsMap[shopId]) {
          metricsMap[shopId].current += fileSize;
          if (fileCreatedAt >= twentyFourHoursAgo) {
            metricsMap[shopId].daily += fileSize;
            dailyBytesSum += fileSize;
          }
        }
      }
    });

    setStorageMetrics(metricsMap);
    setCurrentMemory(totalBytesSum);
    setTotalBandwidth(totalBytesSum * 1.8);
    const gbHours = (totalBytesSum / (1024 * 1024 * 1024)) * 24;
    setGbHoursUsed(gbHours);

    setLoadingShops(false);
  };

  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterSuccess(null);
    setRegisterError(null);

    if (email.length > 120 || password.length > 128 || shopName.length > 100) {
      setRegisterError('Inputs exceed maximum allowed length.');
      setRegisterLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/create-shop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          store_name: shopName.trim(),
          phone: phone.trim(),
          selected_plan_id: selectedPlan,
          custom_months: customMonths,
          adminEmail,
          adminPassword
        })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to create shop account');
      }

      setRegisterSuccess(`Shop "${shopName}" created successfully! Login credentials provisioned.`);
      setEmail('');
      setPassword('');
      setShopName('');
      setPhone('');
      setSelectedPlan('free_trial');
      setCustomMonths('1');
      fetchShops();
    } catch (err: any) {
      setRegisterError(err.message || 'Error registering shop');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeleteShopConfirm = async () => {
    if (!shopToDelete) return;
    setIsDeletingShop(true);

    try {
      const response = await fetch('/api/admin/delete-shop', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shopToDelete.id, adminEmail, adminPassword })
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to delete shop');
      }

      setShops(prev => prev.filter(s => s.id !== shopToDelete.id));
      setShopToDelete(null);
    } catch (err: any) {
      toast.error(`Error deleting shop: ${err.message}`);
    } finally {
      setIsDeletingShop(false);
    }
  };

  const handleRenewShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenewalShop) return;
    setIsRenewing(true);

    let addMonths = 1;
    let planName = 'Free Trial';

    if (renewPlan === 'custom') {
      const parsedMonths = parseInt(renewCustomMonths);
      addMonths = isNaN(parsedMonths) ? 1 : Math.max(-120, Math.min(120, parsedMonths));
      planName = `Custom ${addMonths}M`;
    } else {
      const p = plans.find(plan => plan.id === renewPlan);
      if (p) {
        addMonths = p.duration_months;
        planName = p.name;
      }
    }

    const currentExpiry = activeRenewalShop.subscription_expires_at ? new Date(activeRenewalShop.subscription_expires_at).getTime() : Date.now();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();

    const newExpiry = new Date(baseTime);
    newExpiry.setMonth(newExpiry.getMonth() + addMonths);

    let serverSuccess = false;
    try {
      const { renewShopSubscriptionServer } = await import('@/lib/adminActions');
      const res = await renewShopSubscriptionServer(activeRenewalShop.id, newExpiry.toISOString(), planName, { adminEmail, adminPassword });
      if (res.success) serverSuccess = true;
      else toast.error(res.error || 'Failed to update subscription');
    } catch (e: any) {
      toast.error(e.message || 'Error updating subscription');
    }

    if (serverSuccess) {
      setShops(prev => prev.map(s => s.id === activeRenewalShop.id ? {
        ...s,
        subscription_expires_at: newExpiry.toISOString(),
        subscription_plan_name: planName
      } : s));
      setActiveRenewalShop(null);
    }
    setIsRenewing(false);
  };

  const getFilteredShops = () => {
    let filtered = shops.filter(shop => 
      shop.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'alphabetical':
        return filtered.sort((a, b) => a.store_name.localeCompare(b.store_name));
      case 'soonest_expiry':
        return filtered.sort((a, b) => {
          const tA = a.subscription_expires_at ? new Date(a.subscription_expires_at).getTime() : 0;
          const tB = b.subscription_expires_at ? new Date(b.subscription_expires_at).getTime() : 0;
          return tA - tB;
        });
      case 'expired_first':
        return filtered.sort((a, b) => {
          const expA = a.subscription_expires_at ? new Date(a.subscription_expires_at).getTime() < Date.now() : true;
          const expB = b.subscription_expires_at ? new Date(b.subscription_expires_at).getTime() < Date.now() : true;
          return (expB ? 1 : 0) - (expA ? 1 : 0);
        });
      case 'active_first':
        return filtered.sort((a, b) => {
          const expA = a.subscription_expires_at ? new Date(a.subscription_expires_at).getTime() >= Date.now() : false;
          const expB = b.subscription_expires_at ? new Date(b.subscription_expires_at).getTime() >= Date.now() : false;
          return (expB ? 1 : 0) - (expA ? 1 : 0);
        });
      case 'newest':
      default:
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  };

  const getSubStatus = (expiresAt?: string) => {
    if (!expiresAt) return { label: 'EXPIRED', color: 'bg-red-100 text-red-700 border-red-200' };
    const expires = new Date(expiresAt).getTime();
    const now = Date.now();
    const diffDays = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return { label: 'EXPIRED', color: 'bg-red-100 text-red-700 border-red-200' };
    if (diffDays <= 5) return { label: `${diffDays} DAYS LEFT`, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: `ACTIVE (${diffDays}D)`, color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatBytes = (bytes: number) => formatSize(bytes);

  const formatGBHours = (gbHours: number) => {
    return `${gbHours.toFixed(2)} GB-Hrs`;
  };

  // Platform Reviews State
  const [platformReviews, setPlatformReviews] = useState<PlatformReview[]>([]);
  const [loadingPlatformReviews, setLoadingPlatformReviews] = useState(false);

  const fetchPlatformReviews = async () => {
    setLoadingPlatformReviews(true);
    let list: PlatformReview[] = [];

    try {
      const { data, error } = await supabase
        .from('platform_reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data;
      }
    } catch (e) {}

    // Local storage fallback
    if (list.length === 0 && typeof window !== 'undefined') {
      const stored = localStorage.getItem('printdedo_platform_reviews');
      if (stored) {
        try { list = JSON.parse(stored); } catch (e) {}
      }
    }

    setPlatformReviews(list);
    setLoadingPlatformReviews(false);
  };

  const handleDeletePlatformReview = async (id: string) => {
    try {
      const { deletePlatformReviewServer } = await import('@/lib/adminActions');
      const res = await deletePlatformReviewServer(id, { adminEmail, adminPassword });
      if (!res.success) {
        toast.error(res.error || 'Failed to delete review');
        return;
      }
    } catch (e: any) {
      toast.error(e.message || 'Error deleting review');
      return;
    }

    const updated = platformReviews.filter(r => r.id !== id);
    setPlatformReviews(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('printdedo_platform_reviews', JSON.stringify(updated));
    }
  };

  const handleReplyPlatformReview = async (id: string, reply: string) => {
    try {
      const { replyPlatformReviewServer } = await import('@/lib/adminActions');
      const res = await replyPlatformReviewServer(id, reply, { adminEmail, adminPassword });
      if (!res.success) {
        toast.error(res.error || 'Failed to post reply');
        return;
      }
    } catch (e: any) {
      toast.error(e.message || 'Error posting reply');
      return;
    }

    const updated = platformReviews.map(r => r.id === id ? { ...r, reply } : r);
    setPlatformReviews(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('printdedo_platform_reviews', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchShops();
      fetchPlans();
      fetchAdminMessages();
      fetchPlatformReviews();
    }
  }, [isAdminAuthenticated]);

  return {
    isAdminAuthenticated,
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    loginError,
    handleAdminLogin,
    handleAdminLogout,
    activeView,
    setActiveView,
    shops,
    plans,
    loadingShops,
    loadingPlans,
    storageMetrics,
    totalBandwidth,
    currentMemory,
    gbHoursUsed,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    getFilteredShops,
    getSubStatus,
    formatSize,
    formatBytes,
    formatGBHours,
    email,
    setEmail,
    password,
    setPassword,
    shopName,
    setShopName,
    phone,
    setPhone,
    selectedPlan,
    setSelectedPlan,
    customMonths,
    setCustomMonths,
    registerLoading,
    registerSuccess,
    registerError,
    handleRegisterShop,
    showCreatePlan,
    setShowCreatePlan,
    newPlanId,
    setNewPlanId,
    newPlanName,
    setNewPlanName,
    newPlanPrice,
    setNewPlanPrice,
    newPlanDuration,
    setNewPlanDuration,
    newPlanDesc,
    setNewPlanDesc,
    createPlanLoading,
    handleCreatePlan,
    editingPlanId,
    setEditingPlanId,
    editPlanName,
    setEditPlanName,
    editPlanPrice,
    setEditPlanPrice,
    editPlanDuration,
    setEditPlanDuration,
    editPlanDesc,
    setEditPlanDesc,
    planSaveLoading,
    startEditPlan,
    handleUpdatePlan,
    planToDelete,
    setPlanToDelete,
    isDeletingPlan,
    handleDeletePlanConfirm,
    adminMessages,
    loadingMessages,
    fetchAdminMessages,
    handleDeleteAdminMessage,
    platformReviews,
    loadingPlatformReviews,
    fetchPlatformReviews,
    handleDeletePlatformReview,
    handleReplyPlatformReview,
    shopToDelete,
    setShopToDelete,
    isDeletingShop,
    handleDeleteShopConfirm,
    activeRenewalShop,
    setActiveRenewalShop,
    renewPlan,
    setRenewPlan,
    renewCustomMonths,
    setRenewCustomMonths,
    isRenewing,
    handleRenewShop,
    editingShopModal,
    setEditingShopModal,
    editShopName,
    setEditShopName,
    editShopPhone,
    setEditShopPhone,
    editShopAlternatePhone,
    setEditShopAlternatePhone,
    editShopUpi,
    setEditShopUpi,
    isSavingShopDetails,
    openEditShopModal,
    closeEditShopModal,
    handleSaveShopDetails,
    fetchShops,
    fetchPlans,
    isAdminSidebarOpen,
    setIsAdminSidebarOpen,
    unreadMessagesCount,
  };
}
