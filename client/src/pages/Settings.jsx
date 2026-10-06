import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../api';
import toast from 'react-hot-toast';
import { User, Key, Shield, Copy, RefreshCw, Check, BookMarked, Download } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [token, setToken] = useState(localStorage.getItem('studypilot_token'));
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const regenerateToken = async () => {
    if (!confirm('Are you sure? This will log out any extensions currently using the old token.')) return;
    
    try {
      setRegenerating(true);
      const res = await authAPI.regenerateToken();
      const newToken = res.data.data.token;
      setToken(newToken);
      localStorage.setItem('studypilot_token', newToken); // update current session too
      toast.success('Token regenerated successfully');
    } catch (err) {
      toast.error('Failed to regenerate token');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-12 page-enter max-w-[1000px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[#051c24] tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Manage your account and integrations.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
           <div className="font-bold text-[#051c24] text-lg">Profile</div>
           <p className="text-sm text-gray-500 font-medium leading-relaxed">Your personal information and account details.</p>
        </div>
        <div className="md:col-span-2">
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-6 mb-8">
                 <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center text-3xl font-bold text-[#2dc1c1] border border-teal-100">
                   {user?.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-[#051c24]">{user?.name}</h2>
                    <p className="text-gray-500 font-medium mt-1">{user?.email}</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-100">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-[#051c24]">Account ID</span>
                    <span className="text-sm text-gray-500 font-mono font-medium">{user?.id}</span>
                 </div>
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-[#051c24]">Member Since</span>
                    <span className="text-sm text-gray-500 font-medium">
                       {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="w-full h-px bg-gray-200"></div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-3">
           <div className="font-bold text-[#051c24] text-lg flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <BookMarked size={16} strokeWidth={2.5} />
              </div>
              Extension
           </div>
           <p className="text-sm text-gray-500 font-medium leading-relaxed">
             Connect the LearnBuddy browser extension to bookmark study resources directly from the web.
           </p>
        </div>
        <div className="md:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#051c24] text-lg mb-2 flex items-center gap-2">
                 <Key size={20} className="text-gray-400" strokeWidth={2.5} /> API Access Token
              </h3>
              <p className="text-sm text-gray-500 font-medium mb-6">
                Paste this token into the browser extension settings to link it to your account. Keep it secret!
              </p>
              
              <div className="flex gap-3 mb-6">
                 <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-mono text-xs text-gray-500 truncate select-all flex items-center">
                    {token}
                 </div>
                 <button onClick={copyToClipboard} className="bg-[#051c24] hover:bg-gray-800 text-white w-12 h-[42px] rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    {copied ? <Check size={18} strokeWidth={2.5} className="text-[#2dc1c1]" /> : <Copy size={18} strokeWidth={2.5} />}
                 </button>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-100">
                 <button 
                   onClick={regenerateToken} 
                   disabled={regenerating}
                   className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-sm hover:bg-red-50 hover:border-red-300 transition-colors flex items-center gap-2"
                 >
                   <RefreshCw size={16} strokeWidth={2.5} className={regenerating ? 'animate-spin' : ''} />
                   Regenerate Token
                 </button>
              </div>
           </div>
           
           <div className="bg-[#051c24] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#2dc1c1] opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="font-bold text-2xl mb-3 relative z-10">Get the Extension</h3>
              <p className="text-gray-300 text-sm mb-8 relative z-10 leading-relaxed max-w-sm">
                Save YouTube tutorials, PDF documents, and Wikipedia articles straight to your subjects and topics.
              </p>
              <button className="bg-[#2dc1c1] hover:bg-[#1b8c8c] text-white font-bold px-6 py-3 rounded-full flex items-center justify-center gap-2 transition-colors w-full sm:w-auto relative z-10 shadow-sm">
                <Download size={18} strokeWidth={2.5} /> Download for Chrome
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
