'use client';

import React, { useState, FormEvent } from 'react';
import { OpportunityFilters, OpportunityCategory, RemoteType } from '@/types';
import { Search, Sparkles } from 'lucide-react';

interface FilterBarProps {
  filters: OpportunityFilters;
  onFiltersChange: (updates: Partial<OpportunityFilters>) => void;
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [isAiMode, setIsAiMode] = useState(filters.ai_mode || false);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: localSearch, ai_mode: isAiMode, page: 1 });
  };

  return (
    <div className="ui-card p-4 sm:p-6 rounded-2xl mb-8 flex flex-col gap-4 sticky top-20 z-40 shadow-sm">
      <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Search Input with AI Toggle */}
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 text-slate-400">
            {isAiMode ? <Sparkles size={20} className="text-blue-500" /> : <Search size={20} />}
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={isAiMode ? "Describe what you're looking for (e.g. 'Women founder grants in healthcare')..." : "Search by keyword or organization..."}
            className={`w-full pl-12 pr-28 py-3 rounded-xl border bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
              isAiMode 
                ? 'border-blue-400 ring-2 ring-blue-500/20' 
                : 'border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          <button
            type="button"
            onClick={() => setIsAiMode(!isAiMode)}
            className={`absolute right-2.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isAiMode 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Sparkles size={14} /> AI Mode
          </button>
        </div>
        
        <button type="submit" className="btn-primary py-3 px-8 text-base">
          Search
        </button>
      </form>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center pt-4 border-t border-slate-100">
        <select 
          className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-4 py-2 outline-none hover:bg-slate-50 cursor-pointer"
          value={filters.category || ''}
          onChange={(e) => onFiltersChange({ category: (e.target.value as OpportunityCategory) || undefined, page: 1 })}
        >
          <option value="">All Categories</option>
          <option value="scholarship">Scholarship</option>
          <option value="fellowship">Fellowship</option>
          <option value="accelerator">Accelerator</option>
          <option value="grant">Grant</option>
          <option value="competition">Competition</option>
          <option value="conference">Conference</option>
        </select>



        <div className="flex flex-wrap gap-3 ml-auto">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden"
              checked={!!filters.student_eligible}
              onChange={() => onFiltersChange({ student_eligible: !filters.student_eligible ? true : undefined, page: 1 })}
            />
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filters.student_eligible 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-600 group-hover:bg-slate-50'
            }`}>
              Student
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden"
              checked={!!filters.women_founder_friendly}
              onChange={() => onFiltersChange({ women_founder_friendly: !filters.women_founder_friendly ? true : undefined, page: 1 })}
            />
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filters.women_founder_friendly 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-600 group-hover:bg-slate-50'
            }`}>
              Women Founders
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              className="hidden"
              checked={!!filters.indian_applicant_eligible}
              onChange={() => onFiltersChange({ indian_applicant_eligible: !filters.indian_applicant_eligible ? true : undefined, page: 1 })}
            />
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              filters.indian_applicant_eligible 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-600 group-hover:bg-slate-50'
            }`}>
              Indian Applicants
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
