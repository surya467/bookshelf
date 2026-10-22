import React, { useState, useEffect } from 'react';
import { X, Search, Check, Library, Key, Sparkles, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { searchOpenLibraryBooks } from '../services/openLibrary';

export default function OpenLibraryInfoModal({ onClose, onKeysUpdated }) {
  const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' | 'openlibrary' | 'google' | 'hardcover'
  const [testQuery, setTestQuery] = useState('The Hobbit');
  const [testResults, setTestResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // API Keys state
  const [googleKey, setGoogleKey] = useState('');
  const [hardcoverToken, setHardcoverToken] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bookshelf_api_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        setGoogleKey(parsed.googleApiKey || '');
        setHardcoverToken(parsed.hardcoverToken || '');
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const handleSaveKeys = () => {
    try {
      const keys = {
        googleApiKey: googleKey.trim(),
        hardcoverToken: hardcoverToken.trim(),
      };
      localStorage.setItem('bookshelf_api_keys', JSON.stringify(keys));
      setSaveSuccess(true);
      if (onKeysUpdated) onKeysUpdated(keys);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) return;
    setIsSearching(true);
    try {
      const docs = await searchOpenLibraryBooks(testQuery, '', 4);
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

      <div className="relative w-full max-w-3xl bg-white border border-black/[0.06] rounded-[28px] shadow-[0_30px_70px_rgba(0,0,0,0.25)] p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#86868b] hover:text-[#1d1d1f] p-1.5 rounded-full bg-[#f5f5f7] transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0071e3] bg-[#0071e3]/10 px-2 py-0.5 rounded-md">
            Alternative Book & Cover APIs
          </span>
          <span className="text-[11px] text-[#86868b]">&bull; Architecture Analysis</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1d1d1f]">
          Book Metadata, Covers & Series Providers
        </h2>
        <p className="text-xs text-[#86868b] mt-1">
          Compare Open Library, Google Books, Hardcover, and Third-Party scrapers for fetching books and 3D covers.
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 mt-5 p-1 bg-[#f5f5f7] rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'comparison'
                ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            All 4 Options Compared
          </button>
          <button
            onClick={() => setActiveTab('openlibrary')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'openlibrary'
                ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Open Library (Active)
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'google'
                ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Google Books
          </button>
          <button
            onClick={() => setActiveTab('hardcover')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all ${
              activeTab === 'hardcover'
                ? 'bg-white text-[#1d1d1f] shadow-sm font-semibold'
                : 'text-[#86868b] hover:text-[#1d1d1f]'
            }`}
          >
            Hardcover (GraphQL)
          </button>
        </div>

        {/* Tab 1: Comparison Matrix */}
        {activeTab === 'comparison' && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Open Library */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <Library className="w-4 h-4 text-[#0071e3]" /> Open Library
                  </h3>
                  <span className="text-[10px] bg-[#34c759]/15 text-[#248a3d] font-semibold px-2 py-0.5 rounded-full">
                    Default & Active
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
                  <strong>100% Free & Open Source:</strong> Over 30M books and 15M covers via Internet Archive. No API key needed, zero CORS blocks in browsers.
                </p>
                <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-[#86868b]">Covers: Very High</span>
                  <span className="text-[#34c759] font-medium">Free Forever</span>
                </div>
              </div>

              {/* Google Books */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">Google Books API</h3>
                  <span className="text-[10px] bg-amber-500/15 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                    Key Required
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
                  <strong>Highest Jacket Scans:</strong> Publisher scans for commercial books. Free tier allows 50,000 req/day with personal API key (anonymous calls get rate limited).
                </p>
                <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-[#86868b]">Covers: Pristine HD</span>
                  <span className="text-[#0071e3] font-medium">50k/day Free</span>
                </div>
              </div>

              {/* Hardcover */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Hardcover.app
                  </h3>
                  <span className="text-[10px] bg-purple-500/15 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                    Best for Series
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
                  <strong>Native Series Hierarchy:</strong> Modern GraphQL API built specifically for book lovers. Native sequence numbers (<code className="text-[10px] bg-white px-1 py-0.5 rounded">position: 1, 2</code>) and community covers.
                </p>
                <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-[#86868b]">Series: 10/10 Perfect</span>
                  <span className="text-purple-600 font-medium">Free Token</span>
                </div>
              </div>

              {/* Third-Party Scrapers */}
              <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#1d1d1f]">Apify / Scrapers</h3>
                  <span className="text-[10px] bg-red-500/15 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                    Paid / Not Feasible
                  </span>
                </div>
                <p className="text-xs text-[#86868b] mt-2 leading-relaxed">
                  <strong>Goodreads Wrappers:</strong> Scrapes Goodreads pages directly. Requires paying $49+/mo server proxies to bypass Amazon CAPTCHAs, and blocked by browser CORS.
                </p>
                <div className="mt-3 pt-2.5 border-t border-black/[0.05] flex items-center justify-between text-[11px]">
                  <span className="text-[#86868b]">Requires Server</span>
                  <span className="text-red-600 font-medium">Blocked in Browser</span>
                </div>
              </div>
            </div>

            {/* Why covers were missing on Kindle exports */}
            <div className="p-4 rounded-2xl bg-[#0071e3]/5 border border-[#0071e3]/15">
              <h4 className="text-xs font-semibold text-[#0071e3] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Why some Kindle books had missing covers & how it's fixed:
              </h4>
              <p className="text-xs text-[#1d1d1f]/80 mt-1.5 leading-relaxed">
                Goodreads CSV exports for Kindle, Audible, and sideloaded books leave the ISBN column completely blank. The app now includes an intelligent <strong>Subtitle Cleaner & Open Library Title Search</strong> fallback (e.g. <em>The Hobbit, or There and Back Again</em> &rarr; <em>The Hobbit</em>), automatically discovering the official work cover ID even with zero ISBN!
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Open Library Interactive */}
        {activeTab === 'openlibrary' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
              <h4 className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-2">
                Live Open Library Cover Search
              </h4>
              <p className="text-xs text-[#86868b] mb-3">
                Test how our subtitle cleaning automatically discovers verified cover IDs:
              </p>
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
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {testResults && (
                <div className="mt-4 pt-4 border-t border-black/[0.06] space-y-2">
                  <span className="text-[11px] font-medium text-[#86868b]">
                    Found {testResults.length} matches:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {testResults.map((r, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-black/[0.04] flex gap-2.5 items-center">
                        {r.coverUrl ? (
                          <img src={r.coverUrl} alt={r.title} className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-14 bg-[#f5f5f7] rounded flex items-center justify-center text-[9px] text-[#86868b] flex-shrink-0">
                            No Img
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#1d1d1f] truncate">{r.title}</p>
                          <p className="text-[10px] text-[#86868b] truncate">{r.author}</p>
                          {r.coverId && (
                            <span className="text-[9px] font-mono text-[#0071e3]">Cover #{r.coverId}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Google Books Configuration */}
        {activeTab === 'google' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
              <h4 className="text-sm font-semibold text-[#1d1d1f]">Optional: Google Books API Key</h4>
              <p className="text-xs text-[#86868b] mt-1 leading-relaxed">
                Google Books has publisher-grade high-resolution book jacket scans. To avoid the shared anonymous quota limit (429 errors), paste your free Google Cloud Books API key below.
              </p>

              <div className="mt-4 space-y-2">
                <label className="text-[11px] font-medium text-[#1d1d1f]">Google Books API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={googleKey}
                    onChange={(e) => setGoogleKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="flex-1 bg-white border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                  <button
                    onClick={handleSaveKeys}
                    className="bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    Save Key
                  </button>
                </div>
                {saveSuccess && (
                  <p className="text-[11px] text-[#34c759] flex items-center gap-1 font-medium mt-1">
                    <Check className="w-3.5 h-3.5" /> Key saved to browser local storage!
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.05] text-[11px] text-[#86868b]">
                <span>How to get a key:</span> Go to <a href="https://console.cloud.google.com/apis/library/books.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline">Google Cloud Console &rarr; Books API</a> &rarr; Credentials &rarr; Create API Key. (Free, 50,000 requests/day).
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Hardcover GraphQL Configuration */}
        {activeTab === 'hardcover' && (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#f5f5f7] border border-black/[0.04]">
              <h4 className="text-sm font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Optional: Hardcover API Token
              </h4>
              <p className="text-xs text-[#86868b] mt-1 leading-relaxed">
                Hardcover.app is an open book community with native series modeling. By adding your Hardcover token, our app can cross-reference series sequences (<code className="text-[10px] bg-white px-1 py-0.5 rounded">position: 1, 2, 3</code>) directly via GraphQL.
              </p>

              <div className="mt-4 space-y-2">
                <label className="text-[11px] font-medium text-[#1d1d1f]">Hardcover Bearer Token</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={hardcoverToken}
                    onChange={(e) => setHardcoverToken(e.target.value)}
                    placeholder="Bearer token from Hardcover..."
                    className="flex-1 bg-white border border-black/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                  />
                  <button
                    onClick={handleSaveKeys}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    Save Token
                  </button>
                </div>
                {saveSuccess && (
                  <p className="text-[11px] text-[#34c759] flex items-center gap-1 font-medium mt-1">
                    <Check className="w-3.5 h-3.5" /> Token saved to browser local storage!
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-black/[0.05] text-[11px] text-[#86868b]">
                <span>How to get a token:</span> Create a free account at <a href="https://hardcover.app" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline">hardcover.app</a> &rarr; visit <a href="https://hardcover.app/account/api" target="_blank" rel="noopener noreferrer" className="text-[#0071e3] underline">hardcover.app/account/api</a> to generate your personal API token.
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-between items-center text-xs text-[#86868b] pt-4 border-t border-black/[0.06]">
          <span>Full Architecture Plan saved in project artifacts</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1d1d1f] hover:bg-[#333336] text-white font-medium shadow-sm transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
