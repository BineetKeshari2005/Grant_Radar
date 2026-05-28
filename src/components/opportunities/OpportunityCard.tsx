'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Opportunity } from '@/types';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/Toast';
import { Bookmark, Clock, Banknote, ArrowRight, Zap, GraduationCap, MapPin, Globe } from 'lucide-react';

function formatDeadline(dateStr: string | null) {
  if (!dateStr) return { label: 'Not specified', urgent: false, expired: false };
  
  const deadlineDate = new Date(dateStr);
  const now = new Date();
  
  const dDate = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
  const nDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = dDate.getTime() - nDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { label: 'Expired', urgent: false, expired: true };
  if (diffDays === 0) return { label: 'Today!', urgent: true, expired: false };
  if (diffDays <= 7) return { label: `${diffDays} Days Left`, urgent: true, expired: false };
  if (diffDays <= 30) return { label: `${diffDays} Days Left`, urgent: false, expired: false };
  
  const formatted = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  return { label: formatted, urgent: false, expired: false };
}

export default function OpportunityCard({ opportunity, index = 0 }: { opportunity: Opportunity; index?: number }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opportunity.id })
      });
      if (res.ok) {
        setIsSaved(true);
        showToast('Saved to Tracker!', 'success');
      } else {
        showToast('Failed to save', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error saving to Tracker', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const { label: deadlineLabel, urgent, expired } = formatDeadline(opportunity.deadline);

  // Status Badge Logic
  let statusBadge = (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-green-50 text-green-700 uppercase">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> ACTIVE
    </span>
  );
  if (expired) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-100 text-slate-500 uppercase">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> EXPIRED
      </span>
    );
  } else if (urgent) {
    statusBadge = (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-orange-50 text-orange-600 uppercase">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> CLOSING SOON
      </span>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: (index % 12) * 0.1, type: "spring", stiffness: 100 }}
      className="ui-card rounded-2xl flex flex-col h-full p-6 relative group overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border border-slate-100 hover:border-blue-200"
    >
      {urgent && !expired && (
        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-400 rounded-l-2xl" />
      )}

      {/* Top Row: Badge & Save */}
      <div className="flex items-start justify-between mb-4">
        {statusBadge}
        <button
          onClick={handleSave}
          disabled={isSaving || isSaved}
          className={`p-1.5 rounded-md transition-colors ${
            isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Title */}
      <h3 className="font-bold text-xl text-slate-900 mb-3 line-clamp-2 leading-tight">
        {opportunity.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-500 line-clamp-3 mb-6 flex-1">
        {opportunity.description || `Funding opportunity by ${opportunity.organization}`}
      </p>

      {/* Meta Specs (Funding, Deadline, etc) */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
          <Banknote size={16} className="text-slate-400" />
          <span>{opportunity.funding_amount || 'Amount varies'}</span>
        </div>
        
        <div className={`flex items-center gap-3 text-sm font-medium ${expired ? 'text-slate-400' : urgent ? 'text-orange-600' : 'text-slate-700'}`}>
          <Clock size={16} className={expired ? 'text-slate-400' : urgent ? 'text-orange-500' : 'text-slate-400'} />
          <span>{deadlineLabel}</span>
        </div>

        {opportunity.country && (
          <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
            <MapPin size={16} className="text-slate-400" />
            <span className="truncate">{opportunity.country}</span>
          </div>
        )}
      </div>

      {/* Tags Row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {opportunity.category && (
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wide">
            {opportunity.category.replace('_', ' ')}
          </span>
        )}
        {opportunity.student_eligible && (
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wide flex items-center gap-1">
            <GraduationCap size={12} /> STUDENT
          </span>
        )}
        {opportunity.remote_type && (
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-wide flex items-center gap-1">
            <Globe size={12} /> {opportunity.remote_type}
          </span>
        )}
      </div>

      <div className="mt-auto pt-4 flex gap-3">
        <Link href={`/opportunities/${opportunity.id}`} className="flex-1">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            Discover <ArrowRight size={16} />
          </motion.div>
        </Link>
        
        {opportunity.application_link && (
          <motion.a 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href={opportunity.application_link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all"
          >
            Apply <Zap size={16} className="text-yellow-300" />
          </motion.a>
        )}
      </div>
    </motion.div>
  );
}
