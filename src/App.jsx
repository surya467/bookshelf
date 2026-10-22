import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import StatsHeader from './components/StatsHeader';
import SeriesCard from './components/SeriesCard';
import BookshelfView from './components/BookshelfView';
import MissingTomesMarket from './components/MissingTomesMarket';
import BookDetailModal from './components/BookDetailModal';
import ImportModal from './components/ImportModal';
import OpenLibraryInfoModal from './components/OpenLibraryInfoModal';
import EmptyState from './components/EmptyState';
import { parseGoodreadsCSV } from './services/goodreadsParser';
import { resolveLibrarySeries } from './services/seriesResolver';
import { soundFX } from './services/soundFx';
import BookCard from './components/BookCard';

const DEMO_SAMPLE_CSV = `Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
20698371,"Harry Potter and the Chamber of Secrets: Selected Themes from the Motion Picture - Piano Solos: Piano Solos (Includes Souvenir Poster), Book & Poster",John   Williams,"Williams, John",,"=""0739082671""","=""9780739082676""",5.0,Alfred Publishing Co - eBooks Account,Kindle Edition,68,2011,2002,,2026/09/30,,,read,,,,1,0
5907,"The Hobbit, or There and Back Again",J.R.R. Tolkien,"Tolkien, J.R.R.","Douglas A. Anderson, Michael Hague, Jemima Catlin","=""""","=""""",5.0,Houghton Mifflin,Paperback,366,2002,1937,,2026/09/30,,,read,,,,1,0
42844155,"Harry Potter and the Philosopher's Stone (Harry Potter, #1)",J.K. Rowling,"Rowling, J.K.",Olly Moss,"=""""","=""""",5.0,Pottermore Publishing,Kindle Edition,333,2015,1997,,2026/09/30,,,read,,,,1,0
239754337,"Harry Potter and the Chamber of Secrets (Harry Potter, #2)",J.K. Rowling,"Rowling, J.K.","Hugh Laurie, Matthew MacFadyen, Kit Harington, Riz Ahmed, Michelle Gomez, Daniel Mays, Mark Addy, Simon Pegg, Cush Jumbo, Alex Hassell, Gemma Whelan, Indira Varma, Frankie Treadaway, Max Lester, Arabella Stanton","=""""","=""""",5.0,Pottermore Publishing and Audible Studios,Audiobook,10,2025,1998,,2026/09/30,,,read,,,,1,0
5,"Harry Potter and the Prisoner of Azkaban (Harry Potter, #3)",J.K. Rowling,"Rowling, J.K.",Mary GrandPrAc,"=""043965548X""","=""9780439655484""",5.0,Scholastic Inc.,Mass Market Paperback,547,2004,1999,,2026/09/30,,,read,,,,1,0`;

const STORAGE_KEY_DATA = 'bookshelf_library_v2';
const STORAGE_KEY_NAME = 'bookshelf_user_name_v2';

export default function App() {
  const [viewMode, setViewMode] = useState('series'); // 'series' | 'shelf' | 'market'
  const [seriesList, setSeriesList] = useState([]);
  const [standaloneBooks, setStandaloneBooks] = useState([]);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    totalRead: 0,
    totalMissing: 0,
    totalSeries: 0,
    completedSeries: 0,
    completionRate: 0,
    totalMissingCost: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOpenLibraryInfoOpen, setIsOpenLibraryInfoOpen] = useState(false);

  // Check localStorage on mount — Starts completely EMPTY if first time!
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY_DATA);
      const savedName = localStorage.getItem(STORAGE_KEY_NAME);

      if (savedName) {
        setUserName(savedName);
      }

      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.seriesList && parsed.seriesList.length > 0) {
          setSeriesList(parsed.seriesList);
          setStandaloneBooks(parsed.standaloneBooks || []);
          setStats(parsed.stats || {});
        }
      }
    } catch (e) {
      console.warn('Could not restore from localStorage:', e);
    }
  }, []);

  // Save changes to localStorage
  const persistState = (newSeriesList, newStandalone, newStats, newName = userName) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_DATA,
        JSON.stringify({
          seriesList: newSeriesList,
          standaloneBooks: newStandalone,
          stats: newStats,
        })
      );
      if (newName) {
        localStorage.setItem(STORAGE_KEY_NAME, newName);
      }
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  };

  // Handle toggling read state (mark unread missing book as read)
  const handleToggleRead = (targetBook) => {
    soundFX.init();

    const willBeRead = !targetBook.isRead;
    if (willBeRead) {
      soundFX.playUnlock();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#0071e3', '#34c759', '#1d1d1f', '#86868b'],
      });
    } else {
      soundFX.playPageFlip();
    }

    // Update inside seriesList
    let updatedSeriesList = seriesList.map((series) => {
      const hasTarget = series.books.some((b) => b.id === targetBook.id);
      if (!hasTarget) return series;

      const updatedBooks = series.books.map((b) => {
        if (b.id === targetBook.id) {
          return {
            ...b,
            isRead: willBeRead,
            isGreyedOut: !willBeRead,
          };
        }
        return b;
      });

      const readCount = updatedBooks.filter((b) => b.isRead).length;
      const totalCount = updatedBooks.length;
      const completionPercent = Math.round((readCount / totalCount) * 100);
      const isCompleted = readCount === totalCount;

      if (isCompleted && !series.isCompleted) {
        setTimeout(() => {
          soundFX.playSeriesMastery();
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.5 },
            colors: ['#0071e3', '#34c759', '#ff9500'],
          });
        }, 300);
      }

      return {
        ...series,
        books: updatedBooks,
        readCount,
        missingCount: totalCount - readCount,
        completionPercent,
        isCompleted,
      };
    });

    // Update standalone books if applicable
    let updatedStandalone = standaloneBooks.map((b) => {
      if (b.id === targetBook.id) {
        return {
          ...b,
          isRead: willBeRead,
          isGreyedOut: !willBeRead,
        };
      }
      return b;
    });

    // Recalculate global stats
    let totalRead = 0;
    let totalMissing = 0;
    let totalMissingCost = 0;
    let completedSeries = 0;
    let totalTrackedBooks = 0;

    updatedSeriesList.forEach((s) => {
      totalRead += s.readCount;
      totalMissing += s.missingCount;
      totalTrackedBooks += s.totalCount;
      if (s.isCompleted) completedSeries++;
      s.books.forEach((b) => {
        if (!b.isRead) totalMissingCost += b.price || 14.99;
      });
    });

    updatedStandalone.forEach((b) => {
      if (b.isRead) totalRead++;
    });

    const completionRate = totalTrackedBooks > 0 ? Math.round((totalRead / totalTrackedBooks) * 100) : 100;

    const newStats = {
      totalRead,
      totalMissing,
      totalSeries: updatedSeriesList.length,
      completedSeries,
      completionRate,
      totalMissingCost: Math.round(totalMissingCost * 100) / 100,
    };

    setSeriesList(updatedSeriesList);
    setStandaloneBooks(updatedStandalone);
    setStats(newStats);
    persistState(updatedSeriesList, updatedStandalone, newStats);

    if (selectedBook && selectedBook.id === targetBook.id) {
      setSelectedBook({
        ...selectedBook,
        isRead: willBeRead,
        isGreyedOut: !willBeRead,
      });
    }
  };

  // Import custom CSV
  const handleImportCSV = async (parsedBooks, name = '') => {
    setIsLoading(true);
    soundFX.playPageFlip();
    try {
      const resolved = await resolveLibrarySeries(parsedBooks);
      const newName = name || userName;

      setSeriesList(resolved.seriesList);
      setStandaloneBooks(resolved.standaloneBooks);
      setStats(resolved.stats);
      if (newName) {
        setUserName(newName);
      }

      persistState(resolved.seriesList, resolved.standaloneBooks, resolved.stats, newName);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0071e3', '#34c759'],
      });
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear / Reset to empty state so someone else can import
  const handleResetLibrary = () => {
    localStorage.removeItem(STORAGE_KEY_DATA);
    setSeriesList([]);
    setStandaloneBooks([]);
    setStats({
      totalRead: 0,
      totalMissing: 0,
      totalSeries: 0,
      completedSeries: 0,
      completionRate: 0,
      totalMissingCost: 0,
    });
  };

  // Update user name
  const handleUpdateUserName = (newName) => {
    setUserName(newName);
    localStorage.setItem(STORAGE_KEY_NAME, newName);
    persistState(seriesList, standaloneBooks, stats, newName);
  };

  // Load Demo library for curious visitors
  const handleLoadDemo = async (name = 'Surya') => {
    setIsLoading(true);
    soundFX.playClick();
    try {
      const parsed = parseGoodreadsCSV(DEMO_SAMPLE_CSV);
      await handleImportCSV(parsed, name);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSound = () => {
    const next = soundFX.toggleSound();
    setSoundEnabled(next);
  };

  const hasData = seriesList.length > 0 || standaloneBooks.length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col font-sans selection:bg-[#0071e3] selection:text-white">
      {/* Navigation */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenOpenLibraryInfo={() => setIsOpenLibraryInfoOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-10 h-10 border-2 border-black/[0.08] border-t-[#0071e3] rounded-full animate-spin mb-4" />
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Populating Bookshelf...</h3>
            <p className="text-xs text-[#86868b] mt-1">Resolving Open Library covers</p>
          </div>
        )}

        {/* Empty / Welcome Onboarding State (If no CSV imported yet) */}
        {!isLoading && !hasData && (
          <EmptyState
            onImportCSV={handleImportCSV}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {/* Populated Shelf State */}
        {!isLoading && hasData && (
          <>
            <StatsHeader
              stats={stats}
              userName={userName}
              onUpdateUserName={handleUpdateUserName}
              onSwitchToMarket={() => setViewMode('market')}
              onResetLibrary={handleResetLibrary}
            />

            {/* View 1: Series View */}
            {viewMode === 'series' && (
              <div className="animate-fadeIn">
                {seriesList.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onInspectBook={(book) => setSelectedBook(book)}
                    onToggleRead={handleToggleRead}
                  />
                ))}

                {/* Standalone Books */}
                {standaloneBooks && standaloneBooks.length > 0 && (
                  <div className="bg-white rounded-[32px] p-8 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] mb-8">
                    <div className="mb-6 pb-4 border-b border-black/[0.06]">
                      <h3 className="text-2xl font-semibold tracking-tight text-[#1d1d1f]">
                        Standalone Books & Companion Works
                      </h3>
                      <p className="text-xs text-[#86868b] mt-0.5">
                        Individual works and companion pieces from your collection
                      </p>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                      {standaloneBooks.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onInspect={(b) => setSelectedBook(b)}
                          onToggleRead={handleToggleRead}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 2: All Cards Grid */}
            {viewMode === 'shelf' && (
              <div className="animate-fadeIn">
                <BookshelfView
                  seriesList={seriesList}
                  standaloneBooks={standaloneBooks}
                  onInspectBook={(book) => setSelectedBook(book)}
                  onToggleRead={handleToggleRead}
                />
              </div>
            )}

            {/* View 3: Missing Books Wishlist */}
            {viewMode === 'market' && (
              <div className="animate-fadeIn">
                <MissingTomesMarket
                  seriesList={seriesList}
                  onInspectBook={(book) => setSelectedBook(book)}
                  onToggleRead={handleToggleRead}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Minimal Apple-Style Footer */}
      <footer className="w-full bg-white/60 border-t border-black/[0.04] py-8 px-4 text-center text-xs text-[#86868b]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-[#1d1d1f]">Bookshelf</span> &bull; Minimal Series Completionist
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOpenLibraryInfoOpen(true)}
              className="hover:text-[#1d1d1f] transition-colors"
            >
              Open Library API
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsImportOpen(true)}
              className="hover:text-[#1d1d1f] transition-colors"
            >
              Import CSV
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onToggleRead={handleToggleRead}
        />
      )}

      {isImportOpen && (
        <ImportModal
          onClose={() => setIsImportOpen(false)}
          onImportCSV={handleImportCSV}
          currentUserName={userName}
        />
      )}

      {isOpenLibraryInfoOpen && (
        <OpenLibraryInfoModal
          onClose={() => setIsOpenLibraryInfoOpen(false)}
        />
      )}
    </div>
  );
}
