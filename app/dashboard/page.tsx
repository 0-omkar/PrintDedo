'use client';
import { Sidebar } from './components/Sidebar';
import { LiveOrdersQueue } from './components/LiveOrdersQueue';
import { RecentOrdersModal } from './components/RecentOrdersModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { AddonsModal } from './components/AddonsModal';
import { PricingModal } from './components/PricingModal';
import { ShopReviewsModal } from './components/ShopReviewsModal';
import { DownloadOrderModal } from './components/DownloadOrderModal';
import { PrintableQRPoster } from './components/PrintableQRPoster';
import { useDashboardViewModel } from './viewmodels/useDashboardViewModel';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';

export default function DashboardPage() {
  const vm = useDashboardViewModel();

  return (
    <>
      {/* Screen Layout: Hidden during print */}
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex relative overflow-hidden print:hidden">
        <BackgroundDecorations />

        {/* Left Sidebar */}
        <Sidebar 
          userId={vm.userId || ''}
          origin={vm.origin}
          handlePrintQR={vm.handlePrintQR}
          isShopPricingOpen={vm.isShopPricingOpen}
          setIsShopPricingOpen={vm.setIsShopPricingOpen}
          hasChanges={vm.hasChanges}
          priceTiers={vm.priceTiers}
          activeTier={vm.activeTier}
          handleOpenEditPricingModal={vm.handleOpenEditPricingModal}
          handleRemovePriceTier={vm.handleRemovePriceTier}
          selectedTierId={vm.selectedTierId}
          setSelectedTierId={vm.setSelectedTierId}
          handleOpenAddPricingModal={vm.handleOpenAddPricingModal}
          isAddonsDropdownOpen={vm.isAddonsDropdownOpen}
          setIsAddonsDropdownOpen={vm.setIsAddonsDropdownOpen}
          addons={vm.addons}
          setIsEditingAddons={vm.setIsEditingAddons}
          handleLogout={vm.handleLogout}
        />

        {/* Main Content Area: Live Queue */}
        <LiveOrdersQueue 
          shopName={vm.shopName}
          location={vm.location}
          logo={vm.logo}
          rating={vm.rating}
          reviews={vm.reviews}
          orders={vm.orders}
          recentOrdersCount={vm.recentOrders.length}
          getSplitShopName={vm.getSplitShopName}
          getSubscriptionAlert={vm.getSubscriptionAlert}
          onOpenProfileEdit={() => {
            vm.setTempShopName(vm.shopName);
            vm.setTempLocation(vm.location);
            vm.setTempLogo(vm.logo);
            vm.setIsEditingBanner(true);
          }}
          onOpenRecents={() => vm.setIsRecentsModalOpen(true)}
          onOpenShopReviews={() => vm.setIsShopReviewsModalOpen(true)}
          handlePrint={vm.handlePrint}
          handleDownload={vm.handleDownload}
          formatFilename={vm.formatFilename}
        />

        {/* Recent Orders Modal */}
        <RecentOrdersModal 
          isOpen={vm.isRecentsModalOpen}
          onClose={() => vm.setIsRecentsModalOpen(false)}
          recentOrders={vm.recentOrders}
          formatFilename={vm.formatFilename}
          handlePrint={vm.handlePrint}
          handleDownload={vm.handleDownload}
        />

        {/* Shop Reviews Modal */}
        <ShopReviewsModal
          isOpen={vm.isShopReviewsModalOpen}
          onClose={() => vm.setIsShopReviewsModalOpen(false)}
          reviews={vm.shopReviews}
          onDeleteReview={vm.handleDeleteShopReview}
        />

        {/* Shop Banner & Info Edit Modal */}
        <ProfileEditModal 
          isOpen={vm.isEditingBanner}
          onClose={() => vm.setIsEditingBanner(false)}
          tempShopName={vm.tempShopName}
          setTempShopName={vm.setTempShopName}
          tempLocation={vm.tempLocation}
          setTempLocation={vm.setTempLocation}
          tempLogo={vm.tempLogo}
          setTempLogo={vm.setTempLogo}
          getSubStatusLabel={vm.getSubStatusLabel}
          onSave={vm.handleSaveBannerSettings}
        />

        {/* Custom Add-ons Manager Modal */}
        <AddonsModal 
          isOpen={vm.isEditingAddons}
          onClose={() => vm.setIsEditingAddons(false)}
          newAddonName={vm.newAddonName}
          setNewAddonName={vm.setNewAddonName}
          newAddonPrice={vm.newAddonPrice}
          setNewAddonPrice={vm.setNewAddonPrice}
          handleAddAddon={vm.handleAddAddon}
          addons={vm.addons}
          handleRemoveAddon={vm.handleRemoveAddon}
        />

        {/* Modal: Add Page Range & Pricing */}
        <PricingModal 
          isOpen={vm.isAddPricingModalOpen}
          onClose={() => vm.setIsAddPricingModalOpen(false)}
          editingTierId={vm.editingTierId}
          modalError={vm.modalError}
          newFromPage={vm.newFromPage}
          setNewFromPage={vm.setNewFromPage}
          newToPage={vm.newToPage}
          setNewToPage={vm.setNewToPage}
          newPricingBwSingle={vm.newPricingBwSingle}
          setNewPricingBwSingle={vm.setNewPricingBwSingle}
          newPricingBwDouble={vm.newPricingBwDouble}
          setNewPricingBwDouble={vm.setNewPricingBwDouble}
          newPricingColorSingle={vm.newPricingColorSingle}
          setNewPricingColorSingle={vm.setNewPricingColorSingle}
          newPricingColorDouble={vm.newPricingColorDouble}
          setNewPricingColorDouble={vm.setNewPricingColorDouble}
          onSave={vm.handleSaveNewPricingModal}
        />

        {/* Download & Print Requirements Modal */}
        <DownloadOrderModal
          isOpen={vm.isDownloadModalOpen}
          onClose={vm.closeDownloadModal}
          order={vm.downloadModalOrder}
          formatFilename={vm.formatFilename}
          onConfirmDownload={vm.executeFileDownload}
          onCompleteOrder={async (orderId: string) => {
            await vm.completeOrderInDb(orderId, true);
          }}
        />
      </div>

      {/* Printable QR Code Template */}
      <PrintableQRPoster 
        userId={vm.userId || ''}
        shopName={vm.shopName}
        origin={vm.origin}
      />
    </>
  );
}
