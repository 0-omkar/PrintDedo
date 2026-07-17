'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Printer, Mail, Phone, MapPin, Send, CheckCircle2, ArrowLeft, User, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ContactAdminPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);

    const newMsg = {
      id: Date.now().toString(),
      name,
      contact_info: email,
      message,
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('admin_messages').insert({
        name,
        contact_info: email,
        message,
        created_at: newMsg.created_at
      });
      if (error) {
        console.warn('Could not insert to DB, saving locally:', error);
      }
    } catch (e) {
      console.warn('Fallback to local storage for admin messages:', e);
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('xeroxflow_admin_messages');
      let list: any[] = [];
      if (stored) {
        try { list = JSON.parse(stored); } catch(e) {}
      }
      list.unshift(newMsg);
      localStorage.setItem('xeroxflow_admin_messages', JSON.stringify(list));
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-yellow-100 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-yellow-50 blur-3xl opacity-60 pointer-events-none" />

      {/* Navigation Header */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full select-none">
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer no-underline text-inherit">
          <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-xs group-hover:scale-105 transition-transform duration-200">
            <Printer className="w-7 h-7 text-black" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-slate-950">
            Xerox<span className="text-yellow-500">Flow</span>
          </span>
        </Link>

        <Link 
          href="/" 
          className="flex items-center space-x-1 text-sm font-bold text-slate-600 hover:text-yellow-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto w-full px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Left Column: Information */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-extrabold text-yellow-600 uppercase tracking-widest bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                Support & Contact
              </span>
              <h1 className="text-3xl font-black text-slate-950 tracking-tight mt-3">
                Contact XeroxFlow Admin
              </h1>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">
                Need help with your Xerox shop account, subscription, or technical setup? Reach out directly to our team.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 bg-yellow-50/70 rounded-2xl border border-yellow-200/80 space-y-3 shadow-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-400 p-2.5 rounded-xl text-black">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-yellow-800 font-extrabold uppercase tracking-wider block">Admin Details</span>
                    <span className="text-base font-black text-slate-950">Omkar Varpe</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-700 pt-2 border-t border-yellow-200/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-yellow-600" /> Mobile:
                    </span>
                    <a href="tel:9373833966" className="font-extrabold text-slate-900 hover:text-yellow-600">9373833966</a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Mail className="w-3.5 h-3.5 text-yellow-600" /> Email:
                    </span>
                    <span className="font-medium italic text-slate-500">Will be available soon</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> LinkedIn:
                    </span>
                    <a 
                      href="https://www.linkedin.com/in/omkar-varpe-9704742a9/?skipRedirect=true" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-extrabold text-blue-600 hover:underline text-[11px]"
                    >
                      View LinkedIn Profile ↗
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="bg-yellow-400 p-2.5 rounded-xl text-black">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Headquarters</span>
                  <span className="text-sm font-bold text-slate-900">MIT-WPU Campus, Kothrud, Pune</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Founding Team</span>
              <p className="text-xs text-slate-600 font-semibold space-x-1">
                <a href="https://www.linkedin.com/in/omkar-varpe-9704742a9/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600 hover:underline">Omkar Varpe</a>
                <span>•</span>
                <a href="https://www.linkedin.com/in/pradeep-biswas-developer/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600 hover:underline">Pradeep Biswas</a>
                <span>•</span>
                <a href="https://www.linkedin.com/in/yajan-mehta-9220442b2/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600 hover:underline">Yajan Mehta</a>
                <span>•</span>
                <a href="https://www.linkedin.com/in/siddhant-deshmukh-0aa485344/" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-600 hover:underline">Siddhant Deshmukh</a>
              </p>
            </div>
          </div>

          {/* Right Column: Message Form */}
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/80 flex flex-col justify-center">
            {submitted ? (
              <div className="text-center py-10 space-y-4 animate-scale-in">
                <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">Message Received!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Thank you for contacting XeroxFlow Admin. Our support team will respond to <strong>{email}</strong> shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-xs font-bold text-yellow-600 hover:underline cursor-pointer border-none bg-transparent pt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900">Send Admin a Message</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Omkar Varpe"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email / Phone</label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. omkar@gmail.com"
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your query or request..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:outline-none focus:border-yellow-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-yellow-400 text-black font-bold p-3.5 rounded-xl text-xs hover:bg-yellow-500 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 border-none cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send to Admin</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <p className="text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} XeroxFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
