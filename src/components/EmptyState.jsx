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
    <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn relative z-10">
      <div className="bg-[#0f1117]/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-12 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-center text-white">
        {/* Minimal Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-[#0071e3] shadow-inner">
          <BookOpen className="w-7 h-7" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
          Bookshelf Series Tracker
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-3">
          Visualize Your Entire Library
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-lg mx-auto leading-relaxed">
          Import your Goodreads export to organize your books into compact, continuous series shelves. Read books appear in vibrant color; missing and want-to-read volumes appear in grey with one-click purchase links.
        </p>

        {/* Optional Reader Name Input */}
        <div className="mt-8 max-w-sm mx-auto text-left">
          <label className="block text-xs font-medium text-white/70 mb-1.5 ml-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Surya"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0071e3] transition-all"
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
              ? 'border-[#0071e3] bg-[#0071e3]/10 scale-[1.01]'
              : 'border-white/15 hover:border-[#0071e3]/60 bg-white/[0.02]'
          }`}
        >
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <div className="w-12 h-12 rounded-2xl bg-white/10 shadow-sm border border-white/10 flex items-center justify-center mx-auto mb-3 text-[#0071e3]">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-semibold text-white">
            Drop your Goodreads CSV here
          </p>
          <p className="text-xs text-white/50 mt-1">
            or click to browse from your computer
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-400 mt-3 font-medium">{error}</p>
        )}

        {/* How to export note */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
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
