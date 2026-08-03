'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Clock,
  Loader2,
  QrCode,
  Printer,
  FileText,
  Star,
  User,
  Smartphone,
  Calculator,
  Lock,
  BarChart2,
  CheckCircle,
  HelpCircle,
  Mail,
  ChevronRight,
  Sparkles,
  Layers,
  LockKeyhole
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
        supabase.auth.signOut().catch(() => { });
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

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] font-sans text-slate-900 relative overflow-x-hidden flex flex-col justify-between selection:bg-amber-300">
      <BackgroundDecorations />

      {/* Navigation Header */}
      <nav className="fixed inset-x-0 top-0 z-40 flex items-center justify-between w-full px-4 sm:px-8 lg:px-12 py-3 bg-[#FFFDF8]/95 backdrop-blur-sm shadow-[0_2px_12px_rgba(15,23,42,0.05)] select-none">
        <BrandLogo size="lg" showSubtitle />

        {/* Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center space-x-10 text-sm font-extrabold text-slate-800">
          <a href="#features" className="hover:text-amber-500 transition-colors">Features</a>
          <a href="#pricing" className="hover:text-amber-500 transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-amber-500 transition-colors">FAQ</a>
          <Link href="/contact-admin" className="hover:text-amber-500 transition-colors">Contact</Link>
        </div>

        {/* Header Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-6 py-3 text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-2xl transition-all shadow-2xs flex items-center space-x-2 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/admin"
                className="px-4 py-2.5 text-sm font-bold text-slate-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/90 rounded-2xl transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
                title="Super Admin Portal"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Portal</span>
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-2xl transition-all shadow-2xs cursor-pointer border-none"
              >
                <span>Shop Owner Login</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Header Action / Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-black text-slate-950 bg-amber-400 rounded-xl transition cursor-pointer"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-black text-slate-950 bg-amber-400 rounded-xl transition cursor-pointer"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Reserves the fixed header's height so hero content keeps its original position. */}
      <div aria-hidden="true" className="h-[104px] sm:h-[112px] lg:h-[118px] shrink-0" />

      {/* Main Hero Section */}
      <section className="relative z-20 pt-4 pb-12 lg:pt-8 lg:pb-16 max-w-[1740px] mx-auto px-6 lg:px-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">

          {/* Hero Left Content Column */}
          <div className="lg:col-span-5 text-left space-y-6">

            {/* Top Pill Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-100/90 border border-amber-300/70 px-4 py-1.5 rounded-full shadow-2xs select-none">
              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Built for Modern Print Shops
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.03] text-slate-950">
              Less Confusion.<br />
              <span className="text-amber-500">More Printing.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-semibold max-w-lg">
              PrintDeDo replaces scattered WhatsApp print requests with a structured, trackable workflow for modern print shops.
            </p>

            {/* CTA Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              {session ? (
                <Link
                  href="/dashboard"
                  className="group flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl font-black text-base transition-all shadow-md hover:scale-105"
                >
                  <span>Go to Live Queue</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="group flex items-center justify-center space-x-2.5 w-full sm:w-auto px-8 py-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl font-black text-base transition-all shadow-md hover:scale-105"
                  >
                    <span>Register Your Shop</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#workflow"
                    className="flex items-center justify-center space-x-2 w-full sm:w-auto px-7 py-4 bg-white text-slate-900 border border-slate-200/90 rounded-2xl font-extrabold text-base hover:bg-slate-50 transition-all shadow-2xs"
                  >
                    <Play className="w-4 h-4 fill-slate-900 text-slate-900" />
                    <span>Watch Demo</span>
                  </a>
                </>
              )}
            </div>

            {/* 3 Feature Cards Grid Below CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
              <div className="flex items-start space-x-3 bg-white/90 border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">QR Based Ordering</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">Scan, upload &amp; send files instantly</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/90 border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Live Queue Management</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">Track every order in real-time</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-white/90 border border-slate-200/80 p-3.5 rounded-2xl shadow-2xs">
                <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Smart Pricing</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">Auto-calculate prices based on services</p>
                </div>
              </div>
            </div>

          </div>

          {/* Hero Right Composition */}
          <div className="lg:col-span-7 relative flex justify-center items-center select-none pt-6 lg:pt-0">

            {/* Recreated Golden Background Aura Curve & Dot Grid */}
            <div className="absolute -top-10 right-0 w-[580px] h-[580px] bg-[#FDF0D5]/70 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-0 right-4 grid grid-cols-6 gap-3 opacity-30 text-amber-500 pointer-events-none -z-10" aria-hidden="true">
              {Array.from({ length: 30 }, (_, index) => (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" key={index} />
              ))}
            </div>

            {/* Layered device showcase */}
            <div className="relative w-full max-w-[950px] lg:max-w-none flex flex-col items-center pt-4 pb-8 lg:block lg:min-h-[560px] lg:pb-12">

              {/* 1. Main MacBook Dashboard Image (back layer) */}
              <div className="relative z-10 w-[82%] sm:w-[76%] md:w-[80%] lg:absolute lg:-top-[3%] lg:left-1/2 lg:w-[94%] lg:-translate-x-1/2 xl:w-[96%]">
                <Image
                  src="/hero/hero-macbook.png"
                  alt="PrintDeDo Shop Owner Dashboard MacBook Mockup"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none"
                />
              </div>

              {/* 2. QR Stand Image (middle layer) */}
              <div className="relative z-20 -mt-12 mr-[42%] w-[43%] sm:-mt-16 sm:mr-[46%] sm:w-[34%] md:w-[32%] lg:absolute lg:-bottom-[9%] lg:-left-[30%] lg:mt-0 lg:mr-0 lg:w-[68%] xl:-left-[15%] xl:w-[47%]">
                <Image
                  src="/hero/hero-qr.png"
                  alt="PrintDeDo Scan to Print QR Stand Mockup"
                  width={1536}
                  height={1024}
                  priority
                  className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none"
                />
              </div>

              {/* 3. Mobile Image (front layer) */}
              <div className="relative z-30 -mt-24 ml-[19%] w-[28%] sm:-mt-32 sm:ml-[42%] sm:w-[24%] md:w-[22%] lg:absolute lg:-bottom-[1%] lg:-right-[-8%] lg:mt-0 lg:ml-0 lg:w-[22%] xl:w-[18%]">
                <Image
                  src="/hero/hero-mobile.png"
                  alt="PrintDeDo Customer Dropbox iPhone Mockup"
                  width={344}
                  height={725}
                  priority
                  className="w-full h-auto object-contain drop-shadow-xl pointer-events-none"
                />
              </div>

            </div>

          </div>

        </div>

        {/* Bottom Trust Features Banner Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-[1500px] mx-auto mt-12 lg:mt-10 p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl shadow-xs text-left">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 leading-snug">Trusted by modern print shops</span>
          </div>

          <div className="flex items-center space-x-3 p-2 border-l border-slate-100">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 leading-snug">No App Required</span>
          </div>

          <div className="flex items-center space-x-3 p-2 border-l border-slate-100">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 leading-snug">Auto Pricing</span>
          </div>

          <div className="flex items-center space-x-3 p-2 border-l border-slate-100">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 leading-snug">Live Queue</span>
          </div>

          <div className="flex items-center space-x-3 p-2 border-l border-slate-100 col-span-2 md:col-span-1">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-900 leading-snug">Privacy Auto Delete</span>
          </div>
        </div>

      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="relative z-20 py-16 md:py-24 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full">
              Complete Print Management
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-3">
              Everything your Xerox shop needs
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-semibold mt-2">
              Designed specifically for fast-paced print shop owners and university xerox counters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[#FFFDF8] p-6 md:p-8 rounded-3xl border border-slate-200/80 hover:border-amber-400 transition-all space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Instant PDF Quotations</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Auto-calculates total PDF pages, B&amp;W vs Color rates, single/double sided, and specific page ranges in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FFFDF8] p-6 md:p-8 rounded-3xl border border-slate-200/80 hover:border-amber-400 transition-all space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Auto-Expiring Queues</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Protects customer data privacy: live queue documents auto-delete after 10 minutes if unprinted; printed jobs auto-clear in 3 minutes.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FFFDF8] p-6 md:p-8 rounded-3xl border border-slate-200/80 hover:border-amber-400 transition-all space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-950">Unique Shop QR Poster</h3>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
                Print or download your shop's official A4 QR code display poster with your shop logo centered inside the QR badge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow Section */}
      <section id="workflow" className="relative z-20 py-16 md:py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-3.5 py-1.5 rounded-full">
            3-Step Workflow
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tight mt-3">
            How PrintDeDo Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 font-black text-lg rounded-2xl flex items-center justify-center">
              1
            </div>
            <h3 className="text-xl font-black text-slate-950">Scan Counter QR</h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              Customer scans your shop's QR poster placed at your counter using their mobile browser.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 font-black text-lg rounded-2xl flex items-center justify-center">
              2
            </div>
            <h3 className="text-xl font-black text-slate-950">Configure &amp; Submit</h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              Select B&amp;W or Color, single/double sided, custom page ranges, and optional binding. Sees instant quote &amp; submits.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 font-black text-lg rounded-2xl flex items-center justify-center">
              3
            </div>
            <h3 className="text-xl font-black text-slate-950">Print &amp; Collect</h3>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed">
              Order appears live on your shop dashboard. One click downloads sliced PDF ready for instant printing.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 w-full py-8 text-center border-t border-slate-200 bg-white select-none">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" showSubtitle={false} />

          <p className="text-xs md:text-sm text-slate-600 font-semibold">
            Founded by -{' '}
            <a href="https://www.linkedin.com/in/omkar-varpe-9704742a9/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-amber-600 font-bold transition-colors">
              Omkar Varpe
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/siddhant-deshmukh-0aa485344/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-amber-600 font-bold transition-colors">
              Siddhant Deshmukh
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/yajan-mehta-9220442b2/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-amber-600 font-bold transition-colors">
              Yajan Mehta
            </a>
            ,{' '}
            <a href="https://www.linkedin.com/in/pradeep-biswas-developer/" target="_blank" rel="noopener noreferrer" className="text-slate-900 hover:text-amber-600 font-bold transition-colors">
              Pradeep Biswas
            </a>
            .
          </p>

          <div className="flex items-center space-x-4 text-xs font-extrabold text-slate-500">
            <Link href="/login" className="hover:text-slate-900 transition">Shop Login</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-amber-600 text-slate-800 font-bold transition">Admin Portal</Link>
            <span>•</span>
            <Link href="/contact-admin" className="hover:text-slate-900 transition">Contact Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
