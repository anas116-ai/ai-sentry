"use client";
import { useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase'; 
import AuthModal from './components/AuthModal';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchTools();
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchFavorites(session.user.id);
      else setFavorites([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchFavorites(user.id);
  }

  async function fetchTools() {
    setLoading(true);
    const { data } = await supabase.from('tools').select('*').order('launched_at', { ascending: false });
    if (data) setTools(data);
    setTimeout(() => setLoading(false), 800); // Luxury delay for skeleton
  }

  async function fetchFavorites(userId: string) {
    const { data } = await supabase.from('user_favorites').select('tool_id').eq('user_id', userId);
    if (data) setFavorites(data.map(f => f.tool_id));
  }

  const toggleFavorite = async (id: string) => {
    if (!user) { setIsAuthOpen(true); return; }
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites(favorites.filter(f => f !== id));
      await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('tool_id', id);
    } else {
      setFavorites([...favorites, id]);
      await supabase.from('user_favorites').insert({ user_id: user.id, tool_id: id });
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter(t => {
      const matchesCat = activeCategory === 'All' || t.category === activeCategory;
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = showFavoritesOnly ? favorites.includes(t.id.toString()) : true;
      return matchesCat && matchesSearch && matchesFav;
    });
  }, [activeCategory, searchQuery, tools, showFavoritesOnly, favorites]);

  const categories = useMemo(() => {
    const cats = [...new Set(tools.map(t => t.category))].sort((a, b) => a.localeCompare(b));
    return ['All', ...cats];
  }, [tools]);

  return (
    <div className="flex h-screen text-slate-300 overflow-hidden font-sans relative" 
         style={{ background: 'radial-gradient(circle at 50% -20%, #0d1224 0%, #020308 80%)' }}>
      
      {/* 🔮 Cosmic Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-600/5 blur-[100px] rounded-full opacity-50"></div>
      </div>

      {/* 🚀 CLASSY SIDEBAR */}
      <aside className="w-72 bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col z-30">
        <div className="p-10 pb-6">
          <div className="flex items-center gap-3">
             <div className="w-1 h-7 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1] animate-pulse"></div>
             <h2 className="text-xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-md">AI SENTRY</h2>
          </div>
          <p className="text-[9px] text-slate-500 font-bold tracking-[0.4em] mt-3 pl-4 uppercase">Neural Hub</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar py-4">
          {categories.map(cat => {
            const count = tools.filter(t => t.category === cat).length;
            return (
              <button 
                key={cat} 
                onClick={() => { setActiveCategory(cat); setShowFavoritesOnly(false); }}
                className={`w-full text-left px-5 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between group ${activeCategory === cat && !showFavoritesOnly ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/10' : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'}`}
              >
                {cat}
                <span className={`text-[9px] font-mono ${activeCategory === cat ? 'opacity-100' : 'opacity-20'}`}>
                  {cat === 'All' ? tools.length : count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
            <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl border transition-all duration-500 ${showFavoritesOnly ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-transparent text-slate-500 hover:text-white'}`}>
                <span className={`text-xl transition-all ${showFavoritesOnly ? 'drop-shadow-[0_0_12px_#ef4444] scale-110' : 'opacity-20'}`}>❤️</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">Favorites Vault</span>
            </button>
        </div>
      </aside>

      {/* 💎 MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative z-10">
        
        {/* PREMIUM HEADER */}
        <header className="h-20 flex items-center justify-between px-10 border-b border-white/5 bg-[#020308]/40 backdrop-blur-xl z-20">
          <div className="flex flex-col">
             <span className="text-[9px] font-black text-indigo-500/40 tracking-[0.3em] uppercase">Status: Online</span>
             <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <span className="text-xl font-bold text-white tracking-tighter tabular-nums">{filteredTools.length} Nodes</span>
             </div>
          </div>

          {/* LUXURY WIDE SEARCH */}
          <div className="w-[55%] relative group">
            <input 
                type="text" 
                placeholder="Query intelligence..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-3.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all text-sm placeholder:text-slate-700 text-white shadow-2xl" 
            />
          </div>

          <div className="flex items-center gap-6">
             {user ? (
               <div className="flex items-center gap-4 bg-white/[0.02] p-1.5 px-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-indigo-400 font-mono tracking-tighter uppercase">{user.email.split('@')[0]}</span>
                  <button onClick={() => supabase.auth.signOut()} className="text-[9px] font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-[0.2em]">Logout</button>
               </div>
             ) : (
               <button onClick={() => setIsAuthOpen(true)} className="bg-white text-black text-[11px] font-black px-10 py-3.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] uppercase tracking-widest">
                  LOGIN
               </button>
             )}
          </div>
        </header>

        {/* TOOL GRID */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-white/[0.02] rounded-[32px] border border-white/5 animate-pulse"></div>)}
            </div>
          ) : filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {filteredTools.map((tool) => {
                const isNew = (new Date().getTime() - new Date(tool.launched_at || '2020-01-01').getTime()) < (30 * 24 * 60 * 60 * 1000);
                return (
                  <div key={tool.id} className="group relative bg-[#111116]/40 border border-white/[0.05] rounded-[32px] p-8 hover:bg-[#16161c] hover:border-indigo-500/30 hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between shadow-xl shadow-black/20">
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1 text-left">
                          <div className="flex items-center gap-2">
                             <span className="text-[9px] text-indigo-400 font-bold tracking-[0.2em] uppercase">{tool.category}</span>
                             {isNew && <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full animate-pulse border border-indigo-500/20">NEW</span>}
                          </div>
                          <h3 className="text-xl font-semibold text-white/90 group-hover:text-white transition-colors tracking-tight leading-tight">{tool.name}</h3>
                        </div>
                        <button onClick={() => toggleFavorite(tool.id.toString())} className="p-1 hover:scale-125 transition-transform duration-300">
                            <svg className={`w-6 h-6 transition-all duration-500 ${favorites.includes(tool.id.toString()) ? 'fill-red-500 text-red-500 filter drop-shadow-[0_0_10px_#ef4444]' : 'text-slate-700 opacity-40 hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                      </div>

                      <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-3 text-left font-medium">
                        {tool.description}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                        <span className="text-[10px] font-bold text-slate-600 font-mono tracking-widest uppercase">
                           AI {tool.category} System
                        </span>
                        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold text-white/20 hover:text-indigo-400 transition-all uppercase tracking-[0.2em] group/btn">
                           Launch <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                        </a>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 animate-in fade-in duration-700">
               <span className="text-5xl mb-4">🔍</span>
               <p className="text-xs font-bold uppercase tracking-[0.4em]">No Results in Network</p>
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); checkUser(); }} />
    </div>
  );
}