'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const options = [
    { name: 'Go to Dashboard', action: () => router.push('/') },
    { name: 'Go to Tracker', action: () => router.push('/saved') },
    { name: 'Run Scraper', action: () => {
        router.push('/?scrape=true');
    } },
  ];

  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-white/5">
              <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                type="text"
                placeholder="Search commands..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-slate-500 text-lg"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="text-xs text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">ESC</span>
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
              {filtered.length > 0 ? (
                filtered.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      opt.action();
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-colors focus:bg-white/5 focus:outline-none"
                  >
                    {opt.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-slate-500">
                  No commands found.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
