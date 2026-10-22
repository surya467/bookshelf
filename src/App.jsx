import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import WallShelf from './components/WallShelf';
import BookDetailModal from './components/BookDetailModal';
import ImportModal from './components/ImportModal';
import OpenLibraryInfoModal from './components/OpenLibraryInfoModal';
import EmptyState from './components/EmptyState';
import AmbientCanvas from './components/AmbientCanvas';
import GlobalBookTooltip from './components/GlobalBookTooltip';
import SortingBooksLoader from './components/SortingBooksLoader';
import { parseGoodreadsCSV } from './services/goodreadsParser';
import { resolveLibrarySeries } from './services/seriesResolver';
import { enrichCoversInBackground } from './services/openLibrary';
import { soundFX } from './services/soundFx';

const DEMO_SAMPLE_CSV = `Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
20698371,"Harry Potter and the Chamber of Secrets: Selected Themes from the Motion Picture - Piano Solos: Piano Solos (Includes Souvenir Poster), Book & Poster",John   Williams,"Williams, John",,"=""0739082671""","=""9780739082676""",5.0,Alfred Publishing Co - eBooks Account,Kindle Edition,68,2011,2002,,2026/09/30,,,read,,,,1,0
5907,"The Hobbit, or There and Back Again",J.R.R. Tolkien,"Tolkien, J.R.R.","Douglas A. Anderson, Michael Hague, Jemima Catlin","=""""","=""""",5.0,Houghton Mifflin,Paperback,366,2002,1937,,2026/09/30,,,read,,,,1,0
42844155,"Harry Potter and the Philosopher's Stone (Harry Potter, #1)",J.K. Rowling,"Rowling, J.K.",Olly Moss,"=""""","=""""",5.0,Pottermore Publishing,Kindle Edition,333,2015,1997,,2026/09/30,,,read,,,,1,0
239754337,"Harry Potter and the Chamber of Secrets (Harry Potter, #2)",J.K. Rowling,"Rowling, J.K.","Hugh Laurie, Matthew MacFadyen, Kit Harington, Riz Ahmed, Michelle Gomez, Daniel Mays, Mark Addy, Simon Pegg, Cush Jumbo, Alex Hassell, Gemma Whelan, Indira Varma, Frankie Treadaway, Max Lester, Arabella Stanton","=""""","=""""",5.0,Pottermore Publishing and Audible Studios,Audiobook,10,2025,1998,,2026/09/30,,,read,,,,1,0
5,"Harry Potter and the Prisoner of Azkaban (Harry Potter, #3)",J.K. Rowling,"Rowling, J.K.",Mary GrandPrAc,"=""043965548X""","=""9780439655484""",5.0,Scholastic Inc.,Mass Market Paperback,547,2004,1999,,2026/09/30,,,read,,,,1,0`;

const STORAGE_KEY_DATA = 'bookshelf_library_v4';
const STORAGE_KEY_NAME = 'bookshelf_user_name_v4';

const getStoredApiKeys = () => {
  try {
    const raw = localStorage.getItem('bookshelf_api_keys');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Intelligent Shelf Packing Algorithm:
 * - Packs multiple series onto a single shelf row.
 * - Fills any leftover space on a shelf with single/standalone books.
 * - Compares book counts against shelf capacity (e.g. 12-14 books per shelf).
 */
function packBookshelf(seriesList, standaloneBooks, wantToReadStandalone, capacity = 13) {
  const shelves = [];
  let currentShelfItems = [];
  let currentShelfUsed = 0;

  // Single books pool: both standalone read and standalone want-to-read
  const allSingleBooks = [
    ...(standaloneBooks || []),
    ...(wantToReadStandalone || []),
  ];
  let singleBooksQueue = [...allSingleBooks];

  for (const series of seriesList) {
    const seriesSize = series.books.length;

    // If this series fits on the current shelf alongside already mounted series
    if (currentShelfUsed + seriesSize <= capacity) {
      currentShelfItems.push({ type: 'series', data: series });
      currentShelfUsed += seriesSize;
    } else {
      // If current shelf has room for single books, fill the remaining slots with single books!
      const leftoverSlots = capacity - currentShelfUsed;
      if (leftoverSlots > 0 && singleBooksQueue.length > 0) {
        const fillBooks = singleBooksQueue.splice(0, leftoverSlots);
        currentShelfItems.push({
          type: 'standalone-group',
          title: 'Single Editions',
          books: fillBooks,
        });
        currentShelfUsed += fillBooks.length;
      }

      if (currentShelfItems.length > 0) {
        shelves.push(currentShelfItems);
      }

      // Start new shelf for this series
      currentShelfItems = [{ type: 'series', data: series }];
      currentShelfUsed = seriesSize;
    }
  }

  // Pack any remaining single books across subsequent shelves
  while (singleBooksQueue.length > 0) {
    const leftoverSlots = capacity - currentShelfUsed;
    if (leftoverSlots > 0) {
      const fillBooks = singleBooksQueue.splice(0, leftoverSlots);
      currentShelfItems.push({
        type: 'standalone-group',
        title: currentShelfItems.length === 0 ? 'Individual Works & Wishlist' : 'Single Editions',
        books: fillBooks,
      });
      currentShelfUsed += fillBooks.length;
    }
    if (singleBooksQueue.length > 0) {
      shelves.push(currentShelfItems);
      currentShelfItems = [];
      currentShelfUsed = 0;
    }
  }

  if (currentShelfItems.length > 0) {
    shelves.push(currentShelfItems);
  }

  return shelves;
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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bookSize, setBookSize] = useState('default'); // 'compact' | 'default'

  // Non-clipping Global Tooltip Hover State
  const [activeHover, setActiveHover] = useState(null);

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOpenLibraryInfoOpen, setIsOpenLibraryInfoOpen] = useState(false);

  // Check localStorage on mount
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
          setWantToReadStandalone(parsed.wantToReadStandalone || []);
          setStats(parsed.stats || {});
        }
      }
    } catch (e) {
      console.warn('Could not restore from localStorage:', e);
    }
  }, []);

  const persistState = (newSeriesList, newStandalone, newWantToRead, newStats, newName = userName) => {
    try {
      localStorage.setItem(
        STORAGE_KEY_DATA,
        JSON.stringify({
          seriesList: newSeriesList,
          standaloneBooks: newStandalone,
          wantToReadStandalone: newWantToRead,
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

  const handleToggleRead = (targetBook) => {
    soundFX.init();
    const willBeRead = !targetBook.isRead;

    if (willBeRead) {
      soundFX.playFanfare();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#0071e3', '#34c759', '#fbfbfa'],
      });
    } else {
      soundFX.playClick();
    }

    let updatedSeriesList = seriesList.map((s) => {
      let changed = false;
      const updatedBooks = s.books.map((b) => {
        if (b.id === targetBook.id) {
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

      if (!changed) return s;

      const readCount = updatedBooks.filter((b) => b.isRead).length;
      const totalCount = updatedBooks.length;
      const percent = Math.round((readCount / totalCount) * 100);

      return {
        ...s,
        books: updatedBooks,
        readCount,
        missingCount: totalCount - readCount,
        completionPercent: percent,
        isCompleted: readCount === totalCount,
      };
    });

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

    let updatedWantToRead = wantToReadStandalone.map((b) => {
      if (b.id === targetBook.id) {
        return {
          ...b,
          isRead: willBeRead,
          isGreyedOut: !willBeRead,
        };
      }
      return b;
    });

    let totalRead = 0;
    let totalWantToRead = 0;
    let totalMissing = 0;
    let totalMissingCost = 0;
    let completedSeries = 0;
    let totalTrackedBooks = 0;

    updatedSeriesList.forEach((s) => {
      totalTrackedBooks += s.totalCount;
      totalRead += s.readCount;
      totalMissing += s.missingCount;
      if (s.isCompleted) completedSeries++;
      s.books.forEach((b) => {
        if (!b.isRead) totalMissingCost += b.price || 14.99;
        if (b.isWantToRead && !b.isRead) totalWantToRead++;
      });
    });

    updatedStandalone.forEach((b) => {
      if (b.isRead) totalRead++;
    });

    updatedWantToRead.forEach((b) => {
      if (!b.isRead) totalWantToRead++;
    });

    const completionRate = totalTrackedBooks > 0 ? Math.round((totalRead / totalTrackedBooks) * 100) : 100;

    const newStats = {
      totalRead,
      totalWantToRead,
      totalMissing,
      totalSeries: updatedSeriesList.length,
      completedSeries,
      completionRate,
      totalMissingCost: Math.round(totalMissingCost * 100) / 100,
    };

    setSeriesList(updatedSeriesList);
    setStandaloneBooks(updatedStandalone);
    setWantToReadStandalone(updatedWantToRead);
    setStats(newStats);
    persistState(updatedSeriesList, updatedStandalone, updatedWantToRead, newStats);

    if (selectedBook && selectedBook.id === targetBook.id) {
      setSelectedBook({
        ...selectedBook,
        isRead: willBeRead,
        isGreyedOut: !willBeRead,
      });
    }
  };

  const handleImportCSV = async (parsedBooks, name = '') => {
    setIsLoading(true);
    setLoadingBookCount(parsedBooks ? parsedBooks.length : 0);
    soundFX.playPageFlip();

    try {
      const apiSettings = getStoredApiKeys();
      // Near-instant synchronous resolution (< 30ms for 1,000+ books)
      const resolved = await resolveLibrarySeries(parsedBooks, apiSettings);
      const newName = name || userName;

      setSeriesList(resolved.seriesList);
      setStandaloneBooks(resolved.standaloneBooks);
      setWantToReadStandalone(resolved.wantToReadStandalone || []);
      setStats(resolved.stats);
      if (newName) {
        setUserName(newName);
      }

      persistState(resolved.seriesList, resolved.standaloneBooks, resolved.wantToReadStandalone || [], resolved.stats, newName);

      // Brief animation pause for visual delight, then reveal shelves
      setTimeout(() => {
        setIsLoading(false);
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#0071e3', '#34c759', '#ffffff'],
        });
      }, 500);

      // Non-blocking background worker to enrich covers for books that had no ISBN
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

  const handleToggleSound = () => {
    const next = soundFX.toggleSound();
    setSoundEnabled(next);
  };

  const handleHoverStart = useCallback((book, rect) => {
    setActiveHover({ book, rect });
  }, []);

  const handleHoverEnd = useCallback(() => {
    setActiveHover(null);
  }, []);

  const hasData = seriesList.length > 0 || standaloneBooks.length > 0 || wantToReadStandalone.length > 0;

  // Compute compact multi-series packed shelves
  const shelfCapacity = bookSize === 'compact' ? 15 : 12;
  const packedShelves = useMemo(() => {
    return packBookshelf(seriesList, standaloneBooks, wantToReadStandalone, shelfCapacity);
  }, [seriesList, standaloneBooks, wantToReadStandalone, shelfCapacity]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#0071e3] selection:text-white bg-[#060709] text-white relative overflow-x-hidden">
      {/* Interactive WebGL / Canvas Ambient Lighting & Dust Particles */}
      <AmbientCanvas />

      {/* Global Fixed Non-Clipping Tooltip */}
      <GlobalBookTooltip activeHover={activeHover} />

      {/* Navbar with Instant Search */}
      <Navbar
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        stats={stats}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenImport={() => setIsImportOpen(true)}
        onResetLibrary={handleResetLibrary}
        onOpenOpenLibraryInfo={() => setIsOpenLibraryInfoOpen(true)}
        hasData={hasData}
        bookSize={bookSize}
        onChangeBookSize={(sz) => setBookSize(sz)}
        seriesList={seriesList}
        standaloneBooks={standaloneBooks}
        wantToReadStandalone={wantToReadStandalone}
        onSelectBook={(b) => setSelectedBook(b)}
      />

      {/* Main Wall Shelf Gallery */}
      <main className="flex-1 w-full pt-8 pb-16 relative z-10">
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

        {/* The Wall with Compact Multi-Series Floating Ledges */}
        {!isLoading && hasData && (
          <div className="w-full space-y-3 sm:space-y-4 max-w-[1550px] mx-auto px-2 sm:px-6">
            {packedShelves.map((shelfItems, shelfIndex) => (
              <WallShelf
                key={`shelf-${shelfIndex}`}
                shelfItems={shelfItems}
                bookSize={bookSize}
                onInspectBook={(book) => setSelectedBook(book)}
                onToggleRead={handleToggleRead}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
              />
            ))}
          </div>
        )}
      </main>

      {/* Minimal Dark Architectural Floor Rim at Bottom */}
      <div className="w-full h-8 bg-gradient-to-t from-[#020203] via-[#050608] to-transparent border-t border-white/[0.05] mt-auto relative z-10" />

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
