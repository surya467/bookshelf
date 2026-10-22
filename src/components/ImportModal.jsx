import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { parseGoodreadsCSV } from '../services/goodreadsParser';

export default function ImportModal({ onClose, onImportCSV, currentUserName }) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [userName, setUserName] = useState(currentUserName || '');
  const [error, setError] = useState('');

  const extractNameFromFileName = (name) => {
    if (!name) return '';
    const base = name.replace(/\.[^/.]+$/, '');
    const cleaned = base
      .replace(/(goodreads|library|export|bookshelf|books|data)/gi, '')
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .trim();
    if (cleaned.length >= 2 && cleaned.length <= 25) {
      return cleaned.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    return '';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const detected = extractNameFromFileName(file.name);
    if (detected && !userName) {
      setUserName(detected);
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
        setError('');
      }
    };
    reader.onerror = () => setError('Failed to read CSV file');
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!csvText.trim()) {
      setError('Please select or paste your Goodreads CSV export first.');
      return;
    }
    const books = parseGoodreadsCSV(csvText);
    if (!books || books.length === 0) {
      setError('No valid books found in CSV.');
      return;
    }
    onImportCSV(books, userName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#111218] border border-white/10 rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.85)] p-7 sm:p-8 z-10 text-white">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/50 hover:text-white p-1.5 rounded-full bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 border border-[#0071e3]/20 px-2.5 py-0.5 rounded-full">
          Goodreads Export
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-white mt-2">
          Import Your Library
        </h2>
        <p className="text-xs text-white/60 mt-1">
          Upload your Goodreads CSV file. Your read books will populate in full color, and missing series companions will appear in grey.
        </p>

        {/* Reader Name Field */}
        <div className="mt-5 text-left">
          <label className="block text-xs font-medium text-white/70 mb-1 ml-1">
            Reader Name (Optional)
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="e.g. Surya"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#0071e3] transition-all"
          />
        </div>

        {/* File Drag & Drop / File Input */}
        <div className="mt-4">
          <div className="border-2 border-dashed border-white/15 hover:border-[#0071e3] rounded-2xl p-6 text-center bg-white/[0.02] transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-8 h-8 text-white/40 mx-auto mb-2" />
            <p className="text-xs text-white/90 font-medium">
              {fileName ? fileName : 'Click to select CSV or drag file here'}
            </p>
            <p className="text-[10px] text-white/40 mt-1">
              Supports standard Goodreads export (.csv)
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-400 mt-3 font-medium">{error}</p>}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!csvText}
            className={`px-5 py-2 rounded-full font-medium text-xs transition-all ${
              csvText
                ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-[0_2px_12px_rgba(0,113,227,0.4)]'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            Import Books
          </button>
        </div>
      </div>
    </div>
  );
}
