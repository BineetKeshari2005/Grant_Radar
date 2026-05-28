'use client';

import React, { useState, useEffect } from 'react';
import { OpportunityFilters, PaginatedResponse, Opportunity } from '@/types';
import FilterBar from '@/components/opportunities/FilterBar';
import OpportunityCard from '@/components/opportunities/OpportunityCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { addDays, startOfWeek, format, isSameDay } from 'date-fns';
import { LayoutGrid, Calendar as CalendarIcon, Search } from 'lucide-react';

export default function Dashboard() {
  const [filters, setFilters] = useState<OpportunityFilters>({ page: 1, pageSize: 12 });
  const [response, setResponse] = useState<PaginatedResponse<Opportunity> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [stats, setStats] = useState({ activeOpportunities: 0, savedOpportunities: 0, deadlinesThisWeek: 0 });
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any>(null);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [sortParam, setSortParam] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const { showToast } = useToast();

  // Load stats on mount
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to load stats', e);
      }
    }
    loadStats();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (filters.ai_mode && filters.search) {
        res = await fetch('/api/search/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: filters.search, ...filters, sort: sortParam })
        });
      } else {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            params.append(key, String(val));
          }
        });
        params.append('sort', sortParam);
        res = await fetch(`/api/opportunities?${params.toString()}`);
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch opportunities');
      }
      const data = await res.json();
      setResponse(data);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [filters, sortParam]);

  // Handle Scrape
  const handleScrapeNow = async () => {
    setShowScrapeModal(true);
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch('/api/scrape/run', { method: 'POST' });
      const data = await res.json();
      setScrapeResult(data);
      if (res.ok) {
        loadOpportunities();
        const statsRes = await fetch('/api/dashboard/stats');
        if (statsRes.ok) setStats(await statsRes.json());
        showToast('Scrape completed successfully', 'success');
      } else {
        throw new Error(data.error || 'Scrape failed');
      }
    } catch (e: any) {
      setScrapeResult({ error: e.message || 'An error occurred during scraping' });
      showToast(e.message || 'Scrape failed', 'error');
    } finally {
      setScraping(false);
    }
  };

  const handleFiltersChange = (updates: Partial<OpportunityFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const totalPages = response ? Math.ceil(response.total / response.pageSize) : 0;

  return (
    <div className="w-full min-h-screen relative overflow-hidden bg-slate-50/30">
      {/* Beautiful Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-[120px]" />
        <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-cyan-400/10 blur-[120px]" />
      </div>
      {/* SCRAPE MODAL */}
      <AnimatePresence>
        {showScrapeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl rounded-[2rem] p-8 relative bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden"
            >
              {/* Background gradient blob for the modal */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/20 rounded-full blur-[80px] pointer-events-none" />

              {!scraping && (
                <button onClick={() => setShowScrapeModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors bg-white/50 hover:bg-white rounded-full p-2 z-10 shadow-sm border border-slate-100">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
              
              <div className="flex flex-col items-center text-center mt-2 mb-8 relative z-10">
                <div className="mb-6">
                  {scraping ? (
                    <div className="relative w-24 h-24 flex items-center justify-center mx-auto">
                      <div className="absolute inset-0 rounded-full border-2 border-blue-200" />
                      <div className="absolute inset-2 rounded-full border-2 border-blue-100" />
                      <div className="absolute inset-4 rounded-full border-2 border-blue-50" />
                      {/* Radar sweep */}
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_70%,rgba(37,99,235,0.3)_100%)] origin-center"
                        style={{ borderRadius: "50%" }}
                      />
                      {/* Center dot */}
                      <div className="w-4 h-4 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] relative z-10" />
                    </div>
                  ) : scrapeResult?.error ? (
                    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center border-2 border-red-200 shadow-lg shadow-red-500/20 mx-auto">
                      <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center border-2 border-emerald-200 shadow-lg shadow-emerald-500/20 mx-auto">
                      <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  {scraping ? 'Scraping Opportunities...' : scrapeResult?.error ? 'Scrape Failed' : 'Scrape Complete! 🎉'}
                </h2>
                
                {scraping && (
                  <div className="w-full max-w-md mx-auto mt-2">
                    <p className="text-slate-500 font-medium text-sm mb-4 animate-pulse">Scanning OpportunityDesk, YouthOp, and Devpost...</p>
                  </div>
                )}
              </div>
              
              {!scraping && scrapeResult && !scrapeResult.error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="text-3xl font-black text-slate-900 mb-1">{scrapeResult.found || 0}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Found</div>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm">
                      <div className="text-3xl font-black text-emerald-600 mb-1">+{scrapeResult.added || 0}</div>
                      <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider">New</div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm">
                      <div className="text-3xl font-black text-blue-600 mb-1">{scrapeResult.aiProcessed || 0}</div>
                      <div className="text-xs font-bold text-blue-600/70 uppercase tracking-wider">Analyzed</div>
                    </div>
                  </div>
                  
                  {scrapeResult.sources && scrapeResult.sources.length > 0 && (
                    <div className="border border-slate-100 rounded-2xl p-5 bg-white/50 shadow-sm">
                      <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-4">Sources Processed</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {scrapeResult.sources.map((s: any, idx: number) => (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.1 }} key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-50 shadow-sm">
                            <span className="text-slate-700 font-bold">{s.name}</span>
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${s.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              {s.status}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={() => setShowScrapeModal(false)} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-lg">
                    View New Opportunities
                  </button>
                </motion.div>
              )}
              
              {!scraping && scrapeResult?.error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-5 text-red-600 font-medium text-sm text-center relative z-10 shadow-sm">
                  {scrapeResult.error}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PREMIUM HERO SECTION */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract Background Image */}
        <div className="absolute inset-0 -z-10 mix-blend-multiply">
          <img 
            src="/hero-bg.png" 
            alt="Neural Network Abstract Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-50/30"></div>
        </div>
        
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Left side content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 space-y-8 z-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-700 text-sm font-medium backdrop-blur-sm shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Real-Time Intelligence Feed
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-slate-900 tracking-tight">
                Discover Global <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 drop-shadow-sm">Funding Opportunities</span>
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-600 max-w-xl leading-relaxed">
                AI-powered intelligence platform that aggregates and analyzes grants, fellowships, and accelerator programs worldwide — so your team never misses a funding opportunity.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm bg-gradient-to-br ${['from-blue-400 to-blue-600', 'from-indigo-400 to-indigo-600', 'from-purple-400 to-purple-600', 'from-cyan-400 to-cyan-600'][i-1]}`}>
                      {['JD', 'AL', 'MR', 'SK'][i-1]}
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-slate-500">
                  Trusted by <span className="text-slate-900 font-bold">2,000+</span> organizations
                </div>
              </div>
            </motion.div>
            
            {/* STATS GRID - ANIMATED */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15
                  }
                }
              }}
              className="flex-1 w-full grid grid-cols-2 gap-4 sm:gap-6 z-10"
            >
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
                className="ui-card bg-white rounded-2xl p-6 min-w-[150px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300"
              >
                <div className="text-sm font-medium text-slate-500 mb-2">Active Opportunities</div>
                <div className="text-3xl font-bold text-slate-900">{stats.activeOpportunities}</div>
              </motion.div>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
                className="ui-card bg-white rounded-2xl p-6 min-w-[150px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300"
              >
                <div className="text-sm font-medium text-slate-500 mb-2">Saved by You</div>
                <div className="text-3xl font-bold text-blue-600">{stats.savedOpportunities}</div>
              </motion.div>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
                className="ui-card bg-white rounded-2xl p-6 min-w-[150px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300"
              >
                <div className="text-sm font-medium text-slate-500 mb-2">Deadlines This Week</div>
                <div className="text-3xl font-bold text-orange-600">{stats.deadlinesThisWeek}</div>
              </motion.div>
              
              <motion.div 
                variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }}
                className="ui-card bg-white rounded-2xl p-6 min-w-[150px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-all duration-300 flex flex-col justify-center"
              >
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  <span className="font-medium">Updated</span>
                </div>
                <div className="text-lg font-bold text-slate-900">Daily via AI</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        
        {/* Restored Horizontal Filter Bar */}
        <FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
        
        {/* Results Info & Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 mb-6 gap-4">
          <div className="text-slate-600 font-medium">
            {loading ? 'Finding opportunities...' : `Found `}<span className="font-bold text-slate-900">{response?.total || 0} opportunities</span>{loading ? '' : ` tailored to your profile.`}
          </div>
          <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={handleScrapeNow}
                disabled={scraping}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all font-bold rounded-xl"
              >
                {scraping ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scraping...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Scrape Opportunity
                  </>
                )}
              </button>
            <div className="flex bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-lg p-1 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <LayoutGrid size={16} /> Grid
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <CalendarIcon size={16} /> Calendar
              </button>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-slate-500">Sort by:</span>
              <select 
                className="bg-white border border-slate-200 text-sm font-medium text-slate-700 rounded-lg px-3 py-1.5 outline-none hover:bg-slate-50 cursor-pointer"
                value={sortParam}
                onChange={(e) => setSortParam(e.target.value)}
              >
                <option value="newest">Relevance</option>
                <option value="deadline">Deadline soon</option>
                <option value="funding">Funding high</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Grid / State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="ui-card h-72 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100">
            <div className="text-red-500 mb-4 font-medium">{error}</div>
            <button onClick={loadOpportunities} className="btn-primary">Try Again</button>
          </div>
        ) : response?.data.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No opportunities found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or running the scraper.</p>
            
            <div className="flex flex-wrap gap-2 justify-center mb-8 max-w-md mx-auto">
               <button onClick={() => handleFiltersChange({ search: 'Women founder grants', ai_mode: true, page: 1 })} className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                 "Women founder grants"
               </button>
               <button onClick={() => handleFiltersChange({ search: 'AI fellowships for students', ai_mode: true, page: 1 })} className="px-4 py-2 rounded-full border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                 "AI fellowships for students"
               </button>
            </div>

            <button 
              onClick={() => handleFiltersChange({ search: '', category: undefined, country: undefined, remote_type: undefined, ai_mode: false, page: 1 })}
              className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView opportunities={response?.data || []} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {response?.data.map((opp, idx) => (
              <OpportunityCard key={opp.id} opportunity={opp} index={idx} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              disabled={filters.page === 1 || loading}
              onClick={() => handleFiltersChange({ page: (filters.page || 1) - 1 })}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm transition-colors"
            >
              Previous
            </button>
            <span className="text-slate-500 font-medium text-sm">
              Page {filters.page} of {totalPages}
            </span>
            <button
              disabled={filters.page === totalPages || loading}
              onClick={() => handleFiltersChange({ page: (filters.page || 1) + 1 })}
              className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 shadow-sm transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

// Light Mode Calendar View
function CalendarView({ opportunities }: { opportunities: Opportunity[] }) {
  const startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 28 }).map((_, i) => addDays(startDate, i));

  const dateMap: Record<string, Opportunity[]> = {};
  opportunities.forEach(opp => {
    if (!opp.deadline) return;
    const oppDate = new Date(opp.deadline);
    const key = format(oppDate, 'yyyy-MM-dd');
    if (!dateMap[key]) dateMap[key] = [];
    dateMap[key].push(opp);
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedOpps = selectedDate ? dateMap[selectedDate] || [] : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
       <div className="ui-card bg-white rounded-2xl p-6 lg:w-[60%]">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
             <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-3">
             {days.map(day => {
               const key = format(day, 'yyyy-MM-dd');
               const oppsForDay = dateMap[key] || [];
               const hasDeadlines = oppsForDay.length > 0;
               const isSelected = selectedDate === key;
               const isToday = isSameDay(day, new Date());

               return (
                 <div 
                   key={key}
                   onClick={() => hasDeadlines && setSelectedDate(isSelected ? null : key)}
                   className={`relative h-24 rounded-xl border p-2 transition-all cursor-pointer ${
                     isSelected ? 'bg-blue-50 border-blue-500 shadow-[0_0_0_2px_rgba(37,99,235,0.2)]' :
                     hasDeadlines ? 'bg-slate-50 border-slate-200 hover:border-blue-300' : 
                     'bg-white border-slate-100 opacity-50 cursor-default'
                   } ${isToday && !isSelected ? 'ring-2 ring-slate-200 ring-offset-2' : ''}`}
                 >
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-600' : 'text-slate-600'}`}>
                      {format(day, 'd')}
                    </span>
                    {hasDeadlines && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold border border-orange-200 shadow-sm">
                        {oppsForDay.length}
                      </div>
                    )}
                 </div>
               );
             })}
          </div>
       </div>

       <div className="lg:w-[40%] flex flex-col gap-4">
          {!selectedDate ? (
            <div className="ui-card bg-slate-50 rounded-2xl p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
               <CalendarIcon className="w-12 h-12 mb-4 text-slate-300" />
               <p className="font-medium">Select a date with deadlines to view details.</p>
            </div>
          ) : selectedOpps.length > 0 ? (
            <div className="space-y-4">
               <h3 className="font-bold text-slate-900 mb-2">Deadlines on {format(new Date(selectedDate), 'MMMM do')}</h3>
               {selectedOpps.map((opp, idx) => (
                 <OpportunityCard key={opp.id} opportunity={opp} index={idx} />
               ))}
            </div>
          ) : null}
       </div>
    </div>
  );
}


