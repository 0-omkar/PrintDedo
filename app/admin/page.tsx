'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { 
  Shield, UserPlus, Database, RefreshCw, LogOut, Loader2, HardDrive, 
  Edit3, Save, CreditCard, Search, ArrowUpDown, Calendar, Plus, 
  Activity, Clock, Cpu, BarChart3, Wifi, Trash2, ArrowLeft, ChevronRight, AlertTriangle, Mail 
} from 'lucide-react';

const DEFAULT_PLANS = [
  { id: 'free_trial', name: 'Free Trial', duration_months: 1, price: 0, description: '1 Month trial for new shops (Free)' },
  { id: 'quarterly', name: 'Quarterly', duration_months: 3, price: 1500, description: '3 Months standard subscription (500₹/mo)' },
  { id: 'half_yearly', name: 'Half Yearly', duration_months: 6, price: 2700, description: '6 Months cost-effective subscription (450₹/mo)' },
  { id: 'yearly', name: 'Yearly', duration_months: 12, price: 4800, description: '12 Months premium subscription (400₹/mo)' }
];

export default function AdminPage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Screen View state ('overview' | 'register' | 'audit' | 'plans' | 'messages')
  const [activeView, setActiveView] = useState<'overview' | 'register' | 'audit' | 'plans' | 'messages'>('overview');

  // Register shop owner states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('free_trial');
  const [customMonths, setCustomMonths] = useState('1');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Search & Sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Shop lists and storage metrics
  const [shops, setShops] = useState<any[]>([]);
  const [loadingShops, setLoadingShops] = useState(false);
  const [storageMetrics, setStorageMetrics] = useState<Record<string, { current: number; daily: number }>>({});

  // System usage metrics (Supabase Bandwidth & Memory)
  const [totalBandwidth, setTotalBandwidth] = useState<number>(0);
  const [currentMemory, setCurrentMemory] = useState<number>(0);
  const [gbHoursUsed, setGbHoursUsed] = useState<number>(0);

  // Subscription Plans state
  const [plans, setPlans] = useState<any[]>(DEFAULT_PLANS);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanDuration, setEditPlanDuration] = useState('');
  const [editPlanDesc, setEditPlanDesc] = useState('');
  const [planSaveLoading, setPlanSaveLoading] = useState(false);

  // Create Plan state
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlanId, setNewPlanId] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanPrice, setNewPlanPrice] = useState('');
  const [newPlanDuration, setNewPlanDuration] = useState('');
  const [newPlanDesc, setNewPlanDesc] = useState('');
  const [createPlanLoading, setCreatePlanLoading] = useState(false);

  // Deletion Modal States
  const [shopToDelete, setShopToDelete] = useState<any | null>(null);
  const [isDeletingShop, setIsDeletingShop] = useState(false);

  // Admin Messages / Contact Inbox state
  const [adminMessages, setAdminMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [planToDelete, setPlanToDelete] = useState<any | null>(null);
  const [isDeletingPlan, setIsDeletingPlan] = useState(false);

  // Renewal Modal state
  const [activeRenewalShop, setActiveRenewalShop] = useState<any | null>(null);
  const [renewPlan, setRenewPlan] = useState('free_trial');
  const [renewCustomMonths, setRenewCustomMonths] = useState('1');
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = sessionStorage.getItem('xeroxflow_admin_auth') === 'true';
      if (isAuth) {
        setIsAdminAuthenticated(true);
        fetchShops();
        fetchPlans();
        fetchAdminMessages();
      }
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const validEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@xeroxflow.com';
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

    if (adminEmail.trim().toLowerCase() === validEmail.toLowerCase() && adminPassword === validPassword) {
      sessionStorage.setItem('xeroxflow_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      fetchShops();
      fetchPlans();
      fetchAdminMessages();
    } else {
      setLoginError('Invalid Administrator credentials.');
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('xeroxflow_admin_auth');
    setIsAdminAuthenticated(false);
  };

  const fetchShops = async () => {
    setLoadingShops(true);
    try {
      const { data, error } = await supabase
        .from('shops')
        .select('*');

      if (error) throw error;
      if (data) {
        setShops(data);
        calculateStorageMetrics(data);
      }
    } catch (err: any) {
      console.error('Failed to load shops:', err);
    } finally {
      setLoadingShops(false);
    }
  };

  const fetchPlans = async () => {
    setLoadingPlans(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setPlans(data);
      } else {
        setPlans(DEFAULT_PLANS);
      }
    } catch (e) {
      console.error('Failed to fetch plans:', e);
      setPlans(DEFAULT_PLANS);
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchAdminMessages = async () => {
    setLoadingMessages(true);
    let dbMsgs: any[] = [];
    try {
      const { data, error } = await supabase
        .from('admin_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        dbMsgs = data;
      }
    } catch (e) {}

    let localMsgs: any[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xeroxflow_admin_messages');
      if (stored) {
        try { localMsgs = JSON.parse(stored); } catch (e) {}
      }
    }

    const combined = [...dbMsgs];
    localMsgs.forEach(lm => {
      if (!combined.some(dm => dm.id === lm.id || (dm.name === lm.name && dm.message === lm.message))) {
        combined.push(lm);
      }
    });

    setAdminMessages(combined);
    setLoadingMessages(false);
  };

  const handleDeleteAdminMessage = async (msgId: string) => {
    try {
      await supabase.from('admin_messages').delete().eq('id', msgId);
    } catch (e) {}

    const updated = adminMessages.filter(m => m.id !== msgId);
    setAdminMessages(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('xeroxflow_admin_messages', JSON.stringify(updated));
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatGBHours = (gbHours: number) => {
    if (!gbHours || gbHours === 0) return '0.00 GB-Hrs';
    if (gbHours < 0.01 && gbHours > 0) return '< 0.01 GB-Hrs';
    return `${gbHours.toFixed(2)} GB-Hrs`;
  };

  const calculateStorageMetrics = async (shopList: any[]) => {
    const metrics: Record<string, { current: number; daily: number }> = {};

    const storedLogs = localStorage.getItem('xeroxflow_storage_logs');
    let logs: any[] = [];
    if (storedLogs) {
      try {
        logs = JSON.parse(storedLogs);
      } catch (e) {}
    }
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const now = Date.now();

    let accumulatedCurrentBytes = 0;
    let accumulatedGbHours = 0;

    for (const shop of shopList) {
      let currentBytes = 0;
      try {
        const { data: files } = await supabase.storage
          .from('xerox-files')
          .list(shop.id);
        
        if (files) {
          currentBytes = files.reduce((sum, file) => {
            const size = file.metadata?.size || 0;
            const createdAt = file.created_at ? new Date(file.created_at).getTime() : now - (24 * 3600 * 1000);
            const hoursStored = Math.max(1, (now - createdAt) / (1000 * 60 * 60));
            const fileGb = size / (1024 * 1024 * 1024);
            accumulatedGbHours += fileGb * hoursStored;
            return sum + size;
          }, 0);
        }
      } catch (e) {
        console.error(`Failed to list files for shop ${shop.id}:`, e);
      }

      const shopLogs = logs.filter(
        (log) => log.shopId === shop.id && log.timestamp >= twentyFourHoursAgo
      );
      const dailyBytes = shopLogs.reduce((sum, log) => sum + (log.size || 0), 0);

      metrics[shop.id] = {
        current: currentBytes,
        daily: dailyBytes
      };

      accumulatedCurrentBytes += currentBytes;
    }

    const totalLogBytes = logs.reduce((sum, log) => sum + (log.size || 0), 0);
    const computedBandwidth = accumulatedCurrentBytes + (totalLogBytes * 2);

    logs.forEach(log => {
      const hours = Math.max(1, (now - log.timestamp) / (1000 * 60 * 60));
      const logGb = (log.size || 0) / (1024 * 1024 * 1024);
      accumulatedGbHours += logGb * hours;
    });

    setStorageMetrics(metrics);
    setCurrentMemory(accumulatedCurrentBytes);
    setTotalBandwidth(computedBandwidth);
    setGbHoursUsed(accumulatedGbHours);
  };

  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      let months = 1;
      let planName = 'Free Trial';
      if (selectedPlan === 'custom') {
        months = parseInt(customMonths) || 1;
        planName = 'Custom Plan';
      } else {
        const matchingPlan = plans.find(p => p.id === selectedPlan);
        if (matchingPlan) {
          months = matchingPlan.duration_months;
          planName = matchingPlan.name;
        }
      }

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            store_name: shopName
          }
        }
      });

      if (error) throw error;

      await supabase.auth.signOut();

      if (data.user) {
        const { error: insertError } = await supabase
          .from('shops')
          .insert({
            id: data.user.id,
            store_name: shopName,
            pricing_bw: 2,
            pricing_bw_double: 3,
            pricing_color: 5,
            pricing_color_double: 8,
            subscription_expires_at: expiryDate.toISOString(),
            subscription_plan_name: planName
          });

        if (insertError) {
          await supabase
            .from('shops')
            .update({
              subscription_expires_at: expiryDate.toISOString(),
              subscription_plan_name: planName
            })
            .eq('id', data.user.id);
        }
      }

      setRegisterSuccess(`Shop "${shopName}" registered successfully with ${planName} expiring on ${expiryDate.toLocaleDateString()}!`);
      setEmail('');
      setPassword('');
      setShopName('');
      setSelectedPlan('free_trial');
      setCustomMonths('1');
      fetchShops();
    } catch (err: any) {
      setRegisterError(err.message || 'Failed to register shop owner.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeleteShopConfirm = async () => {
    if (!shopToDelete) return;
    setIsDeletingShop(true);

    try {
      // 1. Delete associated orders for this shop first (prevents foreign key constraint errors)
      try {
        await supabase.from('orders').delete().eq('shop_id', shopToDelete.id);
      } catch (e) {
        console.error('Error deleting shop orders:', e);
      }

      // 2. Attempt to delete files in storage bucket
      try {
        const { data: files } = await supabase.storage.from('xerox-files').list(shopToDelete.id);
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${shopToDelete.id}/${f.name}`);
          await supabase.storage.from('xerox-files').remove(filePaths);
        }
      } catch (e) {
        console.error('Error clearing shop files:', e);
      }

      // 3. Delete row from shops table
      const { error } = await supabase.from('shops').delete().eq('id', shopToDelete.id);
      if (error) {
        console.error('Failed to delete shop from database:', error);
        alert(`Database Notice: ${error.message || 'Row-level security policy or permission error.'}\n\nRemoving shop from current view.`);
      }

      setShops(prev => prev.filter(s => s.id !== shopToDelete.id));
      setShopToDelete(null);
      fetchShops();
    } catch (err: any) {
      alert(err.message || 'Failed to delete shop.');
    } finally {
      setIsDeletingShop(false);
    }
  };

  const handleDeletePlanConfirm = async () => {
    if (!planToDelete) return;
    setIsDeletingPlan(true);

    try {
      const { error } = await supabase.from('plans').delete().eq('id', planToDelete.id);
      if (error) {
        console.error('Error deleting plan from database:', error);
      }
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      setPlanToDelete(null);
      fetchPlans();
    } catch (err: any) {
      setPlans(prev => prev.filter(p => p.id !== planToDelete.id));
      setPlanToDelete(null);
    } finally {
      setIsDeletingPlan(false);
    }
  };

  const handleRenewShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRenewalShop) return;

    setIsRenewing(true);
    try {
      let months = 1;
      let planName = 'Free Trial';
      if (renewPlan === 'custom') {
        months = parseInt(renewCustomMonths) || 1;
        planName = 'Custom Plan';
      } else {
        const matchingPlan = plans.find(p => p.id === renewPlan);
        if (matchingPlan) {
          months = matchingPlan.duration_months;
          planName = matchingPlan.name;
        }
      }

      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);

      const { error } = await supabase
        .from('shops')
        .update({
          subscription_expires_at: expiryDate.toISOString(),
          subscription_plan_name: planName
        })
        .eq('id', activeRenewalShop.id);

      if (error) throw error;

      setActiveRenewalShop(null);
      fetchShops();
    } catch (err: any) {
      alert(err.message || 'Failed to renew subscription.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatePlanLoading(true);
    try {
      const price = parseFloat(newPlanPrice);
      const duration = parseInt(newPlanDuration);
      if (!newPlanId || isNaN(price) || isNaN(duration)) {
        alert('Invalid inputs');
        return;
      }

      const { error } = await supabase
        .from('plans')
        .insert({
          id: newPlanId.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase(),
          name: newPlanName,
          price: price,
          duration_months: duration,
          description: newPlanDesc
        });

      if (error) throw error;
      
      setNewPlanId('');
      setNewPlanName('');
      setNewPlanPrice('');
      setNewPlanDuration('');
      setNewPlanDesc('');
      setShowCreatePlan(false);
      fetchPlans();
    } catch (e: any) {
      alert(e.message || 'Failed to create plan.');
    } finally {
      setCreatePlanLoading(false);
    }
  };

  const startEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setEditPlanName(plan.name);
    setEditPlanPrice(plan.price.toString());
    setEditPlanDuration(plan.duration_months.toString());
    setEditPlanDesc(plan.description || '');
  };

  const handleUpdatePlan = async (id: string) => {
    setPlanSaveLoading(true);
    try {
      const price = parseFloat(editPlanPrice);
      const duration = parseInt(editPlanDuration);
      if (isNaN(price) || isNaN(duration)) {
        alert('Invalid inputs');
        return;
      }

      const { error } = await supabase
        .from('plans')
        .update({
          name: editPlanName,
          price: price,
          duration_months: duration,
          description: editPlanDesc
        })
        .eq('id', id);

      if (error) throw error;
      setEditingPlanId(null);
      fetchPlans();
    } catch (e: any) {
      alert(e.message || 'Failed to update plan.');
    } finally {
      setPlanSaveLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0.00 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const getSubStatus = (expiresAtStr: string) => {
    if (!expiresAtStr) return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    const expiresAt = new Date(expiresAtStr).getTime();
    const diffDays = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { label: 'Expired', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (diffDays <= 5) {
      return { label: `Ends in ${diffDays}d`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 animate-pulse' };
    } else {
      return { label: `${diffDays} days left`, color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  const getFilteredShops = () => {
    let result = [...shops];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(shop => shop.store_name?.toLowerCase().includes(term));
    }

    result.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return (a.store_name || '').localeCompare(b.store_name || '');
      }

      const aTime = a.subscription_expires_at ? new Date(a.subscription_expires_at).getTime() : 0;
      const bTime = b.subscription_expires_at ? new Date(b.subscription_expires_at).getTime() : 0;

      if (sortBy === 'soonest_expiry') return aTime - bTime;

      if (sortBy === 'expired_first') {
        const aExpired = aTime < Date.now();
        const bExpired = bTime < Date.now();
        if (aExpired && !bExpired) return -1;
        if (!aExpired && bExpired) return 1;
        return aTime - bTime;
      }

      if (sortBy === 'active_first') {
        const aExpired = aTime < Date.now();
        const bExpired = bTime < Date.now();
        if (!aExpired && bExpired) return -1;
        if (aExpired && !bExpired) return 1;
        return bTime - aTime;
      }

      return b.id.localeCompare(a.id);
    });

    return result;
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

        <main className="relative z-10 flex flex-col items-center justify-center w-full max-w-sm">
          <div className="bg-yellow-400 p-4.5 rounded-3xl shadow-sm mb-6 inline-flex items-center justify-center">
            <Shield className="w-10 h-10 text-black" />
          </div>

          <h1 className="text-3xl font-black mb-1 tracking-tight text-slate-950 uppercase text-center">XeroxFlow Admin</h1>
          <p className="text-slate-500 mb-8 text-xs font-bold tracking-widest text-center uppercase">Console Authentication</p>

          <form onSubmit={handleAdminLogin} className="flex flex-col space-y-4.5 w-full bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-left">
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold text-center">{loginError}</div>}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Email</label>
              <input 
                type="email" 
                placeholder="admin@example.com" 
                value={adminEmail} 
                onChange={(e) => setAdminEmail(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={adminPassword} 
                onChange={(e) => setAdminPassword(e.target.value)} 
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                required
              />
            </div>

            <button 
              type="submit" 
              className="bg-yellow-400 text-black font-bold p-3.5 rounded-xl mt-2 hover:bg-yellow-500 transition-colors flex justify-center items-center cursor-pointer shadow-sm text-sm border-none"
            >
              Authenticate Admin
            </button>
          </form>
          
          <div className="mt-8">
            <Link href="/" className="text-sm font-bold text-slate-400 hover:text-slate-650 transition-colors">← Back to Home</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100/50 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50/50 blur-3xl opacity-60 pointer-events-none" />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col space-y-8">
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white border border-slate-200 rounded-3xl p-6 shadow-sm gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-yellow-400 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Admin Console</h1>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">XeroxFlow Core System Audit</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Screen Navigation Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center space-x-1 border border-slate-200/60 text-xs font-bold">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'overview' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('plans')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'plans' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Manage Subs
              </button>
              <button
                onClick={() => setActiveView('register')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'register' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register Shop
              </button>
              <button
                onClick={() => setActiveView('audit')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeView === 'audit' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Audit Shops
              </button>
              <button
                onClick={() => {
                  setActiveView('messages');
                  fetchAdminMessages();
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                  activeView === 'messages' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Inbox</span>
                {adminMessages.length > 0 && (
                  <span className="bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {adminMessages.length}
                  </span>
                )}
              </button>
            </div>

            <button 
              onClick={() => { fetchShops(); fetchPlans(); }} 
              className="p-2.5 border border-slate-200 hover:bg-slate-50 rounded-2xl transition cursor-pointer text-slate-600 hover:text-yellow-600 border-none bg-white"
              title="Refresh Core Data"
            >
              <RefreshCw className="w-4.5 h-4.5" />
            </button>
            <button 
              onClick={handleAdminLogout} 
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition cursor-pointer border-none text-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* 3 System Usage Metric Cards (Always visible at top of Admin Console) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Supabase Bandwidth</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatBytes(totalBandwidth)}</h3>
              </div>
              <div className="bg-yellow-400/20 text-yellow-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Total Network Transferred</span>
              <span className="bg-yellow-50 text-yellow-700 font-bold px-2 py-0.5 rounded-md border border-yellow-200/60">Live Usage</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Current Memory Used</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatBytes(currentMemory)}</h3>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform border border-blue-100">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Active File Footprint</span>
              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200/60">{shops.length} Shops Active</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Memory (GB-Hrs)</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{formatGBHours(gbHoursUsed)}</h3>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl group-hover:scale-110 transition-transform border border-purple-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Accumulated GB × Time</span>
              <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200/60">Cloud Metric</span>
            </div>
          </div>
        </div>

        {/* VIEW 1: OVERVIEW DASHBOARD (Main view with 3 Navigation Cards) */}
        {activeView === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* 3 Primary Management Action Cards */}
            <div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Management Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Manage Subscriptions Action Card */}
                <button
                  onClick={() => setActiveView('plans')}
                  className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-400 text-black p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                        {plans.length} Plans Active
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                      Manage Subs
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Configure subscription pricing tiers, create new plans, edit durations, or remove obsolete plans.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                    <span>Open Plans Editor</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 2. Register Shop Action Card */}
                <button
                  onClick={() => setActiveView('register')}
                  className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-slate-900 text-yellow-400 p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                        Onboard Shop
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                      Register Shop
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Create new Xerox shop owner accounts, generate login credentials, and assign initial subscription periods.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                    <span>Open Shop Registration</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* 3. Audit Shops Action Card */}
                <button
                  onClick={() => setActiveView('audit')}
                  className="bg-white border border-slate-200 hover:border-yellow-400 p-7 rounded-3xl shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer border-none"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-600 text-white p-3.5 rounded-2xl group-hover:scale-110 transition-transform">
                        <Database className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        {shops.length} Shops Registered
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight mb-2 group-hover:text-yellow-600 transition-colors">
                      Audit Shops
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Inspect active shops, monitor real-time storage & daily usage, extend subscriptions, or delete shop accounts.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-yellow-600">
                    <span>Open Shop Audit List</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

              </div>
            </div>

            {/* Quick Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Registered Shops Preview */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-950 uppercase text-sm">Recent Registered Shops</h3>
                  <button 
                    onClick={() => setActiveView('audit')}
                    className="text-xs font-bold text-yellow-600 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    View All ({shops.length}) →
                  </button>
                </div>
                <div className="space-y-3">
                  {shops.slice(0, 4).map(shop => (
                    <div key={shop.id} className="p-3.5 border border-slate-100 bg-slate-50/60 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 uppercase">{shop.store_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{shop.id}</div>
                      </div>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                        {shop.subscription_plan_name || 'Free Trial'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscription Plans Overview Preview */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-950 uppercase text-sm">Active Subscription Tiers</h3>
                  <button 
                    onClick={() => setActiveView('plans')}
                    className="text-xs font-bold text-yellow-600 hover:underline border-none bg-transparent cursor-pointer"
                  >
                    Manage Plans ({plans.length}) →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {plans.map(p => (
                    <div key={p.id} className="p-3.5 border border-slate-100 bg-slate-50/60 rounded-2xl">
                      <div className="font-extrabold text-xs text-slate-900 uppercase">{p.name}</div>
                      <div className="text-yellow-600 font-black text-sm">₹{p.price}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{p.duration_months} Month(s)</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: REGISTER SHOP SCREEN */}
        {activeView === 'register' && (
          <div className="space-y-6 animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Overview</span>
            </button>

            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100">
                <div className="bg-yellow-400 p-3 rounded-2xl text-black">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Register New Xerox Shop</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Onboard shop owner & provision initial subscription</p>
                </div>
              </div>

              <form onSubmit={handleRegisterShop} className="space-y-5">
                {registerSuccess && (
                  <div className="bg-green-50 text-green-700 p-4 rounded-2xl text-xs font-bold text-center border border-green-200">
                    {registerSuccess}
                  </div>
                )}
                {registerError && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-semibold text-center border border-red-200">
                    {registerError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Store / Shop Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ambika Copies & Prints" 
                    value={shopName} 
                    onChange={(e) => setShopName(e.target.value)} 
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Owner Email</label>
                    <input 
                      type="email" 
                      placeholder="owner@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                    <input 
                      type="password" 
                      placeholder="Password (min 6 chars)" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Assign Subscription Plan</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white cursor-pointer"
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.duration_months} Month{p.duration_months > 1 ? 's' : ''}) - ₹{p.price}
                      </option>
                    ))}
                    <option value="custom">Custom Months Period</option>
                  </select>
                </div>

                {selectedPlan === 'custom' && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Custom Duration (Months)</label>
                    <input 
                      type="number" 
                      min="-120"
                      max="120"
                      placeholder="e.g. 6" 
                      value={customMonths} 
                      onChange={(e) => setCustomMonths(e.target.value)} 
                      className="w-full p-3.5 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                      required
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={registerLoading}
                  className="w-full bg-yellow-400 text-black font-bold p-4 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer shadow-sm text-sm border-none mt-4"
                >
                  {registerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & Register Print Shop'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW 3: AUDIT SHOPS SCREEN */}
        {activeView === 'audit' && (
          <div className="space-y-6 animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Overview</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-3 rounded-2xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Active Shops Audit</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Storage consumption, subscriptions & shop management</p>
                  </div>
                </div>

                <span className="text-xs bg-slate-100 px-4 py-1.5 rounded-full font-bold text-slate-700 w-fit border border-slate-200">
                  {getFilteredShops().length} Shops Total
                </span>
              </div>

              {/* Search & Sort Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search shop by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white bg-slate-50"
                  />
                </div>

                <div className="relative">
                  <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer bg-slate-50"
                  >
                    <option value="newest">Sort by: Newest Registered</option>
                    <option value="alphabetical">Sort by: Alphabetical (A-Z)</option>
                    <option value="soonest_expiry">Sort by: Expiry (Soonest First)</option>
                    <option value="expired_first">Sort by: Expired Shops First</option>
                    <option value="active_first">Sort by: Active Shops First</option>
                  </select>
                </div>
              </div>

              {loadingShops ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gathering Storage Metrics...</p>
                </div>
              ) : getFilteredShops().length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                  <p className="text-slate-400 text-sm italic">No matching registered shops found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredShops().map((shop) => {
                    const shopMetrics = storageMetrics[shop.id] || { current: 0, daily: 0 };
                    const sub = getSubStatus(shop.subscription_expires_at);
                    return (
                      <div 
                        key={shop.id} 
                        className="p-6 border border-slate-200 rounded-2xl hover:border-yellow-400 transition shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white"
                      >
                        <div className="space-y-1.5 flex-1 select-all">
                          <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                            <h3 className="text-lg font-black text-slate-950 uppercase">{shop.store_name}</h3>
                            
                            <button
                              onClick={() => {
                                setActiveRenewalShop(shop);
                                setRenewPlan('free_trial');
                                setRenewCustomMonths('1');
                              }}
                              className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border cursor-pointer hover:scale-105 transition-all text-left ${sub.color}`}
                              title="Click to view details or renew subscription"
                            >
                              {sub.label}
                            </button>
                          </div>
                          
                          <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider">{shop.id}</p>
                          
                          <div className="text-xs text-slate-500 font-semibold pt-1">
                            Plan: <span className="text-slate-900 font-bold">{shop.subscription_plan_name || 'Free Trial'}</span> 
                            {shop.subscription_expires_at && ` (Expires: ${new Date(shop.subscription_expires_at).toLocaleDateString()})`}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
                            <span className="bg-slate-100 px-2.5 py-0.5 rounded text-[11px]">UPI: {shop.upi_id || 'Not Set'}</span>
                            <span>•</span>
                            <span>B&W: ₹{shop.pricing_bw}/₹{shop.pricing_bw_double}</span>
                            <span>•</span>
                            <span>Color: ₹{shop.pricing_color}/₹{shop.pricing_color_double}</span>
                          </div>
                        </div>

                        {/* Right Panel: Storage Metrics & Action Buttons */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl shrink-0">
                            <HardDrive className="w-6 h-6 text-slate-400" />
                            <div className="text-left space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CURRENT:</span>
                                <span className="text-xs font-black text-slate-900">{formatSize(shopMetrics.current)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">LAST 24H:</span>
                                <span className="text-xs font-black text-yellow-600">{formatSize(shopMetrics.daily)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Shop Button */}
                          <button
                            onClick={() => setShopToDelete(shop)}
                            className="p-3 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-2xl transition cursor-pointer border border-red-100 bg-white"
                            title="Delete Shop"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: MANAGE SUBSCRIPTION PLANS SCREEN */}
        {activeView === 'plans' && (
          <div className="space-y-6 animate-fade-in">
            <button
              onClick={() => setActiveView('overview')}
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 border-none bg-transparent cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin Overview</span>
            </button>

            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 text-black p-3 rounded-2xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Manage Subscription Plans</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Add, edit, or delete subscription tiers</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowCreatePlan(!showCreatePlan)}
                  className="bg-yellow-400 text-black font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-yellow-500 transition-all flex items-center space-x-1.5 border-none cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{showCreatePlan ? 'Close Creator' : 'Create New Plan'}</span>
                </button>
              </div>

              {/* Create New Plan Form */}
              {showCreatePlan && (
                <form onSubmit={handleCreatePlan} className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
                  <div className="space-y-4 md:col-span-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unique Plan ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. pro_annual" 
                        value={newPlanId}
                        onChange={(e) => setNewPlanId(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Pro Annual Tier" 
                        value={newPlanName}
                        onChange={(e) => setNewPlanName(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₹)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 3500" 
                        value={newPlanPrice}
                        onChange={(e) => setNewPlanPrice(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (Months)</label>
                      <input 
                        type="number" 
                        placeholder="e.g. 12" 
                        value={newPlanDuration}
                        onChange={(e) => setNewPlanDuration(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-1 flex flex-col justify-between">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                      <textarea 
                        placeholder="Enter plan details..." 
                        value={newPlanDesc}
                        onChange={(e) => setNewPlanDesc(e.target.value)}
                        className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white h-24 resize-none" 
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={createPlanLoading}
                      className="bg-yellow-400 text-black font-bold p-3.5 rounded-xl text-xs hover:bg-yellow-500 transition-all border-none cursor-pointer flex justify-center items-center shadow-sm"
                    >
                      {createPlanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Create Plan'}
                    </button>
                  </div>
                </form>
              )}

              {loadingPlans ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-7 h-7 text-yellow-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan) => {
                    const isEditing = editingPlanId === plan.id;
                    return (
                      <div 
                        key={plan.id} 
                        className="border border-slate-200 p-5 rounded-2xl bg-slate-50 flex flex-col justify-between hover:border-yellow-400 transition"
                      >
                        {isEditing ? (
                          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Plan Name</label>
                                <input 
                                  type="text" 
                                  value={editPlanName} 
                                  onChange={(e) => setEditPlanName(e.target.value)} 
                                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold bg-white" 
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Price (₹)</label>
                                  <input 
                                    type="number" 
                                    value={editPlanPrice} 
                                    onChange={(e) => setEditPlanPrice(e.target.value)} 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold bg-white" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Months</label>
                                  <input 
                                    type="number" 
                                    value={editPlanDuration} 
                                    onChange={(e) => setEditPlanDuration(e.target.value)} 
                                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold bg-white" 
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Description</label>
                                <textarea 
                                  value={editPlanDesc} 
                                  onChange={(e) => setEditPlanDesc(e.target.value)} 
                                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold bg-white h-16 resize-none" 
                                />
                              </div>
                            </div>

                            <div className="flex space-x-2 pt-2">
                              <button 
                                onClick={() => handleUpdatePlan(plan.id)}
                                disabled={planSaveLoading}
                                className="flex-1 bg-yellow-400 text-black font-bold p-2 rounded-xl text-xs hover:bg-yellow-500 transition flex justify-center items-center cursor-pointer border-none"
                              >
                                <Save className="w-3.5 h-3.5 mr-1" />
                                <span>Save</span>
                              </button>
                              <button 
                                onClick={() => setEditingPlanId(null)}
                                className="flex-1 bg-slate-200 text-slate-700 font-bold p-2 rounded-xl text-xs hover:bg-slate-300 transition flex justify-center items-center cursor-pointer border-none"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start">
                                <h3 className="font-extrabold text-slate-950 uppercase text-sm tracking-tight">{plan.name}</h3>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-black">
                                  ₹{plan.price}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                                Duration: {plan.duration_months} Month{plan.duration_months > 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-slate-500 mt-2 font-medium">
                                {plan.description || 'No description provided.'}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => startEditPlan(plan)}
                                className="flex-1 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition flex justify-center items-center cursor-pointer bg-white"
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                                <span>Edit</span>
                              </button>
                              
                              <button 
                                onClick={() => setPlanToDelete(plan)}
                                className="p-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl transition cursor-pointer bg-white"
                                title="Delete Plan"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 5: Contact Messages Inbox */}
        {activeView === 'messages' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Contact Admin Inbox</h2>
                <p className="text-xs text-slate-500 font-medium">Direct messages submitted by users & shop owners</p>
              </div>

              <button
                onClick={fetchAdminMessages}
                className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer"
              >
                {loadingMessages ? 'Loading...' : 'Refresh Inbox'}
              </button>
            </div>

            {adminMessages.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-16 text-center shadow-xs">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No incoming messages</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Direct messages sent via Contact Admin will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {adminMessages.map(msg => (
                  <div key={msg.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-950 text-base">{msg.name}</h4>
                        <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200 mt-1 inline-block">
                          Contact: {msg.contact_info}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium leading-relaxed">
                      "{msg.message}"
                    </p>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteAdminMessage(msg.id)}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition border border-red-100 flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Message</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* POPUP MODAL 1: Delete Shop Confirmation */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-5 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-3 border border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Delete Xerox Shop?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to permanently delete <strong className="text-slate-900">{shopToDelete.store_name}</strong>?
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">
                This action cannot be undone. All shop settings and uploaded files will be permanently erased.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleDeleteShopConfirm}
                disabled={isDeletingShop}
                className="flex-1 bg-red-600 text-white font-bold p-3.5 rounded-xl text-xs hover:bg-red-700 transition flex justify-center items-center cursor-pointer border-none shadow-sm"
              >
                {isDeletingShop ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Shop'}
              </button>
              <button
                type="button"
                onClick={() => setShopToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: Delete Plan Confirmation */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-5 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-red-100 p-4 rounded-full text-red-600 mb-3 border border-red-200">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Delete Subscription Plan?</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Are you sure you want to delete the plan <strong className="text-slate-900">{planToDelete.name}</strong>?
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={handleDeletePlanConfirm}
                disabled={isDeletingPlan}
                className="flex-1 bg-red-600 text-white font-bold p-3.5 rounded-xl text-xs hover:bg-red-700 transition flex justify-center items-center cursor-pointer border-none shadow-sm"
              >
                {isDeletingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Delete Plan'}
              </button>
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition border-none cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 3: Subscription Renewal Modal */}
      {activeRenewalShop && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 shadow-xl w-full max-w-sm text-center space-y-6 animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-4 rounded-full text-yellow-600 mb-3 border border-yellow-200">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">Renew Subscription</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {activeRenewalShop.store_name}
              </p>
            </div>

            <form onSubmit={handleRenewShop} className="space-y-4 text-left">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Expiry Status</span>
                <div className="text-xs font-bold text-slate-800">
                  Plan: {activeRenewalShop.subscription_plan_name || 'Free Trial'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Date: {activeRenewalShop.subscription_expires_at ? new Date(activeRenewalShop.subscription_expires_at).toLocaleString() : 'Expired'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Plan / Extension Term</label>
                <select
                  value={renewPlan}
                  onChange={(e) => setRenewPlan(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white cursor-pointer"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.duration_months} Month{p.duration_months > 1 ? 's' : ''})
                    </option>
                  ))}
                  <option value="custom">Custom Months Period</option>
                </select>
              </div>

              {renewPlan === 'custom' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Custom Months Input (Use negative/0 to expire)</label>
                  <input 
                    type="number" 
                    min="-120"
                    max="120"
                    placeholder="e.g. -1 for expired, 12 for yearly" 
                    value={renewCustomMonths} 
                    onChange={(e) => setRenewCustomMonths(e.target.value)} 
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                    required
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button 
                  type="submit"
                  disabled={isRenewing}
                  className="flex-1 bg-yellow-400 text-black font-bold p-3.5 rounded-xl text-xs hover:bg-yellow-500 transition-all border-none cursor-pointer flex justify-center items-center shadow-sm"
                >
                  {isRenewing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Renewal'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveRenewalShop(null)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold p-3.5 rounded-xl text-xs hover:bg-slate-200 transition-all border-none cursor-pointer flex justify-center items-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
