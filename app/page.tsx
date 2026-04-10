"use client";
import { useEffect, useState } from 'react';
import { supabase } from './supabase'; 
import AuthModal from './components/AuthModal';

export default function HomePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
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
    const { data } = await supabase.from('tools').select('*').order('launched_at', { ascending: false });
    if (data) { setTools(data); setFilteredTools(data); }
  }

  async function fetchFavorites(userId: string) {
    const { data } = await supabase.from('user_favorites').select('tool_id').eq('user_id', userId);
    if (data) setFavorites(data.map(f => f.tool_id));
  }

  const toggleFavorite = async (id: string) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites(favorites.filter(f => f !== id));
      await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('tool_id', id);
    } else {
      setFavorites([...favorites, id]);
      await supabase.from('user_favorites').insert({ user_id: user.id, tool_id: id });
    }
  };

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => { setSearchQuery(e.results[0][0].transcript); setIsListening(false); };
    recognition.start();
  };

  useEffect(() => {
    let result = tools;
    if (activeCategory !== 'All') result = result.filter(t => t.category === activeCategory);
    if (searchQuery) result = result.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (showFavoritesOnly) result = result.filter(t => favorites.includes(t.id.toString()));
    setFilteredTools(result);
  }, [activeCategory, searchQuery, tools, showFavoritesOnly, favorites]);

  const categories = ['All', ...new Set(tools.map(t => t.category))];

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      
      {/* SIDEBAR - Width Increased to 80 */}
      <aside className="w-80 bg-[#050505] border-r border-white/[0.05] flex flex-col p-8 z-20 shadow-2xl">
        <div className="mb-12">
          <h2 className="text-2xl font-black tracking-tighter italic bg-gradient-to-r from-white to-blue-500 bg-clip-text text-transparent uppercase tracking-[0.1em]">AI SENTRY</h2>
          <div className="h-[1px] w-full bg-blue-500/20 mt-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]"></div>
        </div>
        
        <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
          <p className="text-[10px] text-white/20 uppercase font-bold tracking-[0.2em] mb-6 px-4">Workspace Hub</p>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => { setActiveCategory(cat); setShowFavoritesOnly(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-lg transition-all duration-500 ${activeCategory === cat && !showFavoritesOnly ? 'bg-white/5 text-white border border-white/10 shadow-lg' : 'text-white/30 hover:text-white hover:translate-x-1'}`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Favorites Section with High Glow */}
        <div className="mt-auto pt-6 border-t border-white/5">
            <button 
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-4 group w-full"
            >
                <span className={`text-2xl transition-all duration-300 ${showFavoritesOnly ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,1)] scale-110' : 'text-white/20'}`}>❤️</span>
                <span className={`text-xs font-bold tracking-widest uppercase transition-colors ${showFavoritesOnly ? 'text-white' : 'text-white/30 group-hover:text-white'}`}>My Favorites</span>
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#020202]">
        {/* Deep UI Glow Effects */}
        <div className="absolute top-[-15%] left-[20%] w-[700px] h-[700px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[0%] w-[500px] h-[500px] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* LUXURY HEADER */}
        <header className="h-24 flex items-center justify-between px-12 border-b border-white/[0.05] bg-[#020202]/50 backdrop-blur-3xl z-10">
          
          {/* ⚡ NEW TOOLS COUNT DISPLAY */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">System Status</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                <span className="text-sm font-bold text-white/80 uppercase tracking-tighter">Active Nodes</span>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg shadow-inner">
                <span className="text-xl font-black text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)]">
                    {filteredTools.length < 10 ? `0${filteredTools.length}` : filteredTools.length}
                </span>
            </div>
          </div>

          <div className="w-1/3 relative flex items-center bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-3 focus-within:border-blue-500/40 transition-all duration-500">
            <input 
                type="text" 
                placeholder="Intelligence search..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="bg-transparent border-none focus:outline-none text-sm w-full placeholder:text-white/10" 
            />
            <button onClick={startVoiceSearch} className={`text-lg transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-white/20 hover:text-white'}`}>
              🎤
            </button>
          </div>

          <div className="flex items-center gap-8">
             {user ? (
               <div className="flex items-center gap-4 bg-white/[0.03] pl-5 pr-2 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/80 leading-tight">{user.email.split('@')[0].toUpperCase()}</span>
                    <span className="text-[7px] font-bold text-blue-500 tracking-tighter">AUTH_VERIFIED</span>
                 </div>
                 <button onClick={() => supabase.auth.signOut()} className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white text-[9px] font-black px-4 py-2 rounded-full transition-all duration-500 tracking-widest">LOGOUT</button>
               </div>
             ) : (
               <button onClick={() => setIsAuthOpen(true)} className="text-[11px] font-bold uppercase bg-white text-black px-8 py-3 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Access Portal
               </button>
             )}
          </div>
        </header>

        {/* 3-COLUMN DISCOVERY GRID */}
        <div className="flex-1 overflow-y-auto p-12 no-scrollbar relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTools.map((tool) => (
              <div key={tool.id} className="group relative bg-white/[0.01] border border-white/[0.05] rounded-[35px] p-8 hover:bg-white/[0.03] hover:border-blue-500/30 transition-all duration-700 shadow-2xl">
                
                <div className="flex justify-between items-start mb-6 text-left">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-blue-500 font-black tracking-[0.25em] uppercase drop-shadow-sm">{tool.category}</span>
                    <h3 className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-white transition-colors">{tool.name}</h3>
                  </div>
                  <button onClick={() => toggleFavorite(tool.id.toString())} className="text-xl transition-all duration-300 hover:scale-125 active:scale-150">
                    {favorites.includes(tool.id.toString()) ? 
                      <span className="text-red-500 drop-shadow-[0_0_15px_#ef4444]">❤️</span> : 
                      <span className="text-white/10 hover:text-white/40">❤️</span>
                    }
                  </button>
                </div>

                <p className="text-sm text-white/30 leading-relaxed mb-8 line-clamp-3 font-medium italic text-left">
                  {tool.description}
                </p>

                <div className="bg-black/50 rounded-[22px] p-5 mb-8 border border-white/[0.03] shadow-inner group-hover:border-blue-500/10 transition-colors">
                    <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter leading-relaxed">
                      <span className="text-blue-500 mr-2 underline decoration-blue-500/30 underline-offset-4 tracking-normal font-black">CORE CAPABILITY:</span> 
                      Advanced {tool.category} neural-processing system.
                    </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest font-mono">
                        {tool.launched_at ? new Date(tool.launched_at).getFullYear() : '2026'} PROTOCOL
                    </span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping opacity-70 shadow-[0_0_5px_#3b82f6]"></span>
                  </div>
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-white/20 hover:text-blue-400 tracking-[0.15em] uppercase transition-all duration-300 group-hover:translate-x-1">
                    Launch Node →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => { setIsAuthOpen(false); checkUser(); }} />
    </div>
  );
}