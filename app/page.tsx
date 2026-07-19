'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Clock, 
  Loader2, 
  QrCode, 
  Printer, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Star,
  Layers,
  Sliders,
  Store,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { BackgroundDecorations } from '@/components/BackgroundDecorations';
import { BrandLogo } from '@/components/BrandLogo';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut().catch(() => {});
        setSession(null);
      } else {
        setSession(session);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard');
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 relative overflow-x-hidden flex flex-col justify-between selection:bg-yellow-300">
      <BackgroundDecorations />

      {/* Navigation Header */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-4 md:py-6 max-w-7xl mx-auto w-full select-none">
        <BrandLogo size="lg" showSubtitle />

        <div className="flex items-center space-x-2.5 md:space-x-3">
          <Link 
            href="/contact-admin" 
            className="px-4 py-2.5 text-xs md:text-sm font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200/80 rounded-xl transition-all shadow-xs"
          >
            Contact Admin
          </Link>

          {session ? (
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 text-xs md:text-sm font-black text-black bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="px-5 py-2.5 text-xs md:text-sm font-black text-black bg-yellow-400 hover:bg-yellow-500 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Shop Login</span>
                <Store className="w-4 h-4" />
              </Link>
              <Link 
                href="/admin" 
                className="px-3.5 py-2.5 text-xs md:text-sm font-extrabold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all hidden sm:flex items-center space-x-1.5"
                title="Admin Portal"
              >
                <Shield className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-8 pb-16 md:pt-16 md:pb-24 max-w-6xl mx-auto px-6 text-center w-full">
        {/* Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 bg-yellow-400/15 border border-yellow-400/40 px-4 py-2 rounded-full mb-6 shadow-xs select-none animate-bounce duration-1000">
          <Sparkles className="w-4 h-4 text-yellow-600 fill-yellow-400" />
          <span className="text-xs font-black uppercase tracking-wider text-slate-900">
            Smart Printing Infrastructure for Modern Xerox Shops
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1] text-slate-950 uppercase">
          A clean print queue <br className="hidden sm:block" />
          for <span className="bg-yellow-400 text-black px-3 py-1 rounded-2xl inline-block -rotate-1 shadow-sm">modern Xerox shops</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
          Eliminate WhatsApp clutter & pendrive viruses. Customers scan your unique shop QR code, configure print options, and upload PDFs directly to your live queue.
        </p>

        {/* Main CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto mb-16">
          {session ? (
            <Link 
              href="/dashboard" 
              className="group flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black text-base hover:bg-yellow-500 transition-all shadow-md hover:scale-105"
            >
              <span>Go to Live Queue Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link 
                href="/login" 
                className="group flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black text-base hover:bg-yellow-500 transition-all shadow-md hover:scale-105"
              >
                <span>Log in to your Shop</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/signup" 
                className="flex items-center justify-center space-x-2 w-full sm:w-auto px-6 py-4 bg-slate-900 text-white rounded-2xl font-bold text-base hover:bg-slate-800 transition-all shadow-md"
              >
                <span>Register New Shop</span>
              </Link>
            </>
          )}
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 md:p-6 bg-white/90 border border-slate-200 rounded-3xl shadow-sm backdrop-blur-md">
          <div className="p-3 text-center">
            <div className="text-2xl md:text-3xl font-black text-slate-950">0</div>
            <div className="text-[11px] font-bold uppercase text-slate-500 mt-1">WhatsApp Files Needed</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-black text-yellow-500">10 Min</div>
            <div className="text-[11px] font-bold uppercase text-slate-500 mt-1">Auto-Delete Privacy</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-black text-slate-950">100%</div>
            <div className="text-[11px] font-bold uppercase text-slate-500 mt-1">Instant Price Calculation</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl md:text-3xl font-black text-emerald-600">Real-Time</div>
            <div className="text-[11px] font-bold uppercase text-slate-500 mt-1">Live Order Updates</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="relative z-10 py-16 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl md:text-4xl font-black uppercase text-slate-950 tracking-tight">
              Everything your Xerox shop needs
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium mt-2">
              Designed specifically for fast-paced print shop owners and university xerox counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Instant PDF Quotations</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Auto-calculates total PDF pages, B&W vs Color rates, single/double sided, and specific page ranges in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Auto-Expiring Queues</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Protects customer data privacy: live queue documents auto-delete after 10 minutes if unprinted; printed jobs auto-clear in 3 minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Unique Shop QR Poster</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Print or download your shop's official A4 QR code display poster with your shop logo centered inside the QR badge.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Custom Finishing Add-ons</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Offer custom binding, spiral binding, lamination, and custom finishing services with live price calculations.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Multi-Tier Pricing Rules</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Set tiered pricing (e.g. 1-10 pages, 11-50 pages, 51+ pages) for bulk discount Xerox printing.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-2xl flex items-center justify-center text-yellow-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black uppercase text-slate-950">Zero App Install Required</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Customers scan the QR code using any iPhone or Android camera to immediately upload files without downloading any apps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="relative z-10 py-16 md:py-24 max-w-6xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
            3-Step Workflow
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase text-slate-950 tracking-tight mt-3">
            How PrintDedo Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm relative space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-yellow-400 text-black font-black text-lg rounded-2xl flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-xl font-black uppercase text-slate-950">Scan Counter QR</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                Customer scans your shop's QR poster placed at your counter using their mobile browser.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500">
              <span>Instant mobile web interface</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm relative space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-yellow-400 text-black font-black text-lg rounded-2xl flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-xl font-black uppercase text-slate-950">Configure & Submit</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                Select B&W or Color, single/double sided, custom page ranges, and optional binding. Sees instant quote & submits.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500">
              <span>Automatic PDF page count</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm relative space-y-4 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-yellow-400 text-black font-black text-lg rounded-2xl flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-xl font-black uppercase text-slate-950">Print & Collect</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                Order appears live on your shop dashboard. One click downloads sliced PDF ready for instant printing.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-500">
              <span>One-click print execution</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center border-t border-slate-200 bg-white select-none">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" showSubtitle={false} />
          
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Founded by -{' '}
            <a href="https://www.linkedin.com/in/omkar-varpe-9704742a9/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-yellow-600 hover:underline font-bold transition-colors">
              Omkar Varpe
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/pradeep-biswas-developer/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-yellow-600 hover:underline font-bold transition-colors">
              Pradeep Biswas
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/yajan-mehta-9220442b2/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-yellow-600 hover:underline font-bold transition-colors">
              Yajan Mehta
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/siddhant-deshmukh-0aa485344/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-yellow-600 hover:underline font-bold transition-colors">
              Siddhant Deshmukh
            </a>
            .
          </p>

          <div className="flex items-center space-x-3 text-xs font-extrabold text-slate-500">
            <Link href="/login" className="hover:text-black transition">Shop Login</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-black transition">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
