'use client';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { ShopsOverviewTab } from './components/ShopsOverviewTab';
import { RegisterShopTab } from './components/RegisterShopTab';
import { PlansManagementTab } from './components/PlansManagementTab';
import { AdminMessagesTab } from './components/AdminMessagesTab';
import { PlatformReviewsTab } from './components/PlatformReviewsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
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
    <div className="h-screen max-h-screen bg-[#FFFDF8] font-sans text-slate-900 flex flex-col md:flex-row relative overflow-hidden w-full">
      <BackgroundDecorations />

      {/* Admin Sidebar (Pinned Stationary Left on Desktop, Drawer Overlay on Mobile) */}
      <AdminSidebar
        isOpen={vm.isAdminSidebarOpen}
        onClose={() => vm.setIsAdminSidebarOpen(false)}
        activeView={vm.activeView}
        setActiveView={vm.setActiveView}
        messagesCount={vm.unreadMessagesCount}
        shopsCount={vm.shops.length}
        onRefresh={() => { vm.fetchShops(); vm.fetchPlans(); }}
        onLogout={vm.handleAdminLogout}
      />

      <main className="relative z-10 flex-1 min-w-0 h-screen overflow-y-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col space-y-6 sm:space-y-8 w-full max-w-7xl mx-auto">
        {/* Header Block: 3-lines menu button (Mobile only) + Admin Console title + BrandLogo lg */}
        <AdminHeader 
          onToggleSidebar={() => vm.setIsAdminSidebarOpen(!vm.isAdminSidebarOpen)}
        />
        {/* View 7: System Analytics & Cloudflare Metrics Tab */}
        {vm.activeView === 'analytics' && (
          <AnalyticsTab
            shops={vm.shops}
            totalBandwidth={vm.totalBandwidth}
            currentMemory={vm.currentMemory}
            gbHoursUsed={vm.gbHoursUsed}
            storageMetrics={vm.storageMetrics}
            formatBytes={vm.formatBytes}
            formatGBHours={vm.formatGBHours}
          />
        )}
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
          openEditShopModal={vm.openEditShopModal}
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
        editingShopModal={vm.editingShopModal}
        setEditingShopModal={vm.setEditingShopModal}
        editShopName={vm.editShopName}
        setEditShopName={vm.setEditShopName}
        editShopPhone={vm.editShopPhone}
        setEditShopPhone={vm.setEditShopPhone}
        editShopAlternatePhone={vm.editShopAlternatePhone}
        setEditShopAlternatePhone={vm.setEditShopAlternatePhone}
        editShopUpi={vm.editShopUpi}
        setEditShopUpi={vm.setEditShopUpi}
        isSavingShopDetails={vm.isSavingShopDetails}
        onSaveShopDetails={vm.handleSaveShopDetails}
      />
    </div>
  );
}
