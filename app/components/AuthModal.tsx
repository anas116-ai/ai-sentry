"use client";
import { useState } from 'react';
import { supabase } from '../supabase';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
      }
    });

    if (error) {
      console.error("Login error:", error.message);
      alert("Login Error: " + error.message);
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Welcome to AI-Sentry</h2>
        
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition-all font-semibold text-gray-700"
        >
          <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
          {loading ? "Connecting..." : "Continue with Google"}
        </button>

        <button 
          onClick={onClose}
          className="w-full mt-4 text-gray-500 text-sm hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}