'use client';
import { Wifi, HardDrive, Clock } from 'lucide-react';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { AdminHeader } from './components/AdminHeader';
import { ShopsOverviewTab } from './components/ShopsOverviewTab';
import { RegisterShopTab } from './components/RegisterShopTab';
import { PlansManagementTab } from './components/PlansManagementTab';
import { AdminMessagesTab } from './components/AdminMessagesTab';
import { PlatformReviewsTab } from './components/PlatformReviewsTab';
import { AdminModals } from './components/AdminModals';
import { useAdminViewModel } from './viewmodels/useAdminViewModel';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';

export default function AdminPage() {
  const vm = useAdminViewModel();

  if (vm.isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vm.isAdminAuthenticated) {
    return (
      <AdminLoginScreen 
        adminEmail={vm.adminEmail}
        setAdminEmail={vm.setAdminEmail}
        adminPassword={vm.adminPassword}
        setAdminPassword={vm.setAdminPassword}
        loginError={vm.loginError}
        onLogin={vm.handleAdminLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex relative overflow-hidden">
      <BackgroundDecorations />

      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col space-y-8">
        {/* Header Block */}
        <AdminHeader 
          activeView={vm.activeView}
          setActiveView={vm.setActiveView}
          messagesCount={vm.adminMessages.length}
          onRefresh={() => { vm.fetchShops(); vm.fetchPlans(); }}
          onLogout={vm.handleAdminLogout}
        />

        {/* 3 Cloudflare WAS & R2 Storage Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cloudflare R2 Bandwidth</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{vm.formatBytes(vm.totalBandwidth)}</h3>
              </div>
              <div className="bg-amber-400/20 text-amber-600 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Wifi className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Live Network Egress / Ingress</span>
              <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-md border border-amber-200/60">Cloudflare R2</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cloudflare WAS / R2 Storage</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{vm.formatBytes(vm.currentMemory)}</h3>
              </div>
              <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl group-hover:scale-110 transition-transform border border-blue-100">
                <HardDrive className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Active R2 Object Storage</span>
              <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-200/60">{vm.shops.length} Shops Active</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cloudflare Storage (GB-Hrs)</span>
                <h3 className="text-2xl font-black text-slate-950 mt-1.5 tracking-tight">{vm.formatGBHours(vm.gbHoursUsed)}</h3>
              </div>
              <div className="bg-purple-50 text-purple-600 p-3 rounded-2xl group-hover:scale-110 transition-transform border border-purple-100">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Accumulated GB × Time</span>
              <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200/60">R2 Bucket Metric</span>
            </div>
          </div>
        </div>

        {/* View 1 & 3: Overview & Audit Shops Tab */}
        <ShopsOverviewTab 
          activeView={vm.activeView}
          setActiveView={vm.setActiveView}
          shops={vm.shops}
          plans={vm.plans}
          searchTerm={vm.searchTerm}
          setSearchTerm={vm.setSearchTerm}
          sortBy={vm.sortBy}
          setSortBy={vm.setSortBy}
          loadingShops={vm.loadingShops}
          getFilteredShops={vm.getFilteredShops}
          storageMetrics={vm.storageMetrics}
          getSubStatus={vm.getSubStatus}
          formatSize={vm.formatSize}
          setActiveRenewalShop={vm.setActiveRenewalShop}
          setShopToDelete={vm.setShopToDelete}
        />

        {/* View 2: Register Shop Screen */}
        <RegisterShopTab 
          activeView={vm.activeView}
          setActiveView={vm.setActiveView}
          shopName={vm.shopName}
          setShopName={vm.setShopName}
          phone={vm.phone}
          setPhone={vm.setPhone}
          email={vm.email}
          setEmail={vm.setEmail}
          password={vm.password}
          setPassword={vm.setPassword}
          selectedPlan={vm.selectedPlan}
          setSelectedPlan={vm.setSelectedPlan}
          customMonths={vm.customMonths}
          setCustomMonths={vm.setCustomMonths}
          plans={vm.plans}
          registerLoading={vm.registerLoading}
          registerSuccess={vm.registerSuccess}
          registerError={vm.registerError}
          onRegisterSubmit={vm.handleRegisterShop}
        />

        {/* View 4: Manage Subscription Plans Screen */}
        <PlansManagementTab 
          activeView={vm.activeView}
          setActiveView={vm.setActiveView}
          plans={vm.plans}
          loadingPlans={vm.loadingPlans}
          showCreatePlan={vm.showCreatePlan}
          setShowCreatePlan={vm.setShowCreatePlan}
          newPlanId={vm.newPlanId}
          setNewPlanId={vm.setNewPlanId}
          newPlanName={vm.newPlanName}
          setNewPlanName={vm.setNewPlanName}
          newPlanPrice={vm.newPlanPrice}
          setNewPlanPrice={vm.setNewPlanPrice}
          newPlanDuration={vm.newPlanDuration}
          setNewPlanDuration={vm.setNewPlanDuration}
          newPlanDesc={vm.newPlanDesc}
          setNewPlanDesc={vm.setNewPlanDesc}
          createPlanLoading={vm.createPlanLoading}
          onCreatePlanSubmit={vm.handleCreatePlan}
          editingPlanId={vm.editingPlanId}
          setEditingPlanId={vm.setEditingPlanId}
          editPlanName={vm.editPlanName}
          setEditPlanName={vm.setEditPlanName}
          editPlanPrice={vm.editPlanPrice}
          setEditPlanPrice={vm.setEditPlanPrice}
          editPlanDuration={vm.editPlanDuration}
          setEditPlanDuration={vm.setEditPlanDuration}
          editPlanDesc={vm.editPlanDesc}
          setEditPlanDesc={vm.setEditPlanDesc}
          planSaveLoading={vm.planSaveLoading}
          startEditPlan={vm.startEditPlan}
          onUpdatePlan={vm.handleUpdatePlan}
          setPlanToDelete={vm.setPlanToDelete}
        />

        {/* View 5: Contact Messages Inbox */}
        <AdminMessagesTab 
          activeView={vm.activeView}
          adminMessages={vm.adminMessages}
          loadingMessages={vm.loadingMessages}
          onRefreshMessages={vm.fetchAdminMessages}
          onDeleteMessage={vm.handleDeleteAdminMessage}
        />

        {/* View 6: Platform Reviews */}
        {vm.activeView === 'reviews' && (
          <PlatformReviewsTab 
            reviews={vm.platformReviews}
            onDeleteReview={vm.handleDeletePlatformReview}
          />
        )}

      </main>

      {/* Admin Popup Modals */}
      <AdminModals 
        shopToDelete={vm.shopToDelete}
        setShopToDelete={vm.setShopToDelete}
        isDeletingShop={vm.isDeletingShop}
        onDeleteShopConfirm={vm.handleDeleteShopConfirm}
        planToDelete={vm.planToDelete}
        setPlanToDelete={vm.setPlanToDelete}
        isDeletingPlan={vm.isDeletingPlan}
        onDeletePlanConfirm={vm.handleDeletePlanConfirm}
        activeRenewalShop={vm.activeRenewalShop}
        setActiveRenewalShop={vm.setActiveRenewalShop}
        renewPlan={vm.renewPlan}
        setRenewPlan={vm.setRenewPlan}
        renewCustomMonths={vm.renewCustomMonths}
        setRenewCustomMonths={vm.setRenewCustomMonths}
        plans={vm.plans}
        isRenewing={vm.isRenewing}
        onRenewShop={vm.handleRenewShop}
      />
    </div>
  );
}
