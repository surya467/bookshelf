import React, { useState } from 'react';
import { X, Search, Check, Library } from 'lucide-react';
import { searchOpenLibraryBooks } from '../services/openLibrary';

export default function OpenLibraryInfoModal({ onClose }) {
  const [testQuery, setTestQuery] = useState('Harry Potter and the Goblet of Fire');
  const [testResults, setTestResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    try {
      const docs = await searchOpenLibraryBooks(testQuery, '', 3);
      setTestResults(docs);
    } catch {
      setTestResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white border border-black/[0.06] rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.2)] p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#86868b] hover:text-[#1d1d1f] p-1.5 rounded-full bg-[#f5f5f7]"
        >
          <X className="w-4 h-4" />
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider text-[#0071e3]">
          API Reference
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-[#1d1d1f] mt-1">
          Open Library Catalog & Covers
        </h2>

        {/* Core Answers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.03]">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">
              Does it expose all books?
            </h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Open Library contains over <strong>30+ million records</strong>. Mainstream published literature and major series (like Harry Potter and LOTR) have near 100% coverage, though very recent self-published titles may take time to appear.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.03]">
            <h3 className="text-sm font-semibold text-[#1d1d1f] mb-1">
              Does it expose all covers?
            </h3>
            <p className="text-xs text-[#86868b] leading-relaxed">
              Over <strong>15+ million covers</strong> are hosted. When a specific edition ISBN lacks a scanned jacket, our app automatically queries the work-level cover ID to ensure a crisp, high-res visual is always rendered.
            </p>
          </div>
        </div>

        {/* Interactive Query Tester */}
        <div className="mt-6 p-5 rounded-2xl bg-[#f5f5f7] border border-black/[0.03]">
          <h4 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
            Live Search Test
          </h4>
          <div className="flex gap-2">
            <input
              type="text"
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
              placeholder="Book title..."
              className="flex-1 bg-white border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
            />
            <button
              onClick={handleTestSearch}
              disabled={isSearching}
              className="bg-[#1d1d1f] hover:bg-[#333336] text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
            >
              {isSearching ? 'Testing...' : 'Test'}
            </button>
          </div>

          {testResults && (
            <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-2">
              <span className="text-[11px] font-medium text-[#86868b]">
                Found {testResults.length} matches:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {testResults.map((r, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-black/[0.04] flex gap-2.5 items-center">
                    {r.coverUrl ? (
                      <img src={r.coverUrl} alt={r.title} className="w-9 h-13 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-9 h-13 bg-[#f5f5f7] rounded flex items-center justify-center text-[9px] text-[#86868b]">
                        No Img
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#1d1d1f] truncate">{r.title}</p>
                      <p className="text-[10px] text-[#86868b] truncate">{r.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-between items-center text-xs text-[#86868b] pt-4 border-t border-black/[0.06]">
          <span>Official API: <a href="https://openlibrary.org/developers/api" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] hover:underline">openlibrary.org/developers/api</a></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
