import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Plus,
  LogOut,
  Printer,
  Headphones,
  HelpCircle,
  Tag,
  Layers,
  X
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { PriceTier, Addon } from '../types';
import { BrandLogo } from '@/components/BrandLogo';

interface SidebarProps {
  userId: string;
  origin: string;
  handlePrintQR: () => void;
  isShopPricingOpen: boolean;
  setIsShopPricingOpen: (open: boolean) => void;
  hasChanges: boolean;
  priceTiers: PriceTier[];
  activeTier: PriceTier | undefined;
  handleOpenEditPricingModal: (tier: PriceTier) => void;
  handleRemovePriceTier: (id: string) => void;
  selectedTierId: string;
  setSelectedTierId: (id: string) => void;
  handleOpenAddPricingModal: () => void;
  isAddonsDropdownOpen: boolean;
  setIsAddonsDropdownOpen: (open: boolean) => void;
  addons: Addon[];
  setIsEditingAddons: (open: boolean) => void;
  handleLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar = ({
  userId,
  origin,
  handlePrintQR,
  isShopPricingOpen,
  setIsShopPricingOpen,
  hasChanges,
  priceTiers,
  activeTier,
  handleOpenEditPricingModal,
  handleRemovePriceTier,
  selectedTierId,
  setSelectedTierId,
  handleOpenAddPricingModal,
  isAddonsDropdownOpen,
  setIsAddonsDropdownOpen,
  addons,
  setIsEditingAddons,
  handleLogout,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) => {
  const sidebarBody = (
    <>
      {/* Side Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
        <BrandLogo size="lg" href="/" />
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition border-none bg-transparent cursor-pointer"
            title="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto space-y-5">

        {/* 1. Pricing Dropdown Button & Content */}
        <div>
          <button
            type="button"
            onClick={() => setIsShopPricingOpen(!isShopPricingOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 transition-all cursor-pointer select-none shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Pricing Rules</span>
              {hasChanges && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            {isShopPricingOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {isShopPricingOpen && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-150 mt-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
              {priceTiers.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl bg-white p-3">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">No Pricing Ranges Added</p>
                  <p className="text-[11px] text-slate-500 font-medium">Click "Add Pricing" below to add a page range.</p>
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3.5">
                  {/* Heading: NO OF PAGES */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">
                      NO OF PAGES
                    </span>
                    {activeTier && (
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditPricingModal(activeTier)}
                          className="text-[11px] text-slate-600 hover:text-slate-900 font-bold transition border-none bg-transparent cursor-pointer flex items-center gap-1"
                          title="Edit Range Pricing"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>
                        {priceTiers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePriceTier(activeTier.id)}
                            className="text-[11px] text-red-500 hover:text-red-700 font-bold transition border-none bg-transparent cursor-pointer flex items-center gap-1"
                            title="Delete Range"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dropdown displaying ranges */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Select Page Range
                    </label>
                    <select
                      value={selectedTierId}
                      onChange={(e) => setSelectedTierId(e.target.value)}
                      className="w-full p-2.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-amber-400 focus:outline-none cursor-pointer"
                    >
                      {priceTiers.map((tier) => (
                        <option key={tier.id} value={tier.id}>
                          {tier.fromPage} - {tier.toPage ? `${tier.toPage} Pages` : '∞ Pages (Unlimited)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4 Pricing Display Fields */}
                  {activeTier && (
                    <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">B&W Single (₹)</label>
                        <input
                          type="number"
                          readOnly
                          value={activeTier.pricingBwSingle}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg font-bold bg-slate-50 text-slate-800 cursor-default focus:outline-none select-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">B&W Double (₹)</label>
                        <input
                          type="number"
                          readOnly
                          value={activeTier.pricingBwDouble}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg font-bold bg-slate-50 text-slate-800 cursor-default focus:outline-none select-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Color Single (₹)</label>
                        <input
                          type="number"
                          readOnly
                          value={activeTier.pricingColorSingle}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg font-bold bg-slate-50 text-slate-800 cursor-default focus:outline-none select-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Color Double (₹)</label>
                        <input
                          type="number"
                          readOnly
                          value={activeTier.pricingColorDouble}
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg font-bold bg-slate-50 text-slate-800 cursor-default focus:outline-none select-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Single "Add Pricing" button */}
              <button
                type="button"
                onClick={handleOpenAddPricingModal}
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 text-xs font-black p-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border-none mt-2"
              >
                <Plus className="w-4 h-4 text-slate-950" />
                <span>Add Pricing</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Add-ons Dropdown Button & Content */}
        <div>
          <button
            type="button"
            onClick={() => setIsAddonsDropdownOpen(!isAddonsDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/90 border border-slate-200 rounded-2xl text-xs font-black text-slate-900 transition-all cursor-pointer select-none shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Custom Add-ons</span>
            </div>
            {isAddonsDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {isAddonsDropdownOpen && (
            <div className="space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150 mt-2.5 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
              {addons.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-2">No custom add-ons added yet.</p>
              ) : (
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                      <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                      <span className="text-xs font-extrabold text-amber-600">₹{addon.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsEditingAddons(true)}
                className="w-full text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Manage Add-ons Menu</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. QR Code Poster Section */}
        <div className="flex flex-col items-center pt-1">
          <button
            type="button"
            onClick={handlePrintQR}
            title="Click to Print or Download QR Code"
            className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-2xs hover:border-amber-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer group flex flex-col items-center justify-center w-full max-w-[200px]"
          >
            <div className="w-full aspect-square p-2 bg-white rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
              {userId && origin ? (
                <>
                  <QRCode
                    value={`${origin}/shop/${userId}`}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                    level="H"
                  />
                  {/* Center PrintDeDo Brand Badge Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-amber-400 p-1.5 rounded-xl border-2 border-white shadow-md flex items-center justify-center gap-1 scale-90">
                      <Printer className="w-3.5 h-3.5 text-black" />
                      <span className="text-[10px] font-black text-black leading-none pr-0.5">PrintDeDo</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>
            <span className="block text-[10px] font-bold text-slate-500 group-hover:text-amber-600 mt-2.5 text-center transition-colors">
              🖨️ Tap to Print / Download QR
            </span>
          </button>

          {userId && origin && (
            <a
              href={`${origin}/shop/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border-none no-underline text-center mt-2.5"
            >
              <span>Open Customer Dropbox</span>
            </a>
          )}
        </div>

        {/* 4. Need Help? Support Card */}
        <Link
          href="/contact-admin"
          className="block bg-white border border-slate-200/90 hover:border-amber-400 rounded-3xl p-5 text-center shadow-xs hover:shadow-md transition-all cursor-pointer no-underline group select-none relative overflow-hidden"
        >
          {/* Yellow Background Aura Circle */}
          <div className="w-32 h-32 bg-amber-100/60 rounded-full absolute -top-4 left-1/2 -translate-x-1/2 filter blur-xl pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <img
              src="/login-illustration.png"
              alt="Need Help Printer Illustration"
              className="w-36 h-28 object-contain mx-auto group-hover:scale-105 transition-transform duration-300 pointer-events-none"
            />

            <div>
              <h3 className="font-black text-slate-950 text-base">Need Help?</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">We're here to help you 24/7.</p>
            </div>

            <div className="pt-2">
              <div className="w-full bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-xs py-2.5 px-4 rounded-2xl flex items-center justify-center space-x-2 transition shadow-2xs">
                <Headphones className="w-4 h-4 text-slate-700" />
                <span>Contact Support</span>
              </div>
            </div>
          </div>
        </Link>

      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer border-none bg-transparent">
          <div className="border border-slate-200 p-1.5 rounded-full hover:border-amber-400 hover:text-amber-600">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Collapsible Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden print:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={onCloseMobile}
          />
          {/* Slide-over Container (Dynamic width up to max 320px) */}
          <aside className="relative w-[85%] max-w-[320px] bg-white h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarBody}
          </aside>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col hidden md:flex print:hidden relative z-10 shrink-0">
        {sidebarBody}
      </aside>
    </>
  );
};

