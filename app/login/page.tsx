'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const features = [
  {
    icon: FileText,
    title: 'Replace Chaos with Clarity',
    points: ['Organize every print request', 'No more lost WhatsApp files'],
  },
  {
    icon: Upload,
    title: 'Smart Queue Management',
    points: ['Live order tracking', 'Instant customer uploads'],
  },
  {
    icon: ShieldCheck,
    title: 'Accurate Pricing',
    points: ['Automatic page counting', 'Instant quotation'],
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.length > 120 || password.length > 128) {
      setError('Input exceeds maximum allowed length.');
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data?.session?.access_token) {
      document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=${data.session.expires_in || 604800}; SameSite=Lax`;
    }

    if (data?.user) {
      router.push('/dashboard');
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] font-sans text-[#08152D]">
      <div className="mx-auto min-h-screen w-full max-w-[1600px] lg:grid lg:grid-cols-[44fr_56fr]">
        
        {/* Left Hero Sidebar (Hidden on Mobile, Visible on lg screens) */}
        <aside className="relative hidden min-h-screen overflow-hidden lg:block select-none">
          <div className="absolute -left-2 bottom-[9%] grid grid-cols-5 gap-3 opacity-35" aria-hidden="true">
            {Array.from({ length: 25 }, (_, index) => <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" key={index} />)}
          </div>
          <div className="absolute -bottom-44 -left-40 h-[470px] w-[470px] rounded-full bg-[#F59E0B]/[0.05]" aria-hidden="true" />
          
          <div className="relative z-20 ml-[clamp(3rem,5.25vw,5rem)] pt-[clamp(3.5rem,8vh,5.5rem)]">
            <div className="max-w-[430px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.19em] text-[#F59E0B]">Built for modern print shops</p>
              <h1 className="mt-4 text-[clamp(3.25rem,3.75vw,3.75rem)] font-black leading-[1.03] tracking-[-0.055em] text-[#08152D]">
                <span className="whitespace-nowrap">Less Confusion.</span><br />
                <span className="text-[#F59E0B]">More Printing.</span>
              </h1>
              <div className="mt-6 h-1 w-12 rounded-full bg-[#F59E0B]" />
              <p className="mt-6 max-w-[430px] text-[17px] leading-[1.65] text-[#5F6B7A]">
                PrintDeDo replaces scattered WhatsApp print requests into a structured, trackable workflow for modern print shops.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {features.map(({ icon: Icon, title, points }) => (
                <div className="flex gap-4" key={title}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F59E0B]/15 text-[#08152D]">
                    <Icon className="h-[19px] w-[19px]" strokeWidth={2.1} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold leading-5 text-[#08152D]">{title}</h2>
                    <ul className="mt-1.5 space-y-1 text-[13px] leading-5 text-[#5F6B7A]">
                      {points.map((point) => (
                        <li className="flex items-center gap-1.5" key={point}>
                          <span className="text-[#08152D]">•</span>{point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Printer Illustration */}
          <div 
            className="absolute -bottom-1 -right-[3%] z-10 h-[min(48vh,460px)] w-[95%] pointer-events-none" 
            aria-hidden="true"
          >
            <Image 
              src="/illustrations/login-printer.png" 
              alt="Printer Illustration" 
              fill 
              priority 
              sizes="(min-width: 1280px) 45vw, 0px" 
              className="object-contain object-bottom object-right" 
            />
          </div>
        </aside>

        {/* Right Main Form Container (Only Card Visible on Mobile) */}
        <main className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-12 xl:px-16">
          <section className="relative w-full max-w-[500px] rounded-[28px] border border-[#E8E8E8] bg-white p-8 shadow-[0_20px_50px_-28px_rgba(8,21,45,0.24)] sm:p-10 lg:-translate-y-5">
            
            {/* Top-Left Circular Back Arrow (Returns to Landing Page) */}
            <Link 
              href="/" 
              title="Back to Landing Page" 
              className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100/90 text-slate-600 transition duration-200 hover:bg-[#F59E0B] hover:text-white focus:outline-none shadow-2xs border border-slate-200/80 cursor-pointer group"
              aria-label="Back to landing page"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            {/* Login Card Header Logo */}
            <div className="relative mx-auto h-[144px] w-[288px] max-w-full">
              <Image 
                src="/logos/printdedo-logo-horizontal.png" 
                alt="PrintDeDo" 
                fill 
                priority 
                sizes="288px" 
                className="object-contain" 
              />
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[15px] leading-6 text-[#5F6B7A]">Log in to access your PrintDeDo dashboard.</p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-7">
              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-[#08152D]">Shop ID or Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your shop ID or email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    className="h-14 w-full rounded-xl border border-[#E8E8E8] bg-white pl-12 pr-4 text-[15px] text-[#08152D] outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15" 
                    required 
                    maxLength={120} 
                    autoComplete="email" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-[#08152D]">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input 
                    id="password" 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="h-14 w-full rounded-xl border border-[#E8E8E8] bg-white pl-12 pr-12 text-[15px] text-[#08152D] outline-none transition duration-150 placeholder:text-slate-400 focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/15" 
                    required 
                    maxLength={128} 
                    autoComplete="current-password" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword((visible) => !visible)} 
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition duration-150 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F59E0B]" 
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 -mt-1 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-[#5F6B7A]">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-[#F59E0B] focus:ring-[#F59E0B]" /> Remember me
                </label>
                <Link href="/contact-admin" className="font-semibold text-[#F59E0B] transition duration-150 hover:text-[#E88900] hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#F59E0B] font-bold text-white transition duration-150 hover:bg-[#E88900] hover:shadow-[0_10px_20px_-12px_rgba(245,158,11,0.9)] focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/25 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {loading ? 'Logging in...' : <>Log In <ArrowRight className="h-5 w-5" /></>}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4 text-xs text-slate-400">
              <span className="h-px flex-1 bg-[#E8E8E8]" />OR<span className="h-px flex-1 bg-[#E8E8E8]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link 
                href="/admin" 
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-200/90 bg-amber-50/70 font-bold text-amber-950 transition duration-150 hover:border-amber-400 hover:bg-amber-100/90 focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/15"
              >
                <ShieldCheck className="h-4.5 w-4.5 text-amber-600" />
                <span className="text-xs font-black uppercase tracking-tight">Admin Login</span>
              </Link>
              <Link 
                href="/contact-admin" 
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E8E8E8] font-bold text-[#08152D] transition duration-150 hover:border-[#F59E0B] hover:bg-[#FFFDF8] focus:outline-none focus:ring-4 focus:ring-[#F59E0B]/15"
              >
                <Mail className="h-4.5 w-4.5 text-slate-500" />
                <span className="text-xs font-black uppercase tracking-tight">Contact Admin</span>
              </Link>
            </div>

            <p className="mt-5 text-center text-sm text-[#5F6B7A]">
              Need help? <Link href="/contact-admin" className="font-medium text-[#F59E0B] hover:text-[#E88900] hover:underline">Contact your system administrator.</Link>
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
