import React, { useState } from 'react';
import { X, Upload, FileText, Check } from 'lucide-react';
import { parseGoodreadsCSV } from '../services/goodreadsParser';

export default function ImportModal({ onClose, onImportCSV, onLoadDexterSample }) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
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
    onImportCSV(books);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white border border-black/[0.06] rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-8 z-10">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#86868b] hover:text-[#1d1d1f] p-1.5 rounded-full bg-[#f5f5f7]"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
          Goodreads Export
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Import Your Library
        </h2>
        <p className="text-xs text-[#86868b] mt-1">
          Upload your Goodreads CSV. Read books will populate in color, and missing series companions will appear in grey.
        </p>

        {/* Quick Sample Button */}
        <div className="mt-6 p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.03] flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#1d1d1f]">Dexter's Goodreads Export</div>
            <p className="text-[11px] text-[#86868b] mt-0.5">
              Harry Potter 1–3, The Hobbit, and Piano Solos.
            </p>
          </div>
          <button
            onClick={() => {
              onLoadDexterSample();
              onClose();
            }}
            className="bg-[#1d1d1f] hover:bg-[#333336] text-white font-medium text-xs px-4 py-2 rounded-full transition-all active:scale-95 shadow-sm"
          >
            Load Sample
          </button>
        </div>

        {/* File Drag & Drop / File Input */}
        <div className="mt-4">
          <div className="border-2 border-dashed border-black/[0.08] hover:border-[#0071e3] rounded-2xl p-6 text-center bg-[#f5f5f7]/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileText className="w-8 h-8 text-[#86868b] mx-auto mb-2" />
            <p className="text-xs text-[#1d1d1f] font-medium">
              {fileName ? fileName : 'Click to select CSV or drag file here'}
            </p>
            <p className="text-[10px] text-[#86868b] mt-1">
              Supports standard Goodreads export (.csv)
            </p>
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 mt-3">{error}</p>}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-black/[0.06]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-medium text-[#86868b] hover:text-[#1d1d1f]"
          >
            Cancel
          </button>
          <button
            onClick={handleProcessImport}
            disabled={!csvText}
            className={`px-5 py-2 rounded-full font-medium text-xs transition-all ${
              csvText
                ? 'bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-sm'
                : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'
            }`}
          >
            Import Books
          </button>
        </div>
      </div>
    </div>
  );
}
