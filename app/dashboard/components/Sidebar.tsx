import Link from 'next/link';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, LogOut, Printer } from 'lucide-react';
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
}: SidebarProps) => {
  return (
    <aside className="w-[320px] bg-white border-r border-slate-200 flex flex-col hidden md:flex print:hidden relative z-10">
      <div className="p-6 border-b border-slate-200">
        <BrandLogo size="sm" showSubtitle />
      </div>
      <div className="p-6 flex-1 overflow-y-auto">
        {/* QR Code Section - Tappable */}
        <div className="mb-6 flex flex-col items-center">
          <button 
            type="button"
            onClick={handlePrintQR}
            title="Click to Print or Download QR Code"
            className="bg-white p-3.5 rounded-3xl border border-slate-200 mb-3 shadow-xs hover:border-yellow-400 hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer group flex flex-col items-center justify-center w-full max-w-[200px] border-none"
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
                  {/* Center PrintDedo Brand Badge Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-yellow-400 p-1.5 rounded-xl border-2 border-white shadow-md flex items-center justify-center gap-1 scale-90">
                      <Printer className="w-3.5 h-3.5 text-black" />
                      <span className="text-[10px] font-black text-black leading-none pr-0.5">PrintDedo</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-slate-100 rounded-xl animate-pulse" />
              )}
            </div>
            <span className="block text-[10px] font-bold text-slate-500 group-hover:text-yellow-600 mt-2.5 text-center transition-colors">
              🖨️ Tap to Print / Download QR
            </span>
          </button>
          
          {userId && origin && (
            <a 
              href={`${origin}/shop/${userId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs font-black text-black bg-yellow-400 hover:bg-yellow-500 py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border-none no-underline text-center mt-1"
            >
              <span>Open Customer Dropbox</span>
            </a>
          )}
        </div>

        {/* Collapsible Pricing Dropdown Header */}
        <button 
          type="button"
          onClick={() => setIsShopPricingOpen(!isShopPricingOpen)}
          className="w-full flex items-center justify-between py-2 border-b border-slate-100 mb-3 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-none text-left select-none"
        >
          <div className="flex items-center space-x-1.5">
            <span>Pricing</span>
            {hasChanges && (
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
            )}
          </div>
          {isShopPricingOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        
        {isShopPricingOpen && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-150 mb-4 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
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
                    className="w-full p-2.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-yellow-400 focus:outline-none cursor-pointer"
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
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold p-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border-none mt-2"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Add Pricing</span>
            </button>
          </div>
        )}

        {/* Collapsible Add-ons Dropdown Header */}
        <button 
          type="button"
          onClick={() => setIsAddonsDropdownOpen(!isAddonsDropdownOpen)}
          className="w-full flex items-center justify-between py-2 border-b border-slate-100 mb-3 text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-wider transition-colors cursor-pointer bg-transparent border-none text-left select-none mt-1"
        >
          <div className="flex items-center space-x-1.5">
            <span>Add-ons</span>
          </div>
          {isAddonsDropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isAddonsDropdownOpen && (
          <div className="space-y-3.5 animate-in fade-in slide-in-from-top-1 duration-150 mb-6 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
            {addons.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">No custom add-ons added yet.</p>
            ) : (
              <div className="space-y-2">
                {addons.map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-xs font-bold text-slate-900">{addon.name}</span>
                    <span className="text-xs font-extrabold text-yellow-600">₹{addon.price.toFixed(2)}</span>
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

      <div className="p-4 border-t border-slate-200 bg-white">
        <button onClick={handleLogout} className="w-full flex items-center space-x-2 px-4 py-2 text-sm font-bold text-slate-700 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors cursor-pointer border-none bg-transparent">
          <div className="border border-slate-200 p-1.5 rounded-full hover:border-yellow-400 hover:text-yellow-600">
            <LogOut className="w-4 h-4" />
          </div>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
