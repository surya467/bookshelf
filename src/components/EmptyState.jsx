import React, { useState } from 'react';
import { Upload, FileText, ArrowRight, BookOpen, ExternalLink, Sparkles } from 'lucide-react';
import { parseGoodreadsCSV } from '../services/goodreadsParser';

export default function EmptyState({ onImportCSV, onLoadDemo }) {
  const [dragActive, setDragActive] = useState(false);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const extractNameFromFileName = (fileName) => {
    if (!fileName) return '';
    const base = fileName.replace(/\.[^/.]+$/, '');
    const cleaned = base
      .replace(/(goodreads|library|export|bookshelf|books|data)/gi, '')
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim();
    if (cleaned.length >= 2 && cleaned.length <= 25) {
      return cleaned.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return '';
  };

  const handleFile = (file) => {
    if (!file) return;
    setError('');

    const detectedName = extractNameFromFileName(file.name);
    const finalName = userName.trim() || detectedName;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        const books = parseGoodreadsCSV(text);
        if (!books || books.length === 0) {
          setError('No valid books found. Please verify this is a Goodreads export (.csv) file.');
          return;
        }
        onImportCSV(books, finalName);
      }
    };
    reader.onerror = () => setError('Failed to read the selected file.');
    reader.readAsText(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center">
        {/* Minimal Icon */}
        <div className="w-14 h-14 rounded-3xl bg-[#f5f5f7] border border-black/[0.06] flex items-center justify-center mx-auto mb-6 text-[#1d1d1f]">
          <BookOpen className="w-7 h-7 text-[#1d1d1f]" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
          Bookshelf Series Tracker
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#1d1d1f] mt-1.5">
          Visualize Your Library
        </h2>
        <p className="text-sm text-[#86868b] mt-2 max-w-lg mx-auto leading-relaxed">
          Import your Goodreads export to organize your books into complete series. Read books appear in vibrant color; missing companion volumes appear in minimal grey with one-click purchase links.
        </p>

        {/* Optional Reader Name Input */}
        <div className="mt-8 max-w-sm mx-auto text-left">
          <label className="block text-xs font-medium text-[#86868b] mb-1.5 ml-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Surya"
            className="w-full bg-[#f5f5f7] border border-black/[0.06] rounded-2xl px-4 py-2.5 text-sm text-[#1d1d1f] placeholder:text-[#86868b]/60 focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`mt-4 border-2 border-dashed rounded-3xl p-8 sm:p-10 transition-all cursor-pointer relative ${
            dragActive
              ? 'border-[#0071e3] bg-[#0071e3]/5 scale-[1.01]'
              : 'border-black/[0.08] hover:border-[#0071e3]/60 bg-[#f5f5f7]/60'
          }`}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/[0.04] flex items-center justify-center mx-auto mb-3 text-[#0071e3]">
            <Upload className="w-5 h-5 text-[#0071e3]" />
          </div>
          <p className="text-sm font-semibold text-[#1d1d1f]">
            Drop your Goodreads CSV here
          </p>
          <p className="text-xs text-[#86868b] mt-1">
            or click to browse from your computer
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-500 mt-3 font-medium">{error}</p>
        )}

        {/* How to export note */}
        <div className="mt-8 pt-6 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <a
            href="https://www.goodreads.com/review/import"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-[#0071e3] transition-colors"
          >
            <span>How to export from Goodreads</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={() => onLoadDemo(userName.trim() || 'Dexter')}
            className="inline-flex items-center gap-1.5 font-semibold text-[#0071e3] hover:text-[#0077ed] transition-colors"
          >
            <span>Try with Demo Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
