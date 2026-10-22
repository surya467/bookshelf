import React from 'react';
import { X, ExternalLink, HelpCircle, FileSpreadsheet, Rss, DollarSign, Sparkles } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-pink-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 bg-pink-50/70 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-600" />
            <h3 className="text-sm font-bold text-slate-800">How ShelfCutie Works</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-pink-200/50 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-600">
          {/* Method 1 */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span>1. Goodreads CSV Export (Recommended & 100% Complete)</span>
            </div>
            <p className="leading-relaxed">
              Log into Goodreads on desktop, go to <strong>My Books</strong> ➔ <strong>Import and export</strong> (in the left sidebar) ➔ Click <strong>"Export Library"</strong>. Download the generated CSV file and drag it into this app!
            </p>
            <a
              href="https://www.goodreads.com/review/import"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-pink-600 hover:text-pink-700"
            >
              <span>Go to Goodreads Export Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Method 2 */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-900">
              <Rss className="w-4 h-4 text-purple-600" />
              <span>2. Public Profile or RSS Feed Link</span>
            </div>
            <p className="leading-relaxed">
              If your Goodreads profile is set to Public, paste your profile link or shelf link (e.g. <code className="bg-purple-100/70 px-1.5 py-0.5 rounded text-purple-950 font-mono text-[11px]">goodreads.com/review/list/USER_ID</code>). ShelfCutie pulls your public RSS feed via a secure proxy.
            </p>
          </div>

          {/* Method 3 */}
          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-2">
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <span>3. How Book Prices & Covers are Found</span>
            </div>
            <p className="leading-relaxed">
              When you click <strong className="text-pink-600 font-black">LESSGOOO!</strong>, ShelfCutie looks up each book's ISBN and title via <strong>Google Books API</strong> and <strong>OpenLibrary</strong> to retrieve official retail pricing and book cover thumbnails. If a retail API lacks a listing price, a publisher MSRP formula is estimated from the format and page count. You can also click any book to customize its price!
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md transition-all"
          >
            Got it, Let's Read! 📚
          </button>
        </div>
      </div>
    </div>
  );
}
