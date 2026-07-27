'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import { Mail, Phone, User, CreditCard, Shield, Loader2, ArrowLeft } from 'lucide-react';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
import { BrandLogo } from '@/components/BrandLogo';

export default function RenewPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });
        if (error) throw error;
        setPlans(data || []);
      } catch (e) {
        console.error('Failed to load plans:', e);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center py-6 sm:py-10 px-4 relative overflow-hidden">
      <BackgroundDecorations />

      <main className="relative z-10 w-full max-w-[95%] sm:max-w-4xl flex flex-col items-center">
        {/* Back Link & Brand Logo Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-xs font-black uppercase text-slate-400 hover:text-slate-650 tracking-wider transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <BrandLogo size="lg" href="/" showSubtitle={false} />
        </div>

        {/* Brand/Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-yellow-400 p-3 rounded-2xl shadow-sm mb-3 inline-flex items-center justify-center">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">PrintDedo Subscription</h1>
          <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-0.5">Activate or Renew Your Print Shop Portal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          {/* Left/Middle: Subscription Plans List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Available Plans</h2>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-10">No subscription plans configured yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plans.map((plan) => (
                    <div 
                      key={plan.id} 
                      className="border border-slate-200 p-5 rounded-2xl bg-slate-50 hover:border-yellow-300 transition flex flex-col justify-between"
                    >
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
                        <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed">
                          {plan.description || 'Access to your dynamic Xerox print queue and upload portal.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Administrator Contact details */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-100">
                <User className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-black text-slate-950 uppercase tracking-tight">Contact Admin</h2>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                To purchase a plan or renew your print shop subscription, please get in touch with the core systems administrator:
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3.5 bg-slate-50 border border-slate-200/50 p-3 rounded-2xl">
                  <div className="bg-yellow-400/10 p-2 rounded-xl text-yellow-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Admin</span>
                    <span className="text-sm font-extrabold text-slate-800">Omkar Varpe</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3.5 bg-slate-50 border border-slate-200/50 p-3 rounded-2xl">
                  <div className="bg-yellow-400/10 p-2 rounded-xl text-yellow-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</span>
                    <span className="text-xs font-semibold text-slate-500 italic">Will be available soon</span>
                  </div>
                </div>

                <a 
                  href="tel:9373833966"
                  className="flex items-center space-x-3.5 bg-slate-50 border border-slate-200/50 p-3 rounded-2xl hover:border-yellow-300 transition cursor-pointer text-left block w-full"
                >
                  <div className="bg-yellow-400/10 p-2 rounded-xl text-yellow-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile Number</span>
                    <span className="text-sm font-extrabold text-slate-800">9373833966</span>
                  </div>
                </a>
              </div>

              <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4.5 text-center">
                <span className="text-[10px] font-black text-yellow-800 uppercase tracking-wider block">Activation Support</span>
                <p className="text-[11px] text-yellow-700 font-semibold mt-1 leading-relaxed">
                  Provide your Shop ID and desired plan details. Activation is instant upon verification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
