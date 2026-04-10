"use client";

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusCircle, Database, CheckCircle2, AlertCircle, Home, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// --- Supabase Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminPanel() {
  const [tool, setTool] = useState({
    name: '',
    category: '',
    url: '',
    description: '',
    trust_score: 95,
    status: 'VERIFIED_NODE'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Supabase లోకి కొత్త టూల్ ని పంపించడం
    const { error } = await supabase.from('tools').insert([tool]);

    if (error) {
      setMessage({ type: 'error', text: 'Error: ' + error.message });
    } else {
      setMessage({ type: 'success', text: 'Success: Protocol Deployed to AI Sentry!' });
      // ఫామ్ ని క్లియర్ చేయడం
      setTool({ name: '', category: '', url: '', description: '', trust_score: 95, status: 'VERIFIED_NODE' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-blue-600/30">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-blue-600/20">S</div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Control Center</h1>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">System Administrator</p>
                </div>
            </div>
            <Link href="/" className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl transition-all border border-white/5 group">
                <Home size={20} className="group-hover:text-blue-500 transition-colors"/>
            </Link>
        </div>

        {/* Status Message */}
        {message.text && (
            <div className={`mb-8 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
              {message.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
              {message.text}
            </div>
        )}

        {/* Admin Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-zinc-900/20 p-12 rounded-[3.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <ShieldCheck size={120} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Neural Name</label>
              <input required type="text" placeholder="e.g. Claude 3.5" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all font-bold" value={tool.name} onChange={(e) => setTool({...tool, name: e.target.value})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Sector / Category</label>
              <input required type="text" placeholder="e.g. Coding AI" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all font-bold" value={tool.category} onChange={(e) => setTool({...tool, category: e.target.value})} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Interface URL</label>
            <input required type="url" placeholder="https://platform-access.ai" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all font-bold" value={tool.url} onChange={(e) => setTool({...tool, url: e.target.value})} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">System Description</label>
            <textarea required rows={4} placeholder="Define the system's core capabilities..." className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 transition-all font-bold resize-none" value={tool.description} onChange={(e) => setTool({...tool, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Integrity Score (%)</label>
              <input type="number" min="0" max="100" className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 transition-all font-bold" value={tool.trust_score} onChange={(e) => setTool({...tool, trust_score: parseInt(e.target.value)})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 tracking-widest">Deployment Status</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-2xl p-5 outline-none focus:border-blue-600 transition-all font-bold text-zinc-400" value={tool.status} onChange={(e) => setTool({...tool, status: e.target.value})}>
                <option value="VERIFIED_NODE">Verified / Live</option>
                <option value="OFFLINE">Offline / Maintenance</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-6 rounded-[2.5rem] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-4 disabled:opacity-50 group">
            {loading ? <Activity className="animate-spin" size={24}/> : <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-500" />}
            {loading ? "Establishing Neural Link..." : "Deploy to Mainframe"}
          </button>
        </form>

        <p className="mt-12 text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.5em]">
           AI Sentry Operations &copy; 2026
        </p>
      </div>
    </div>
  );
}