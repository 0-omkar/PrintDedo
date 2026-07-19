import { ArrowLeft, CreditCard, Plus, Loader2, Edit3, Trash2, Save } from 'lucide-react';
import { ActiveView, PlanItem } from '../types';

interface PlansManagementTabProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  plans: PlanItem[];
  loadingPlans: boolean;
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  newPlanId: string;
  setNewPlanId: (val: string) => void;
  newPlanName: string;
  setNewPlanName: (val: string) => void;
  newPlanPrice: string;
  setNewPlanPrice: (val: string) => void;
  newPlanDuration: string;
  setNewPlanDuration: (val: string) => void;
  newPlanDesc: string;
  setNewPlanDesc: (val: string) => void;
  createPlanLoading: boolean;
  onCreatePlanSubmit: (e: React.FormEvent) => void;
  editingPlanId: string | null;
  setEditingPlanId: (id: string | null) => void;
  editPlanName: string;
  setEditPlanName: (val: string) => void;
  editPlanPrice: string;
  setEditPlanPrice: (val: string) => void;
  editPlanDuration: string;
  setEditPlanDuration: (val: string) => void;
  editPlanDesc: string;
  setEditPlanDesc: (val: string) => void;
  planSaveLoading: boolean;
  startEditPlan: (plan: PlanItem) => void;
  onUpdatePlan: (planId: string) => void;
  setPlanToDelete: (plan: PlanItem) => void;
}

export const PlansManagementTab = ({
  activeView,
  setActiveView,
  plans,
  loadingPlans,
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
  onCreatePlanSubmit,
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
  onUpdatePlan,
  setPlanToDelete,
}: PlansManagementTabProps) => {
  if (activeView !== 'plans') return null;

  return (
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
          <form onSubmit={onCreatePlanSubmit} className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in">
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
                  maxLength={50}
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
                  maxLength={100}
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
                  maxLength={500}
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
                          onClick={() => onUpdatePlan(plan.id)}
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
  );
};
