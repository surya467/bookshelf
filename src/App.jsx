import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import ComicVerseHeroHeader from './components/ComicVerseHeroHeader';
import ComicVerseCatalog from './components/ComicVerseCatalog';
import CylindricalArena3D from './components/CylindricalArena3D';
import StaggeredPanels from './components/StaggeredPanels';
import ComicVerseFooter from './components/ComicVerseFooter';
import InteractiveDock from './components/InteractiveDock';
import AmbientCanvas from './components/AmbientCanvas';
import BookDetailModal from './components/BookDetailModal';
import ImportModal from './components/ImportModal';
import OpenLibraryInfoModal from './components/OpenLibraryInfoModal';
import EmptyState from './components/EmptyState';
import GlobalBookTooltip from './components/GlobalBookTooltip';
import SortingBooksLoader from './components/SortingBooksLoader';
import { parseGoodreadsCSV } from './services/goodreadsParser';
import { resolveLibrarySeries } from './services/seriesResolver';
import { enrichCoversInBackground } from './services/openLibrary';
import { soundFX } from './services/soundFx';

const DEMO_SAMPLE_CSV = `Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
20698371,"Harry Potter and the Chamber of Secrets: Selected Themes from the Motion Picture - Piano Solos: Piano Solos (Includes Souvenir Poster), Book & Poster",John Williams,"Williams, John",,"=""0739082671""","=""9780739082676""",5.0,Alfred Publishing Co - eBooks Account,Kindle Edition,68,2011,2002,,2026/09/30,,,read,,,,1,0
5907,"The Hobbit, or There and Back Again",J.R.R. Tolkien,"Tolkien, J.R.R.","Douglas A. Anderson, Michael Hague, Jemima Catlin","=""""","=""""",5.0,Houghton Mifflin,Paperback,366,2002,1937,,2026/09/30,,,read,,,,1,0
42844155,"Harry Potter and the Philosopher's Stone (Harry Potter, #1)",J.K. Rowling,"Rowling, J.K.",Olly Moss,"=""""","=""""",5.0,Pottermore Publishing,Kindle Edition,333,2015,1997,,2026/09/30,,,read,,,,1,0
239754337,"Harry Potter and the Chamber of Secrets (Harry Potter, #2)",J.K. Rowling,"Rowling, J.K.","Hugh Laurie, Matthew MacFadyen, Kit Harington, Riz Ahmed, Michelle Gomez, Daniel Mays, Mark Addy, Simon Pegg, Cush Jumbo, Alex Hassell, Gemma Whelan, Indira Varma, Frankie Treadaway, Max Lester, Arabella Stanton","=""""","=""""",5.0,Pottermore Publishing and Audible Studios,Audiobook,10,2025,1998,,2026/09/30,,,read,,,,1,0
5,"Harry Potter and the Prisoner of Azkaban (Harry Potter, #3)",J.K. Rowling,"Rowling, J.K.",Mary GrandPrAc,"=""043965548X""","=""9780439655484""",5.0,Scholastic Inc.,Mass Market Paperback,547,2004,1999,,2026/09/30,,,read,,,,1,0`;

const STORAGE_KEY_DATA = 'bookshelf_library_v4';
const STORAGE_KEY_NAME = 'bookshelf_user_name_v4';
const STORAGE_KEY_VIEW = 'bookshelf_view_mode_v5';

const getStoredApiKeys = () => {
  try {
    const raw = localStorage.getItem('bookshelf_api_keys');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

function cleanForMatch(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

export default function App() {
  const [seriesList, setSeriesList] = useState([]);
  const [standaloneBooks, setStandaloneBooks] = useState([]);
  const [wantToReadStandalone, setWantToReadStandalone] = useState([]);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    totalRead: 0,
    totalWantToRead: 0,
    totalMissing: 0,
    totalSeries: 0,
    completedSeries: 0,
    completionRate: 0,
    totalMissingCost: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingBookCount, setLoadingBookCount] = useState(0);

  // View Mode: 'catalog' (Image 3) | 'arena' (Image 2) | 'panels' (Image 1)
  const [viewMode, setViewMode] = useState('catalog');

  // Filter State: 'all' | 'read' | 'tbr' | 'completed' | 'missing'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Tooltip & Modals
  const [activeHover, setActiveHover] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOpenLibraryInfoOpen, setIsOpenLibraryInfoOpen] = useState(false);

  // Keyboard shortcut listener: 1: Catalog, 2: 3D Arena, 3: Panels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') setViewMode('catalog');
      if (e.key === '2') setViewMode('arena');
      if (e.key === '3') setViewMode('panels');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const cachedName = localStorage.getItem(STORAGE_KEY_NAME);
      if (cachedName) setUserName(cachedName);

      const cachedView = localStorage.getItem(STORAGE_KEY_VIEW);
      if (cachedView) setViewMode(cachedView);

      const raw = localStorage.getItem(STORAGE_KEY_DATA);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.seriesList && parsed.seriesList.length > 0) {
          setSeriesList(parsed.seriesList);
          setStandaloneBooks(parsed.standaloneBooks || []);
          setWantToReadStandalone(parsed.wantToReadStandalone || []);
          setStats(
            parsed.stats || {
              totalRead: 0,
              totalWantToRead: 0,
              totalMissing: 0,
              totalSeries: 0,
              completedSeries: 0,
              completionRate: 0,
              totalMissingCost: 0,
            }
          );
        }
      }
    } catch (e) {
      console.warn('Could not read cached library data:', e);
    }
  }, []);

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem(STORAGE_KEY_VIEW, mode);
  };

  const persistState = (newSeries, newStandalone, newWantToRead, newStats, nameToSave) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_DATA,
        JSON.stringify({
          seriesList: newSeries,
          standaloneBooks: newStandalone,
          wantToReadStandalone: newWantToRead,
          stats: newStats,
        })
      );
      if (nameToSave) {
        localStorage.setItem(STORAGE_KEY_NAME, nameToSave);
      }
    } catch (e) {
      console.warn('Could not persist library data:', e);
    }
  };

  const handleToggleRead = (targetBook) => {
    if (!targetBook) return;
    const willBeRead = !targetBook.isRead;

    if (willBeRead) {
      soundFX.playUnlock();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#ff2d55', '#34c759', '#ffffff'],
      });
    } else {
      soundFX.playClick();
    }

    const matchesBook = (b) => {
      if (!b) return false;
      if (b.id && targetBook.id && String(b.id) === String(targetBook.id)) return true;
      if (b.title && targetBook.title && cleanForMatch(b.title) === cleanForMatch(targetBook.title)) {
        if (!b.author || !targetBook.author || cleanForMatch(b.author) === cleanForMatch(targetBook.author)) {
          return true;
        }
      }
      return false;
    };

    let updatedSeriesList = seriesList.map((s) => {
      let changed = false;
      const updatedBooks = s.books.map((b) => {
        if (matchesBook(b)) {
          changed = true;
          return {
            ...b,
            isRead: willBeRead,
            isGreyedOut: !willBeRead,
            isWantToRead: willBeRead ? false : b.isWantToRead,
          };
        }
        return b;
      });

      if (changed) {
        const readCount = updatedBooks.filter((b) => b.isRead).length;
        const totalCount = updatedBooks.length;
        return {
          ...s,
          books: updatedBooks,
          readCount,
          totalCount,
          isCompleted: readCount === totalCount,
        };
      }
      return s;
    });

    let updatedStandalone = standaloneBooks.map((b) => {
      if (matchesBook(b)) {
        return {
          ...b,
          isRead: willBeRead,
          isGreyedOut: !willBeRead,
          isWantToRead: willBeRead ? false : b.isWantToRead,
        };
      }
      return b;
    });

    let updatedWantToRead = wantToReadStandalone.map((b) => {
      if (matchesBook(b)) {
        return {
          ...b,
          isRead: willBeRead,
          isGreyedOut: !willBeRead,
          isWantToRead: willBeRead ? false : b.isWantToRead,
        };
      }
      return b;
    });

    let totalRead = 0;
    let totalMissing = 0;
    let totalWantToRead = 0;
    let completedSeries = 0;
    let totalMissingCost = 0;

    updatedSeriesList.forEach((s) => {
      if (s.isCompleted) completedSeries++;
      s.books.forEach((b) => {
        if (b.isRead) totalRead++;
        else if (b.isWantToRead) totalWantToRead++;
        else {
          totalMissing++;
          totalMissingCost += b.price || 14.99;
        }
      });
    });

    updatedStandalone.forEach((b) => {
      if (b.isRead) totalRead++;
      else if (b.isWantToRead) totalWantToRead++;
      else totalMissing++;
    });

    updatedWantToRead.forEach((b) => {
      if (b.isRead) totalRead++;
      else totalWantToRead++;
    });

    const totalSeries = updatedSeriesList.length;
    const completionRate = totalSeries > 0 ? Math.round((completedSeries / totalSeries) * 100) : 0;

    const newStats = {
      totalRead,
      totalWantToRead,
      totalMissing,
      totalSeries,
      completedSeries,
      completionRate,
      totalMissingCost: Math.round(totalMissingCost),
    };

    setSeriesList(updatedSeriesList);
    setStandaloneBooks(updatedStandalone);
    setWantToReadStandalone(updatedWantToRead);
    setStats(newStats);
    persistState(updatedSeriesList, updatedStandalone, updatedWantToRead, newStats, userName);

    if (selectedBook && matchesBook(selectedBook)) {
      setSelectedBook({
        ...selectedBook,
        isRead: willBeRead,
        isGreyedOut: !willBeRead,
        isWantToRead: willBeRead ? false : selectedBook.isWantToRead,
      });
    }
  };

  const handleImportCSV = async (parsedBooks, name) => {
    try {
      setIsLoading(true);
      setLoadingBookCount(parsedBooks.length);
      soundFX.playClick();

      const apiSettings = getStoredApiKeys();
      const resolved = await resolveLibrarySeries(parsedBooks, apiSettings);
      const newName = name || userName;

      setSeriesList(resolved.seriesList);
      setStandaloneBooks(resolved.standaloneBooks);
      setWantToReadStandalone(resolved.wantToReadStandalone || []);
      setStats(resolved.stats);
      if (newName) setUserName(newName);

      persistState(resolved.seriesList, resolved.standaloneBooks, resolved.wantToReadStandalone || [], resolved.stats, newName);

      setTimeout(() => {
        setIsLoading(false);
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#ff2d55', '#34c759', '#ffffff'],
        });
      }, 450);

      const allBooks = [];
      resolved.seriesList.forEach((s) => allBooks.push(...s.books));
      allBooks.push(...resolved.standaloneBooks, ...(resolved.wantToReadStandalone || []));

      enrichCoversInBackground(allBooks, apiSettings, (bookId, coverUrl) => {
        setSeriesList((prev) =>
          prev.map((s) => ({
            ...s,
            books: s.books.map((b) => (b.id === bookId ? { ...b, coverUrl } : b)),
          }))
        );
        setStandaloneBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, coverUrl } : b))
        );
        setWantToReadStandalone((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, coverUrl } : b))
        );
      });
    } catch (e) {
      console.error('Import error:', e);
      setIsLoading(false);
    }
  };

  const handleResetLibrary = () => {
    localStorage.removeItem(STORAGE_KEY_DATA);
    setSeriesList([]);
    setStandaloneBooks([]);
    setWantToReadStandalone([]);
    setStats({
      totalRead: 0,
      totalWantToRead: 0,
      totalMissing: 0,
      totalSeries: 0,
      completedSeries: 0,
      completionRate: 0,
      totalMissingCost: 0,
    });
  };

  const handleUpdateUserName = (newName) => {
    setUserName(newName);
    localStorage.setItem(STORAGE_KEY_NAME, newName);
    persistState(seriesList, standaloneBooks, wantToReadStandalone, stats, newName);
  };

  const handleLoadDemo = async (name = 'Surya') => {
    soundFX.playClick();
    const parsed = parseGoodreadsCSV(DEMO_SAMPLE_CSV);
    await handleImportCSV(parsed, name);
  };

  const hasData = seriesList.length > 0 || standaloneBooks.length > 0 || wantToReadStandalone.length > 0;

  // Filter books by searchQuery if typed
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return seriesList;
    const q = searchQuery.toLowerCase().trim();
    return seriesList.map((s) => ({
      ...s,
      books: s.books.filter((b) =>
        b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      ),
    })).filter((s) => s.books.length > 0);
  }, [seriesList, searchQuery]);

  const filteredStandalone = useMemo(() => {
    if (!searchQuery.trim()) return standaloneBooks;
    const q = searchQuery.toLowerCase().trim();
    return standaloneBooks.filter((b) =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [standaloneBooks, searchQuery]);

  const filteredWantToRead = useMemo(() => {
    if (!searchQuery.trim()) return wantToReadStandalone;
    const q = searchQuery.toLowerCase().trim();
    return wantToReadStandalone.filter((b) =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
    );
  }, [wantToReadStandalone, searchQuery]);

  const handleSelectBook = (book) => {
    if (!book) return;
    setSelectedBook(book);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#ff2d55] selection:text-white relative bg-[#08090d] text-neutral-100 overflow-x-hidden">
      {/* Living Atmospheric Dust & Dynamic Lighting */}
      <AmbientCanvas />

      {/* Global Fixed Non-Clipping Tooltip */}
      <GlobalBookTooltip activeHover={activeHover} isNight={true} />

      {/* High-Contrast Comic Verse Header */}
      <Navbar
        userName={userName}
        onOpenImport={() => setIsImportOpen(true)}
        onResetLibrary={handleResetLibrary}
        onOpenOpenLibraryInfo={() => setIsOpenLibraryInfoOpen(true)}
        hasData={hasData}
        seriesList={seriesList}
        standaloneBooks={standaloneBooks}
        wantToReadStandalone={wantToReadStandalone}
        onSelectBook={handleSelectBook}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-2 pb-24 relative z-10">
        {/* Animated Sorting Loader */}
        {isLoading && (
          <SortingBooksLoader totalBooks={loadingBookCount} />
        )}

        {/* Empty / Onboarding State */}
        {!isLoading && !hasData && (
          <EmptyState
            onImportCSV={handleImportCSV}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {/* Loaded Vault & Visual Modes */}
        {!isLoading && hasData && (
          <div className="w-full">
            {/* Comic Verse Hero Header (Giant CATALOG Headline & Filter Bar from Image 3) */}
            <ComicVerseHeroHeader
              stats={stats}
              userName={userName}
              onUpdateUserName={handleUpdateUserName}
              activeFilter={activeFilter}
              onChangeFilter={(f) => setActiveFilter(f)}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
            />

            {/* VIEW MODE 1: COLLECTIBLE CATALOG GRID (Reference Image 3) */}
            {viewMode === 'catalog' && (
              <ComicVerseCatalog
                seriesList={filteredSeries}
                standaloneBooks={filteredStandalone}
                wantToReadStandalone={filteredWantToRead}
                activeFilter={activeFilter}
                onChangeFilter={(f) => setActiveFilter(f)}
                onInspectBook={handleSelectBook}
                onToggleRead={handleToggleRead}
              />
            )}

            {/* VIEW MODE 2: 3D CYLINDRICAL ARENA (Reference Image 2) */}
            {viewMode === 'arena' && (
              <CylindricalArena3D
                seriesList={filteredSeries}
                standaloneBooks={filteredStandalone}
                wantToReadStandalone={filteredWantToRead}
                activeFilter={activeFilter}
                onInspectBook={handleSelectBook}
                onToggleRead={handleToggleRead}
              />
            )}

            {/* VIEW MODE 3: STAGGERED CHAPTER PANELS (Reference Image 1) */}
            {viewMode === 'panels' && (
              <StaggeredPanels
                seriesList={filteredSeries}
                standaloneBooks={filteredStandalone}
                wantToReadStandalone={filteredWantToRead}
                activeFilter={activeFilter}
                onInspectBook={handleSelectBook}
                onToggleRead={handleToggleRead}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Apple-Style Interactive Dock */}
      {hasData && (
        <InteractiveDock
          viewMode={viewMode}
          onChangeViewMode={handleSetViewMode}
        />
      )}

      {/* Comic Verse Distressed Paper Separator & Giant Bold Footer (Reference Image 3) */}
      <ComicVerseFooter stats={stats} userName={userName} />

      {/* 360° Interactive Turntable Dossier Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onToggleRead={handleToggleRead}
        />
      )}

      {/* Import CSV Modal */}
      {isImportOpen && (
        <ImportModal
          onClose={() => setIsImportOpen(false)}
          onImportCSV={handleImportCSV}
          currentUserName={userName}
        />
      )}

      {/* Open Library Info Modal */}
      {isOpenLibraryInfoOpen && (
        <OpenLibraryInfoModal
          onClose={() => setIsOpenLibraryInfoOpen(false)}
        />
      )}
    </div>
  );
}
