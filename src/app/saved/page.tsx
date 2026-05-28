'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Opportunity } from '@/types';
import { formatDistanceToNow, isPast, format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { LayoutGrid, List, ArrowRight, Target, Clock, CheckCircle } from 'lucide-react';

export interface SavedOpportunity {
  id: string;
  opportunity_id: string;
  application_status: string;
  priority: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  opportunity: Opportunity;
}

export interface TimelineEntry {
  id: string;
  saved_opportunity_id: string;
  status: string;
  note: string | null;
  created_at: string;
}

const COLUMNS = [
  'Saved',
  'Planning to Apply',
  'Applied',
  'Interview',
  'Waitlisted',
  'Accepted',
  'Rejected'
];

export default function TrackerPage() {
  const [savedOpps, setSavedOpps] = useState<SavedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'board' | 'list'>('board');
  const [selectedOpp, setSelectedOpp] = useState<SavedOpportunity | null>(null);
  
  // Timeline state
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [newTimelineNote, setNewTimelineNote] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const res = await fetch('/api/saved');
      if (!res.ok) throw new Error('Failed to load tracker');
      const data = await res.json();
      setSavedOpps(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, field: 'application_status' | 'priority' | 'notes', value: string) => {
    // Optimistic update
    setSavedOpps(prev => prev.map(opp => 
      opp.id === id ? { ...opp, [field]: value } : opp
    ));
    
    // Also update selected opp if open
    if (selectedOpp && selectedOpp.id === id) {
      setSelectedOpp({ ...selectedOpp, [field]: value });
    }

    try {
      await fetch(`/api/saved/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
    } catch (e) {
      console.error('Failed to update', e);
      // Revert on error (simple reload for now)
      fetchSaved();
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this opportunity from your tracker?')) return;
    
    setSavedOpps(prev => prev.filter(opp => opp.id !== id));
    if (selectedOpp && selectedOpp.id === id) setSelectedOpp(null);

    try {
      await fetch(`/api/saved/${id}`, { method: 'DELETE' });
      showToast('Removed from Tracker', 'success');
    } catch (e) {
      console.error('Failed to remove', e);
      showToast('Failed to remove', 'error');
      fetchSaved();
    }
  };

  const fetchTimeline = async (id: string) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/saved/${id}/timeline`);
      if (res.ok) {
         const data = await res.json();
         setTimeline(data);
      }
    } catch (e) {
      console.error('Timeline error', e);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleAddTimeline = async () => {
    if (!selectedOpp) return;
    try {
      const res = await fetch(`/api/saved/${selectedOpp.id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedOpp.application_status, note: newTimelineNote })
      });
      if (res.ok) {
        const entry = await res.json();
        setTimeline([...timeline, entry]);
        setNewTimelineNote('');
      }
    } catch (e) {
      console.error('Add timeline error', e);
    }
  };

  const openPanel = (opp: SavedOpportunity) => {
    setSelectedOpp(opp);
    fetchTimeline(opp.id);
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'bg-red-50 text-red-600 border-red-200';
    if (priority === 'Medium') return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-8" />
        <div className="flex gap-4 overflow-x-auto pb-4">
           {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className="ui-card rounded-xl h-[400px] w-72 shrink-0 animate-pulse bg-white p-4" />
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const totalSaved = savedOpps.length;
  const appliedCount = savedOpps.filter(o => o.application_status === 'Applied').length;
  const acceptedCount = savedOpps.filter(o => o.application_status === 'Accepted').length;

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-32 relative z-10">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">My Tracker</h1>
            <p className="text-slate-500 text-lg">Manage your pipeline of {totalSaved} opportunities.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'board' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <LayoutGrid size={18} /> Board
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
            >
              <List size={18} /> List
            </button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ui-card bg-white p-8 rounded-3xl flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target size={32} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Tracked</p>
                <p className="text-4xl font-extrabold text-slate-900">{totalSaved}</p>
              </div>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ui-card bg-white p-8 rounded-3xl flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Actively Applied</p>
                <p className="text-4xl font-extrabold text-sky-600">{appliedCount}</p>
              </div>
           </motion.div>
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="ui-card bg-white p-8 rounded-3xl flex items-center gap-6 group hover:shadow-xl transition-all">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Accepted</p>
                <p className="text-4xl font-extrabold text-emerald-600">{acceptedCount}</p>
              </div>
           </motion.div>
        </div>

        {savedOpps.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="ui-card bg-white p-16 rounded-[2.5rem] text-center flex flex-col items-center justify-center shadow-lg border border-slate-100">
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <Target size={48} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Your tracker is empty!</h2>
            <p className="text-slate-500 mb-8 max-w-lg text-lg">You haven't saved any opportunities yet. Discover matching grants, scholarships, and fellowships to start building your pipeline.</p>
            <Link href="/" className="btn-primary px-10 py-4 font-semibold text-lg shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
              Browse Opportunities
            </Link>
          </motion.div>
        ) : activeTab === 'board' ? (
          /* KANBAN BOARD */
          <div className="flex gap-6 overflow-x-auto pb-12 snap-x px-2 -mx-2">
            {COLUMNS.map((colName, colIndex) => {
              const columnOpps = savedOpps.filter(o => o.application_status === colName);
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: colIndex * 0.1 }}
                  key={colName} 
                  className="bg-slate-100/80 border border-slate-200 rounded-3xl min-h-[600px] w-80 shrink-0 p-4 snap-start flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                     <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider">{colName}</h3>
                     <span className="bg-white border border-slate-200 text-slate-600 font-bold text-xs py-1 px-2.5 rounded-full shadow-sm">{columnOpps.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
                    {columnOpps.map((opp, i) => {
                       const isUrgent = opp.opportunity.deadline && isPast(new Date(opp.opportunity.deadline));
                       return (
                         <motion.div 
                           whileHover={{ y: -4, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           key={opp.id} 
                           onClick={() => openPanel(opp)}
                           className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl cursor-pointer hover:border-blue-400 hover:shadow-lg transition-all group flex"
                         >
                           <div className="flex flex-col justify-center text-slate-300 mr-3 opacity-0 group-hover:opacity-100 transition-opacity">⋮⋮</div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-base text-slate-900 line-clamp-2 mb-1.5">{opp.opportunity.title}</h4>
                              <p className="text-xs font-medium text-slate-500 mb-4 truncate">{opp.opportunity.organization}</p>
                              <div className="flex items-center justify-between mt-auto">
                                 <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border ${getPriorityColor(opp.priority)}`}>
                                   {opp.priority}
                                 </span>
                                 {opp.opportunity.deadline && (
                                   <span className={`text-[11px] font-semibold ${isUrgent ? 'text-red-500' : 'text-slate-400'}`}>
                                     {formatDistanceToNow(new Date(opp.opportunity.deadline), { addSuffix: true })}
                                   </span>
                                 )}
                              </div>
                           </div>
                         </motion.div>
                       );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="ui-card bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                     <tr>
                        <th className="p-5 font-semibold">Opportunity</th>
                        <th className="p-5 font-semibold">Status</th>
                        <th className="p-5 font-semibold">Priority</th>
                        <th className="p-5 font-semibold">Deadline</th>
                        <th className="p-5 font-semibold text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {savedOpps.map((opp, idx) => (
                        <tr key={opp.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="p-5">
                              <p className="font-bold text-slate-900 max-w-md truncate text-base">{opp.opportunity.title}</p>
                              <p className="text-xs font-medium text-slate-500 truncate mt-1">{opp.opportunity.organization}</p>
                           </td>
                           <td className="p-5">
                              <select 
                                value={opp.application_status}
                                onChange={(e) => handleUpdate(opp.id, 'application_status', e.target.value)}
                                className="bg-white border border-slate-200 rounded-xl text-sm font-medium p-2.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full max-w-[180px] shadow-sm"
                              >
                                 {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </td>
                           <td className="p-5">
                              <select 
                                value={opp.priority}
                                onChange={(e) => handleUpdate(opp.id, 'priority', e.target.value)}
                                className={`bg-white border border-slate-200 rounded-xl text-sm font-bold p-2.5 focus:outline-none focus:border-blue-500 w-full max-w-[140px] shadow-sm ${opp.priority === 'High' ? 'text-red-600' : opp.priority === 'Medium' ? 'text-orange-600' : 'text-emerald-600'}`}
                              >
                                 <option value="Low" className="text-emerald-600 font-bold">Low</option>
                                 <option value="Medium" className="text-orange-600 font-bold">Medium</option>
                                 <option value="High" className="text-red-600 font-bold">High</option>
                              </select>
                           </td>
                           <td className="p-5 text-slate-500 font-medium">
                              {opp.opportunity.deadline || '-'}
                           </td>
                           <td className="p-5 text-right space-x-4">
                              <button onClick={() => openPanel(opp)} className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Details</button>
                              <button onClick={() => handleRemove(opp.id)} className="text-slate-400 font-semibold hover:text-red-500 transition-colors">Remove</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
          </motion.div>
        )}

        {/* SLIDE-OVER PANEL */}
        <AnimatePresence>
          {selectedOpp && (
            <div className="fixed inset-0 z-50 flex justify-end">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
                onClick={() => setSelectedOpp(null)} 
              />
              
              {/* Panel */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md h-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col"
              >
               <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-white">
                  <div>
                     <h2 className="text-xl font-bold text-slate-900 mb-2 pr-4 leading-tight">{selectedOpp.opportunity.title}</h2>
                     <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                       <LayoutGrid size={14} className="text-slate-400" /> {selectedOpp.opportunity.organization}
                     </p>
                  </div>
                  <button onClick={() => setSelectedOpp(null)} className="text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  
                  {/* Meta block */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Deadline</p>
                       <p className="text-sm font-semibold text-slate-900">{selectedOpp.opportunity.deadline || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1.5">Funding</p>
                       <p className="text-sm font-semibold text-slate-900 truncate" title={selectedOpp.opportunity.funding_amount || 'N/A'}>{selectedOpp.opportunity.funding_amount || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Tracker State</h3>
                     <div className="flex gap-4">
                        <div className="flex-1">
                           <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Status</label>
                           <select 
                              value={selectedOpp.application_status}
                              onChange={(e) => handleUpdate(selectedOpp.id, 'application_status', e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl text-sm font-semibold p-3.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full shadow-sm"
                            >
                               {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                           <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Priority</label>
                           <select 
                              value={selectedOpp.priority}
                              onChange={(e) => handleUpdate(selectedOpp.id, 'priority', e.target.value)}
                              className="bg-white border border-slate-200 rounded-xl text-sm font-semibold p-3.5 text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full shadow-sm"
                            >
                               <option value="Low">Low</option>
                               <option value="Medium">Medium</option>
                               <option value="High">High</option>
                            </select>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex justify-between items-center">
                       Notes
                       <button 
                         onClick={() => handleUpdate(selectedOpp.id, 'notes', selectedOpp.notes || '')}
                         className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-xs hover:bg-blue-100 transition-colors normal-case"
                       >Save Notes</button>
                     </h3>
                     <textarea
                       value={selectedOpp.notes || ''}
                       onChange={(e) => setSelectedOpp({ ...selectedOpp, notes: e.target.value })}
                       onBlur={(e) => handleUpdate(selectedOpp.id, 'notes', e.target.value)}
                       placeholder="Add private notes, links to drafts, thoughts..."
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[140px] resize-y shadow-inner custom-scrollbar"
                     />
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Application Timeline</h3>
                     
                     {timelineLoading ? (
                       <div className="text-sm font-medium text-slate-400 animate-pulse">Loading timeline...</div>
                     ) : timeline.length === 0 ? (
                       <p className="text-sm font-medium text-slate-500 italic">No timeline events yet.</p>
                     ) : (
                       <div className="space-y-6 border-l-2 border-slate-200 pl-5 ml-2 mt-2">
                         {timeline.map(entry => (
                           <div key={entry.id} className="relative">
                             <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{format(new Date(entry.created_at), 'MMM d, yyyy • h:mm a')}</p>
                             <p className="text-sm font-bold text-slate-700 mb-1">Status changed to <span className="text-blue-600">{entry.status}</span></p>
                             {entry.note && <p className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-xl mt-2">{entry.note}</p>}
                           </div>
                         ))}
                       </div>
                     )}

                     <div className="mt-6 pt-6 border-t border-slate-100">
                        <input 
                          type="text" 
                          value={newTimelineNote}
                          onChange={(e) => setNewTimelineNote(e.target.value)}
                          placeholder="Add a timeline note (optional)..."
                          className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 mb-3 shadow-sm"
                        />
                        <button onClick={handleAddTimeline} className="w-full btn-primary py-3 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          + Add Milestone
                        </button>
                     </div>
                  </div>

               </div>
               
               <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-4">
                  <Link href={`/opportunities/${selectedOpp.opportunity_id}`} className="flex-1 py-3 text-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-slate-700 font-bold text-sm shadow-sm">
                    View Full Details
                  </Link>
                  <a href={selectedOpp.opportunity.application_link} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold text-sm shadow-lg shadow-blue-600/20">
                    Apply Now <ArrowRight size={16} />
                  </a>
               </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global styles for custom scrollbar within components */}
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.02);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
          }
        `}} />
      </div>
    </div>
  );
}
