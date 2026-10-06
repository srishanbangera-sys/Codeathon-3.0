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
    <div className="space-y-8 page-enter max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-primary-dark)]">Settings</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">Manage your account and integrations.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
           <div className="font-bold text-[var(--color-text-primary)]">Profile</div>
           <p className="text-sm text-[var(--color-text-secondary)]">Your personal information and account details.</p>
        </div>
        <div className="md:col-span-2">
           <div className="card p-6">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-2xl font-bold text-[var(--color-primary-dark)]">
                   {user?.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-[var(--color-text-secondary)]">{user?.email}</p>
                 </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-[var(--color-border-light)]">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Account ID</span>
                    <span className="text-sm text-[var(--color-text-muted)] font-mono">{user?.id}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Member Since</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                       {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
      <div className="w-full h-px bg-[var(--color-border-light)]"></div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-2">
           <div className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <BookMarked size={18} className="text-[var(--color-primary)]" />
              Browser Extension
           </div>
           <p className="text-sm text-[var(--color-text-secondary)]">
             Connect the StudyPilot browser extension to bookmark study resources directly from the web.
           </p>
        </div>
        <div className="md:col-span-2 space-y-6">
           <div className="card p-6">
              <h3 className="font-bold text-[var(--color-primary-dark)] mb-4 flex items-center gap-2">
                 <Key size={18} /> API Access Token
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Paste this token into the browser extension settings to link it to your account. Keep it secret!
              </p>
              
              <div className="flex gap-2 mb-4">
                 <div className="flex-1 bg-gray-50 border border-[var(--color-border)] rounded-lg px-3 py-2 font-mono text-xs text-[var(--color-text-muted)] truncate select-all flex items-center">
                    {token}
                 </div>
                 <button onClick={copyToClipboard} className="btn btn-primary h-10 px-4 shrink-0">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                 </button>
              </div>
              
              <div className="flex justify-end pt-4 border-t border-[var(--color-border-light)]">
                 <button 
                   onClick={regenerateToken} 
                   disabled={regenerating}
                   className="btn btn-outline btn-sm text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                 >
                   <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                   Regenerate Token
                 </button>
              </div>
           </div>
           
           <div className="card p-6 bg-gradient-to-br from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white border-0">
              <h3 className="font-bold text-lg mb-2">Get the Extension</h3>
              <p className="text-white/80 text-sm mb-6">
                Save YouTube tutorials, PDF documents, and Wikipedia articles straight to your subjects and topics.
              </p>
              <button className="btn btn-secondary w-full sm:w-auto text-sm">
                <Download size={16} /> Download for Chrome
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
