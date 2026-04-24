import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // 1. Store in Firestore for record keeping
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      // 2. Call backend API for email (simulated here)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error('Failed to send message via API');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Er is iets misgegaan. Probeer het later opnieuw.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl serif mb-6">Contact</h1>
          <p className="text-xl italic text-brand-ink/60">Laten we samen iets moois creëren.</p>
        </header>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-brand-ink text-brand-offwhite p-12 text-center flex flex-col items-center space-y-6"
          >
            <CheckCircle2 size={48} className="text-green-400" />
            <h2 className="serif text-3xl italic">Bericht verzonden!</h2>
            <p className="opacity-70">Bedankt voor je bericht. Ik neem zo snel mogelijk contact met je op.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="px-8 py-3 border border-white/20 hover:bg-white hover:text-brand-ink transition-colors text-xs uppercase tracking-widest"
            >
              Nog een bericht sturen
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-8">
              <div className="group relative">
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block font-medium">Naam</label>
                <input
                  required
                  type="text"
                  placeholder="Jouw naam"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-4 focus:border-brand-ink outline-none transition-colors text-lg serif placeholder:text-brand-ink/10"
                />
              </div>
              
              <div className="group relative">
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block font-medium">Email</label>
                <input
                  required
                  type="email"
                  placeholder="hallo@voorbeeld.be"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-4 focus:border-brand-ink outline-none transition-colors text-lg serif placeholder:text-brand-ink/10"
                />
              </div>

              <div className="group relative">
                <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-2 block font-medium">Bericht</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Vertel me over je plannen..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-transparent border-b border-brand-ink/10 py-4 focus:border-brand-ink outline-none transition-colors text-lg serif placeholder:text-brand-ink/10 resize-none overflow-hidden"
                />
              </div>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm italic">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-5 bg-brand-accent text-brand-ink text-xs uppercase tracking-[0.3em] hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center space-x-4 rounded-sm font-bold"
            >
              <span>{status === 'loading' ? 'Verzenden...' : 'Bericht verzenden'}</span>
              <Send size={14} />
            </button>
          </form>
        )}

        <div className="mt-32 pt-16 border-t border-brand-ink/5 grid grid-cols-1 md:grid-cols-2 gap-12 text-center md:text-left">
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-4">Direct Mail</h4>
            <a href="mailto:contact@laureenratinckx.be" className="serif text-xl border-b border-brand-ink hover:pb-1 transition-all">contact@laureenratinckx.be</a>
          </div>
          <div>
            <h4 className="text-[10px] uppercase tracking-widest text-brand-ink/40 mb-4">Instagram</h4>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="serif text-xl border-b border-brand-ink hover:pb-1 transition-all">@laureenratinckx</a>
          </div>
        </div>
      </div>
    </div>
  );
}
