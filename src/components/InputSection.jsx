import React, { useState } from 'react';
import { Upload, Link, BookCopy, FileText, Sparkles, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { parseGoodreadsCSV, fetchGoodreadsRss, SAMPLE_PRESETS } from '../services/goodreadsParser';

export default function InputSection({ onStartLessgoo, isLoading }) {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'link' | 'presets' | 'paste'
  const [urlInput, setUrlInput] = useState('');
  const [pasteInput, setPasteInput] = useState('');
  const [stagedBooks, setStagedBooks] = useState(null);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Handle CSV file upload
  const handleFileUpload = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text')) {
      setErrorMsg('Please upload a valid .csv file from Goodreads!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseGoodreadsCSV(text);
        if (parsed.length === 0) {
          setErrorMsg('No books could be found in this CSV. Please check the file formatting.');
          return;
        }
        setStagedBooks({
          source: file.name,
          books: parsed,
        });
      } catch (err) {
        setErrorMsg('Error reading CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Handle Public URL / RSS fetch
  const handleFetchUrl = async () => {
    if (!urlInput.trim()) {
      setErrorMsg('Please paste a Goodreads profile, shelf URL, or RSS feed link!');
      return;
    }
    setErrorMsg('');
    setIsFetchingUrl(true);

    try {
      const books = await fetchGoodreadsRss(urlInput.trim());
      if (books.length === 0) {
        throw new Error('No books found on this Goodreads shelf or profile.');
      }
      setStagedBooks({
        source: 'Goodreads Public Shelf',
        books,
      });
    } catch (err) {
      setErrorMsg(err.message || 'Could not fetch Goodreads books. Goodreads might restrict cross-origin requests. Try uploading your Goodreads export CSV instead!');
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Handle Preset selection
  const handleSelectPreset = (key) => {
    setErrorMsg('');
    const preset = SAMPLE_PRESETS[key];
    if (preset) {
      setStagedBooks({
        source: preset.name,
        books: preset.books,
      });
    }
  };

  // Handle pasted CSV
  const handleParsePasted = () => {
    if (!pasteInput.trim()) {
      setErrorMsg('Please paste your CSV contents first!');
      return;
    }
    setErrorMsg('');
    const parsed = parseGoodreadsCSV(pasteInput.trim());
    if (parsed.length === 0) {
      setErrorMsg('Could not parse any books from the pasted text. Ensure it has title/author headers.');
      return;
    }
    setStagedBooks({
      source: 'Pasted CSV Data',
      books: parsed,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Hero Welcome Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100/70 border border-rose-200 text-rose-700 text-xs font-semibold mb-3">
          <span>✨</span>
          <span>Find Out What Your Bookshelf Is Actually Worth</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Bookshelf <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500">Value Tracker</span> 📚✨
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mt-2">
          Drop in your exported Goodreads CSV, paste your public profile link, or try a cute demo shelf. Then hit <strong className="text-pink-600 font-black">LESSGOOO!</strong> to watch your catalogue tally up in real-time!
        </p>
      </div>

      {/* Main Cute Card Container */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-pink-100 shadow-[0_20px_50px_rgba(244,114,182,0.12)] p-6 sm:p-8">
        {/* Cute Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Goodreads CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'link'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4" />
            <span>Public URL / RSS</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Demo Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-pink-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste CSV</span>
          </button>
        </div>

        {/* Tab 1: CSV Upload Dropzone */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? 'border-pink-500 bg-pink-50/50 scale-[1.01]'
                : 'border-slate-200 hover:border-pink-300 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-16 h-16 rounded-3xl bg-pink-100 flex items-center justify-center mx-auto mb-4 text-pink-600 shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Drag & Drop your Goodreads CSV file here
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              or <span className="text-pink-600 font-bold underline">browse from your device</span>
            </p>

            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[11px] text-amber-800 font-medium">
              <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>To export: Goodreads.com ➔ My Books ➔ Import/Export ➔ Export Library</span>
            </div>
          </div>
        )}

        {/* Tab 2: Public URL / RSS Input */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700">
              Enter your public Goodreads profile URL, shelf link, or RSS feed:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.goodreads.com/review/list/12345678?shelf=read"
                className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-800"
              />
              <button
                onClick={handleFetchUrl}
                disabled={isFetchingUrl}
                className="bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isFetchingUrl ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <span>Load Books 🔗</span>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Note: Make sure your Goodreads account profile & shelves are set to Public.
            </p>
          </div>
        )}

        {/* Tab 3: Presets (Instant Demo) */}
        {activeTab === 'presets' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 mb-2">
              No CSV on hand right now? Pick an instant curated demo library to experience the tally:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.entries(SAMPLE_PRESETS).map(([key, p]) => (
                <div
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    stagedBooks?.source === p.name
                      ? 'border-pink-500 bg-pink-50/60 shadow-md scale-[1.02]'
                      : 'border-slate-200 hover:border-pink-300 bg-slate-50/40 hover:bg-white'
                  }`}
                >
                  <h4 className="font-bold text-sm text-slate-800">{p.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  <span className="inline-block mt-3 text-[11px] font-bold text-pink-600">
                    Load Collection ➔
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Paste Raw CSV */}
        {activeTab === 'paste' && (
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700">
              Paste the text content of your Goodreads export CSV below:
            </label>
            <textarea
              rows={5}
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder={`"Book Id","Title","Author","ISBN","Number of Pages"...\n"123","The Hobbit","J.R.R. Tolkien","0345339681","310"`}
              className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-800"
            />
            <button
              onClick={handleParsePasted}
              className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all"
            >
              Parse Pasted CSV
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Staged Books Summary & THE "LESSGOOO!" BUTTON */}
        {stagedBooks && stagedBooks.books.length > 0 && (
          <div className="mt-8 pt-6 border-t border-pink-100 flex flex-col items-center text-center animate-pop-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold mb-4 shadow-sm">
              <span>📚</span>
              <span>Loaded: <strong>{stagedBooks.books.length} books</strong> from {stagedBooks.source}</span>
            </div>

            {/* Quick mini-preview of first 6 book titles */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xl mb-6">
              {stagedBooks.books.slice(0, 6).map((b, idx) => (
                <span key={idx} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-1 rounded-full truncate max-w-[150px]">
                  {b.title}
                </span>
              ))}
              {stagedBooks.books.length > 6 && (
                <span className="text-[11px] text-slate-400 font-bold">
                  +{stagedBooks.books.length - 6} more
                </span>
              )}
            </div>

            {/* THE BIG "LESSGOOO! 🚀 ✨" BUTTON */}
            <button
              onClick={() => onStartLessgoo(stagedBooks.books)}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full text-xl sm:text-2xl font-black text-white bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:via-rose-600 hover:to-amber-600 shadow-[0_10px_30px_rgba(244,114,182,0.45)] hover:shadow-[0_15px_40px_rgba(244,114,182,0.6)] transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span className="animate-cute-bounce">🚀</span>
              <span>LESSGOOO!</span>
              <Sparkles className="w-6 h-6 animate-spin text-amber-200" />
            </button>
            <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase mt-2.5">
              Click to initiate catalogue population & real-time price counter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
