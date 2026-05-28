'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit, User, Briefcase, MapPin, GraduationCap, Code, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import './analyzer.css';

export default function LinkedInAnalyzer() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze profile.');
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="analyzer-root">
      <div className="analyzer-bg-blob" />
      <div className="analyzer-container">
        {/* Header */}
        <header className="analyzer-header">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="analyzer-badge">
            <Sparkles size={16} /> AI-Powered Matching
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="analyzer-title">
            LinkedIn Profile Analyzer
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="analyzer-subtitle">
            Paste your LinkedIn profile text, URL, or simply describe your professional background, and our AI will find the perfect opportunities for you.
          </motion.p>
        </header>

        {/* Input Section */}
        {!results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8">
              <label className="block text-sm font-bold text-slate-700 mb-3">Paste Profile Data or Description</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. Software Engineer with 5 years of experience in Python and Machine Learning, based in India."
                className="w-full h-48 p-5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-0 text-slate-700 placeholder:text-slate-400 resize-none transition-colors"
              />
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 border border-red-100 rounded-xl flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle size={18} /> {error}
                </div>
              )}
            </div>
            <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!input.trim()}
                className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30"
              >
                <BrainCircuit size={20} /> Analyze Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto py-24 flex flex-col items-center justify-center text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="w-20 h-20 bg-blue-50 rounded-2xl border-4 border-blue-600 border-t-transparent flex items-center justify-center mb-8 shadow-xl">
              <BrainCircuit className="text-blue-600" size={32} />
            </motion.div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Analyzing Your Profile</h3>
            <p className="text-slate-500 font-medium animate-pulse">Extracting skills, assessing experience, and matching opportunities...</p>
          </motion.div>
        )}

        {/* Results Section */}
        {results && !isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-12 gap-8">
            {/* Left: Profile Summary */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-extrabold text-lg text-slate-900">Your Profile</h3>
                  <button onClick={() => setResults(null)} className="text-sm font-bold text-blue-600 hover:text-blue-700">Edit / Reset</button>
                </div>
                <div className="space-y-5">
                  {/* Name */}
                  <div className="flex gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl h-fit"><User size={18} className="text-slate-500" /></div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Name</p>
                      <p className="font-bold text-slate-900">{results.profile.name || 'Anonymous'}</p>
                    </div>
                  </div>
                  {/* Experience */}
                  <div className="flex gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl h-fit"><Briefcase size={18} className="text-slate-500" /></div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Experience</p>
                      <p className="font-bold text-slate-900 capitalize">{results.profile.experience_level || 'Unknown'} level {results.profile.experience_years ? `(${results.profile.experience_years} yrs)` : ''}</p>
                      <p className="text-sm text-slate-500 font-medium">{results.profile.current_title}</p>
                    </div>
                  </div>
                  {/* Location */}
                  <div className="flex gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl h-fit"><MapPin size={18} className="text-slate-500" /></div>
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Location</p>
                      <p className="font-bold text-slate-900">{results.profile.location || 'Not specified'}</p>
                    </div>
                  </div>
                  {/* Top Skills */}
                  <div className="flex gap-3">
                    <div className="bg-slate-50 p-2.5 rounded-xl h-fit"><Code size={18} className="text-slate-500" /></div>
                    <div className="w-full">
                      <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">Top Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {results.profile.skills.length > 0 ? (
                          results.profile.skills.slice(0, 8).map((skill: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">{skill}</span>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 font-medium">No skills extracted</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Matches */}
            <div className="lg:col-span-8">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles className="text-yellow-500" /> Top Matches for You
              </h2>
              {results.matches.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                  <AlertTriangle size={48} className="mx-auto text-orange-400 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No strong matches found</h3>
                  <p className="text-slate-500">Try adding more details to your profile or wait for new opportunities to be added.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.matches.map((match: any, index: number) => (
                    <motion.div key={match.opportunity.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Score Circle */}
                        <div className="shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full bg-slate-50 border-4 border-slate-100 relative">
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="44" cy="44" r="44" fill="none" stroke="currentColor" className="text-slate-100" strokeWidth="8" />
                            <circle cx="44" cy="44" r="44" fill="none" stroke="currentColor" className={match.matchScore >= 80 ? "text-emerald-500" : match.matchScore >= 60 ? "text-blue-500" : "text-yellow-500"} strokeWidth="8" strokeDasharray="276.46" strokeDashoffset={276.46 - (276.46 * match.matchScore) / 100} strokeLinecap="round" />
                          </svg>
                          <span className="text-2xl font-black text-slate-900 z-10">{match.matchScore}%</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10 -mt-1">Match</span>
                        </div>
                        {/* Opportunity Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-slate-100 text-slate-600">{match.opportunity.category.replace('_', ' ')}</span>
                            {match.opportunity.funding_amount && (
                              <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">{match.opportunity.funding_amount}</span>
                            )}
                          </div>
                          <h3 className="text-xl font-extrabold text-slate-900 mb-2 leading-tight">{match.opportunity.title}</h3>
                          <p className="text-slate-500 text-sm font-semibold mb-4 flex items-center gap-1.5"><Briefcase size={14} /> {match.opportunity.organization}</p>
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                            <p className="text-sm text-blue-900 flex items-start gap-2"><CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" /> <span className="font-medium leading-relaxed">{match.explanation}</span></p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {match.opportunity.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="text-xs font-bold text-slate-400">#{tag}</span>
                              ))}
                            </div>
                            <Link href={`/opportunities/${match.opportunity.id}`} className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
                              View Details <ArrowRight size={16} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
