// AuthModal.tsx update
import { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthModal({ isOpen, onClose }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else onClose();
  };

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Check email or try login!");
    else alert("Success!");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#050505] border border-white/10 p-8 rounded-[30px] w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Access Portal</h2>
        
        <form className="space-y-4 mb-6">
          <input 
            type="email" placeholder="Email" value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <input 
            type="password" placeholder="Password" value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-blue-500"
          />
          <div className="flex gap-2">
            <button onClick={handleLogin} className="flex-1 bg-blue-600 p-3 rounded-xl font-bold hover:bg-blue-700 transition">Login</button>
            <button onClick={handleSignUp} className="flex-1 border border-white/10 p-3 rounded-xl font-bold hover:bg-white/5 transition">Sign Up</button>
          </div>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-white/30">Or continue with</span></div>
        </div>

        <button 
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="w-full flex items-center justify-center gap-3 bg-white text-black p-3 rounded-xl font-bold hover:bg-blue-500 hover:text-white transition duration-500"
        >
          <span>G</span> Continue with Google
        </button>
        
        <button onClick={onClose} className="w-full mt-4 text-white/20 hover:text-white text-sm">Cancel</button>
      </div>
    </div>
  );
}