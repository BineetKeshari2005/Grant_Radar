'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Opportunity } from '@/types';
import { formatDistanceToNow, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Clock, MapPin, Globe, Banknote, Calendar, Tag, Briefcase, Zap, Building2, ExternalLink, BookmarkPlus } from 'lucide-react';

export default function OpportunityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const res = await fetch(`/api/opportunities/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Opportunity not found');
          throw new Error('Failed to load opportunity');
        }
        const data = await res.json();
        setOpportunity(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  const handleSave = async () => {
    if (!opportunity) return;
    setSaving(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });
      
      if (res.ok) {
        showToast('Saved to Tracker!', 'success');
      } else if (res.status === 409) {
        showToast('Already in your Tracker', 'error');
      } else {
        throw new Error('Failed to save');
      }
    } catch (err: any) {
      showToast(err.message || 'Error saving', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24">
        <div className="mb-6 h-6 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="ui-card bg-white rounded-3xl p-10 mb-8 animate-pulse">
          <div className="h-10 w-2/3 bg-slate-200 rounded-lg mb-6" />
          <div className="h-6 w-1/3 bg-slate-100 rounded mb-6" />
          <div className="flex gap-3 mb-4">
             <div className="h-8 w-24 bg-slate-100 rounded-full" />
             <div className="h-8 w-24 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="ui-card bg-white rounded-3xl p-8 h-80 animate-pulse">
               <div className="h-8 w-48 bg-slate-200 rounded mb-6" />
               <div className="h-4 w-full bg-slate-100 rounded mb-3" />
               <div className="h-4 w-5/6 bg-slate-100 rounded mb-3" />
               <div className="h-4 w-4/6 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="space-y-8">
            <div className="ui-card bg-white rounded-3xl p-8 h-64 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-32 text-center">
        <h2 className="text-4xl font-extrabold mb-6 text-slate-900">{error || 'Opportunity not found'}</h2>
        <Link href="/" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-2">
          <ArrowLeft size={20} /> Back to opportunities
        </Link>
      </div>
    );
  }

  const isExpired = opportunity.status === 'expired';
  let countdownText = 'No deadline specified';
  let isUrgent = false;

  if (opportunity.deadline) {
    const deadlineDate = new Date(opportunity.deadline);
    if (isPast(deadlineDate) && !isExpired) {
       countdownText = 'Deadline has passed';
       isUrgent = true;
    } else if (!isExpired) {
       countdownText = `Closes in ${formatDistanceToNow(deadlineDate)}`;
       const diffDays = Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
       if (diffDays <= 7) isUrgent = true;
    } else {
       countdownText = 'Expired';
    }
  }

  const categoryColors: Record<string, string> = {
    scholarship: 'bg-blue-50 text-blue-600 border-blue-200',
    fellowship: 'bg-purple-50 text-purple-600 border-purple-200',
    accelerator: 'bg-orange-50 text-orange-600 border-orange-200',
    grant: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    competition: 'bg-rose-50 text-rose-600 border-rose-200',
    conference: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    exchange_program: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    government_scheme: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    giveaway: 'bg-pink-50 text-pink-600 border-pink-200',
    other: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  const badgeClass = categoryColors[opportunity.category] || categoryColors['other'];

  return (
    <div className="min-h-screen bg-slate-50 relative pb-24 pt-10">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="inline-flex items-center text-slate-500 font-medium hover:text-slate-900 transition-colors mb-8 group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to opportunities
          </Link>
        </motion.div>

        {isExpired && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-orange-50 border border-orange-200 text-orange-800 px-6 py-4 rounded-2xl flex items-center shadow-sm">
            <span className="text-xl mr-3">⚠️</span>
            <p className="font-medium">This opportunity has expired. Deadline was {opportunity.deadline}.</p>
          </motion.div>
        )}

        {/* Header Hero Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="ui-card bg-white rounded-[2.5rem] p-10 lg:p-12 mb-10 relative overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeClass}`}>
              {opportunity.category.replace('_', ' ')}
            </span>
            {opportunity.status === 'active' ? (
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border bg-emerald-50 text-emerald-600 border-emerald-200">
                Active
              </span>
            ) : (
              <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border bg-slate-100 text-slate-500 border-slate-200">
                Expired
              </span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-slate-900 leading-tight tracking-tight">
            {opportunity.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-slate-600 text-lg font-medium mb-8">
            <div className="flex items-center gap-2">
              <Building2 className="text-slate-400" size={24} />
              {opportunity.organization}
            </div>
            {opportunity.country && (
              <div className="flex items-center gap-2">
                <MapPin className="text-slate-400" size={24} />
                {opportunity.country}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {opportunity.tags?.map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-sm font-semibold bg-slate-100 text-slate-600 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            {opportunity.student_eligible && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-sky-50 text-sky-600 border border-sky-100 flex items-center gap-1.5">
                🎓 Student Eligible
              </span>
            )}
            {opportunity.women_founder_friendly && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-1.5">
                ♀ Women Friendly
              </span>
            )}
            {opportunity.indian_applicant_eligible && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1.5">
                🇮🇳 India Eligible
              </span>
            )}
            {opportunity.remote_type && (
              <span className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center gap-1.5 capitalize">
                <Globe size={14} /> {opportunity.remote_type}
              </span>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="ui-card bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-extrabold mb-6 flex items-center text-slate-900">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-xl mr-4"><Briefcase size={24} /></span> 
                About this Opportunity
              </h2>
              <div className="prose prose-slate max-w-none text-slate-600 text-lg leading-relaxed">
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </div>

              {opportunity.eligibility && (
                <div className="mt-10 pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-extrabold mb-4 text-slate-900 flex items-center gap-2">
                    <Tag size={20} className="text-slate-400" /> Eligibility Criteria
                  </h3>
                  <p className="text-slate-600 whitespace-pre-wrap text-lg leading-relaxed">{opportunity.eligibility}</p>
                </div>
              )}
            </motion.div>

            {/* Key Details (3 cards per row) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="ui-card bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm">
               <h2 className="text-2xl font-extrabold mb-8 flex items-center text-slate-900">
                <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl mr-4"><Tag size={24} /></span> 
                Key Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Banknote size={14} /> Funding Amount</p>
                   <p className="text-lg font-bold text-slate-900">{opportunity.funding_amount || 'Not specified'}</p>
                 </motion.div>
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Calendar size={14} /> Deadline</p>
                   <p className="text-lg font-bold text-slate-900">{opportunity.deadline || 'Ongoing / Unspecified'}</p>
                 </motion.div>
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Zap size={14} /> Age Limit</p>
                   <p className="text-lg font-bold text-slate-900">{opportunity.age_limit || 'None specified'}</p>
                 </motion.div>
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Tag size={14} /> App Fee</p>
                   <p className="text-lg font-bold text-slate-900">{opportunity.application_fee || 'Free / Not specified'}</p>
                 </motion.div>
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><Globe size={14} /> Remote Type</p>
                   <p className="text-lg font-bold text-slate-900 capitalize">{opportunity.remote_type || 'Unspecified'}</p>
                 </motion.div>
                 <motion.div whileHover={{ y: -5, scale: 1.03 }} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-default">
                   <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2"><MapPin size={14} /> Region</p>
                   <p className="text-lg font-bold text-slate-900">{opportunity.region || 'Global'}</p>
                 </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="ui-card bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-24">
              {!isExpired && (
                <div className={`text-center p-6 rounded-2xl mb-8 border-2 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2 ${isUrgent ? 'text-red-500' : 'text-blue-500'}`}>
                    <Clock size={16} /> Time Remaining
                  </p>
                  <p className={`text-2xl font-extrabold ${isUrgent ? 'text-red-600' : 'text-blue-700'}`}>{countdownText}</p>
                </div>
              )}

              {opportunity.application_link ? (
                <motion.a 
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  href={opportunity.application_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-center text-lg font-bold text-white shadow-lg transition-all ${isExpired ? 'bg-slate-300 shadow-none cursor-not-allowed pointer-events-none' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30'}`}
                >
                  {isExpired ? 'Applications Closed' : 'Apply Now'} <Zap size={20} className={!isExpired ? "text-yellow-300" : ""} />
                </motion.a>
              ) : (
                <div className="w-full py-4 text-center rounded-2xl bg-slate-100 text-slate-500 font-bold border border-slate-200">
                  No Application Link
                </div>
              )}

              {opportunity.source_url && (
                <a 
                  href={opportunity.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  Visit Original Source <ExternalLink size={16} />
                </a>
              )}

              <hr className="my-8 border-slate-100" />

              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 px-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-slate-700 font-bold flex items-center justify-center gap-2"
              >
                <BookmarkPlus size={20} className="text-slate-400" />
                {saving ? 'Saving...' : 'Save to Tracker'}
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="ui-card bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <h3 className="font-extrabold text-xl mb-6 text-slate-900 flex items-center gap-2">
                Quick Stats
              </h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-500 text-sm font-medium">Category</span>
                  <span className="text-slate-900 font-bold capitalize">{opportunity.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <span className="text-slate-500 text-sm font-medium">Country</span>
                  <span className="text-slate-900 font-bold text-right max-w-[150px] truncate" title={opportunity.country || 'N/A'}>{opportunity.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Status</span>
                  <span className={`font-bold capitalize ${opportunity.status === 'active' ? 'text-emerald-600' : 'text-slate-500'}`}>{opportunity.status}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
