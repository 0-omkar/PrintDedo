'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Shield, UserPlus, Database, RefreshCw, LogOut, Loader2, HardDrive, Edit3, Save, CreditCard, Search, ArrowUpDown, Calendar, Plus } from 'lucide-react';

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
      }
    }
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (adminEmail === 'admin@xeroxflow.com' && adminPassword === 'admin123') {
      sessionStorage.setItem('xeroxflow_admin_auth', 'true');
      setIsAdminAuthenticated(true);
      fetchShops();
      fetchPlans();
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

    for (const shop of shopList) {
      let currentBytes = 0;
      try {
        const { data: files, error } = await supabase.storage
          .from('xerox-files')
          .list(shop.id);
        
        if (files) {
          currentBytes = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
        }
      } catch (e) {
        console.error(`Failed to list files for shop ${shop.id}:`, e);
      }

      const shopLogs = logs.filter(
        (log) => log.shopId === shop.id && log.timestamp >= twentyFourHoursAgo
      );
      const dailyBytes = shopLogs.reduce((sum, log) => sum + log.size, 0);

      metrics[shop.id] = {
        current: currentBytes,
        daily: dailyBytes
      };
    }

    setStorageMetrics(metrics);
  };

  const handleRegisterShop = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);

    try {
      // Calculate Expiry Date & Plan Name
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

      // Sign up the new user
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

      // Immediately log out newly created session
      await supabase.auth.signOut();

      // Insert row into shops table
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

  // Get search and sorted list of active shops
  const getFilteredShops = () => {
    let result = [...shops];
    
    // Filter search name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(shop => shop.store_name?.toLowerCase().includes(term));
    }

    // Sort operations
    result.sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return (a.store_name || '').localeCompare(b.store_name || '');
      }

      const aTime = a.subscription_expires_at ? new Date(a.subscription_expires_at).getTime() : 0;
      const bTime = b.subscription_expires_at ? new Date(b.subscription_expires_at).getTime() : 0;

      if (sortBy === 'soonest_expiry') {
        return aTime - bTime;
      }

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

      // Default 'newest' (ID/Date generated)
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
        <header className="flex justify-between items-center bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="bg-yellow-400 p-3 rounded-2xl">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight uppercase">Admin Console</h1>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">XeroxFlow Core System Audit</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => { fetchShops(); fetchPlans(); }} 
              className="p-3 border border-slate-200 hover:bg-slate-50 rounded-2xl transition cursor-pointer text-slate-600 hover:text-yellow-600 border-none bg-white"
              title="Refresh Core Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleAdminLogout} 
              className="flex items-center space-x-2 px-5 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition cursor-pointer border-none text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Register Shop & Assign Subscription */}
          <section className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm h-fit space-y-6">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
              <UserPlus className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Register Xerox Shop</h2>
            </div>

            <form onSubmit={handleRegisterShop} className="space-y-4">
              {registerSuccess && <div className="bg-green-50 text-green-700 p-3.5 rounded-xl text-xs font-bold text-center">{registerSuccess}</div>}
              {registerError && <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-semibold text-center">{registerError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Store / Shop Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ambika Copies" 
                  value={shopName} 
                  onChange={(e) => setShopName(e.target.value)} 
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Owner Email</label>
                <input 
                  type="email" 
                  placeholder="owner@example.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                <input 
                  type="password" 
                  placeholder="Password (min 6 chars)" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Assign Plan / Term</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
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

               {selectedPlan === 'custom' && (
                <div className="animate-fade-in">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Custom Months Input (Use negative/0 to expire)</label>
                  <input 
                    type="number" 
                    min="-120"
                    max="120"
                    placeholder="e.g. -1 for expired, 12 for yearly" 
                    value={customMonths} 
                    onChange={(e) => setCustomMonths(e.target.value)} 
                    className="w-full p-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-sm font-semibold bg-slate-50 focus:bg-white" 
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={registerLoading}
                className="w-full bg-yellow-400 text-black font-bold p-3.5 rounded-xl hover:bg-yellow-500 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer shadow-sm text-sm border-none"
              >
                {registerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Print Shop'}
              </button>
            </form>
          </section>

          {/* Right Panel: Active Shops list with Search & Sort */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[400px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Active Shops Audit</h2>
              </div>
              <span className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-600 w-fit">
                {getFilteredShops().length} Shops Found
              </span>
            </div>

            {/* Search & Sort Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search shop by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="relative">
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer bg-slate-50"
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
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-3" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Gathering Storage Metrics...</p>
              </div>
            ) : getFilteredShops().length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                <p className="text-slate-405 text-sm italic">No matching registered shops found.</p>
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
                {getFilteredShops().map((shop) => {
                  const shopMetrics = storageMetrics[shop.id] || { current: 0, daily: 0 };
                  const sub = getSubStatus(shop.subscription_expires_at);
                  return (
                    <div 
                      key={shop.id} 
                      className="p-5 border border-slate-200 rounded-2xl hover:border-yellow-350 transition shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 select-all flex-1">
                        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                          <h3 className="text-base font-extrabold text-slate-950 uppercase">{shop.store_name}</h3>
                          
                          {/* Tapable Subscription status tag */}
                          <button
                            onClick={() => {
                              setActiveRenewalShop(shop);
                              setRenewPlan('free_trial');
                              setRenewCustomMonths('1');
                            }}
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border cursor-pointer hover:scale-105 active:scale-95 transition-all text-left ${sub.color}`}
                            title="Click to view details or renew subscription"
                          >
                            {sub.label}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider">{shop.id}</p>
                        
                        <div className="text-[11px] text-slate-500 font-semibold pt-1">
                          Plan: <span className="text-slate-800 font-bold">{shop.subscription_plan_name || 'Free Trial'}</span> 
                          {shop.subscription_expires_at && ` (Expires: ${new Date(shop.subscription_expires_at).toLocaleDateString()})`}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-semibold text-slate-500">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">UPI: {shop.upi_id || 'Not Set'}</span>
                          <span>•</span>
                          <span>B&W: ₹{shop.pricing_bw}/₹{shop.pricing_bw_double}</span>
                          <span>•</span>
                          <span>Color: ₹{shop.pricing_color}/₹{shop.pricing_color_double}</span>
                        </div>
                      </div>

                      {/* Storage Metrics Panel */}
                      <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl shrink-0 w-full sm:w-auto">
                        <HardDrive className="w-6 h-6 text-slate-400" />
                        <div className="text-left space-y-1">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current:</span>
                            <span className="text-xs font-black text-slate-800">{formatSize(shopMetrics.current)}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Last 24h:</span>
                            <span className="text-xs font-black text-yellow-600">{formatSize(shopMetrics.daily)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Bottom Section: Manage Plans */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <CreditCard className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Manage Subscription Plans</h2>
            </div>
            
            <button
              onClick={() => setShowCreatePlan(!showCreatePlan)}
              className="bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-xs hover:bg-yellow-500 transition-all flex items-center space-x-1 border-none cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreatePlan ? 'Close Editor' : 'Create New Plan'}</span>
            </button>
          </div>

          {/* Create New Plan Panel */}
          {showCreatePlan && (
            <form onSubmit={handleCreatePlan} className="bg-slate-50 border border-slate-200/60 p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4.5 animate-fade-in mb-6">
              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Unique Plan ID (no spaces)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. basic_monthly" 
                    value={newPlanId}
                    onChange={(e) => setNewPlanId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Basic Monthly" 
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-1">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={newPlanPrice}
                    onChange={(e) => setNewPlanPrice(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration (Months)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 3" 
                    value={newPlanDuration}
                    onChange={(e) => setNewPlanDuration(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-4 md:col-span-1 flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description / Details</label>
                  <textarea 
                    placeholder="Enter plan details..." 
                    value={newPlanDesc}
                    onChange={(e) => setNewPlanDesc(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold bg-white h-24 resize-none" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={createPlanLoading}
                  className="bg-yellow-400 text-black font-bold p-3 rounded-xl text-xs hover:bg-yellow-500 transition-all border-none cursor-pointer flex justify-center items-center"
                >
                  {createPlanLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Create Plan'}
                </button>
              </div>
            </form>
          )}

          {loadingPlans ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const isEditing = editingPlanId === plan.id;
                return (
                  <div 
                    key={plan.id} 
                    className="border border-slate-200 p-5 rounded-2xl bg-slate-50 flex flex-col justify-between hover:border-yellow-250 transition"
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

                        <button 
                          onClick={() => startEditPlan(plan)}
                          className="w-full border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition flex justify-center items-center cursor-pointer bg-white"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                          <span>Edit Details</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Subscription Renewal Modal */}
      {activeRenewalShop && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-250 rounded-3xl p-6 shadow-xl w-full max-w-sm animate-scale-in text-center space-y-6">
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
              {/* Existing Subscription Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/50 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Expiry Status</span>
                <div className="text-xs font-bold text-slate-800">
                  Plan: {activeRenewalShop.subscription_plan_name || 'Free Trial'}
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Date: {activeRenewalShop.subscription_expires_at ? new Date(activeRenewalShop.subscription_expires_at).toLocaleString() : 'Expired'}
                </div>
              </div>

              {/* Renewal Options */}
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
