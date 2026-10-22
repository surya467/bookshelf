import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, Layers, Check, Bookmark, Lock } from 'lucide-react';

export default function SearchBar({
  seriesList = [],
  standaloneBooks = [],
  wantToReadStandalone = [],
  onSelectBook,
  isNight = false,
}) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Global keyboard shortcut '/' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const cleanQ = query.trim().toLowerCase();

  // Search results calculation
  const matchingSeries = [];
  const matchingBooks = [];

  if (cleanQ.length >= 2) {
    // 1. Match series
    for (const s of seriesList) {
      if (s.name.toLowerCase().includes(cleanQ) || (s.author && s.author.toLowerCase().includes(cleanQ))) {
        matchingSeries.push(s);
      }
      // Also match individual books inside series
      for (const b of s.books) {
        if (
          b.title.toLowerCase().includes(cleanQ) ||
          (b.author && b.author.toLowerCase().includes(cleanQ))
        ) {
          matchingBooks.push(b);
        }
      }
    }

    // 2. Match standalone books
    for (const b of [...standaloneBooks, ...wantToReadStandalone]) {
      if (
        b.title.toLowerCase().includes(cleanQ) ||
        (b.author && b.author.toLowerCase().includes(cleanQ))
      ) {
        matchingBooks.push(b);
      }
    }
  }

  const handleJumpToSeries = (series) => {
    setIsOpen(false);
    setQuery('');
    const el = document.getElementById(`series-${series.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('book-search-pulse');
      setTimeout(() => el.classList.remove('book-search-pulse'), 2500);
    }
  };

  const handleJumpToBook = (book) => {
    setIsOpen(false);
    setQuery('');
    const el = document.getElementById(`book-${book.id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('book-search-pulse');
      setTimeout(() => el.classList.remove('book-search-pulse'), 2500);
    }
    if (onSelectBook) {
      onSelectBook(book);
    }
  };

  const hasResults = matchingSeries.length > 0 || matchingBooks.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className={`w-3.5 h-3.5 absolute left-3 pointer-events-none ${
          isNight ? 'text-white/40' : 'text-neutral-400'
        }`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search books, authors, series..."
          className={`w-full text-xs pl-8 pr-16 py-1.5 rounded-full border transition-all ${
            isNight
              ? 'bg-white/5 hover:bg-white/[0.08] focus:bg-[#12141c] text-white border-white/10 focus:border-[#0071e3] placeholder:text-white/30'
              : 'bg-white hover:bg-neutral-50 focus:bg-white text-neutral-900 border-black/10 focus:border-[#0071e3] placeholder:text-neutral-400 shadow-sm'
          }`}
        />

        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className={`absolute right-2.5 p-0.5 rounded-full hover:bg-black/10 ${
              isNight ? 'text-white/40 hover:text-white' : 'text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <kbd className={`hidden sm:inline-block absolute right-2.5 px-1.5 py-0.5 text-[9px] font-mono rounded border pointer-events-none ${
            isNight ? 'text-white/40 bg-white/10 border-white/10' : 'text-neutral-400 bg-neutral-100 border-neutral-200'
          }`}>
            /
          </kbd>
        )}
      </div>

      {/* Instant Search Results Dropdown */}
      {isOpen && cleanQ.length >= 2 && (
        <div className={`absolute top-full left-0 right-0 mt-2 backdrop-blur-2xl border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] max-h-[70vh] overflow-y-auto p-2 z-50 animate-fadeIn ${
          isNight
            ? 'bg-[#12141c]/98 border-white/15 text-white shadow-[0_20px_60px_rgba(0,0,0,0.95)]'
            : 'bg-white/98 border-black/10 text-neutral-900'
        }`}>
          {!hasResults && (
            <div className="p-4 text-center text-xs opacity-50">
              No matching books or series found for "{query}".
            </div>
          )}

          {/* Series Matches */}
          {matchingSeries.length > 0 && (
            <div className="mb-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider opacity-50 px-2.5 py-1 block">
                Series ({matchingSeries.length})
              </span>
              <div className="space-y-0.5">
                {matchingSeries.slice(0, 5).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleJumpToSeries(s)}
                    className="w-full text-left p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="w-3.5 h-3.5 text-[#0071e3] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-[#0071e3]">
                          {s.name}
                        </p>
                        <p className="text-[10px] opacity-60 truncate">{s.author}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono opacity-50 px-1.5 py-0.5 rounded">
                      {s.readCount}/{s.totalCount} read
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Books Matches */}
          {matchingBooks.length > 0 && (
            <div>
              <span className="text-[9px] font-semibold uppercase tracking-wider opacity-50 px-2.5 py-1 block">
                Books ({matchingBooks.length})
              </span>
              <div className="space-y-0.5">
                {matchingBooks.slice(0, 12).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleJumpToBook(b)}
                    className="w-full text-left p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {b.coverUrl ? (
                        <img
                          src={b.coverUrl}
                          alt={b.title}
                          className="w-7 h-10 object-cover rounded shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-10 rounded bg-black/5 dark:bg-white/5 border flex items-center justify-center text-[8px] opacity-50 flex-shrink-0">
                          Book
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate group-hover:text-[#0071e3]">
                          {b.title}
                        </p>
                        <p className="text-[10px] opacity-60 truncate">
                          {b.seriesName ? `${b.seriesName} • ` : ''}
                          {b.author}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {b.isRead ? (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Read
                        </span>
                      ) : b.isWantToRead ? (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-0.5">
                          Wishlist
                        </span>
                      ) : (
                        <span className="text-[10px] opacity-50 flex items-center gap-0.5">
                          Missing
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
