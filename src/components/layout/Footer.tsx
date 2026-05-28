import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} GrantRadar &middot; AI-Powered Global Opportunity Discovery
        </p>
      </div>
    </footer>
  );
}
