import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { BookOpen, Bookmark } from 'lucide-react';
import Navbar from './components/Navbar';
import WallShelf from './components/WallShelf';
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

function cleanForMatch(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Intelligent Responsive Width-Based Shelf Packing Algorithm:
 * - Computes physical pixel footprint of books, gaps, dividers, and titles.
 * - Dynamically adapts to the user's screen width so books never get cut off on the right.
 * - Long series that exceed shelf width are gracefully split into sequential shelf rows (e.g. 'Series (cont.)').
 * - Smaller series share shelves, with remaining gaps filled by single/wishlist editions.
 */
function packBookshelfResponsive(seriesList, standaloneBooks, wantToReadStandalone = [], containerWidth = 1200, bookSize = 'default') {
  const isCompact = bookSize === 'compact';
  const isSmallScreen = containerWidth < 640;
  const isMediumScreen = containerWidth < 768;

  let bookW = 84;
  let bookGap = 10;
  let dividerW = 22;

  if (isCompact) {
    bookW = isSmallScreen ? 58 : isMediumScreen ? 68 : 74;
    bookGap = 8;
    dividerW = 18;
  } else {
    bookW = isSmallScreen ? 66 : isMediumScreen ? 76 : 84;
    bookGap = 10;
    dividerW = 22;
  }

  // Safe usable width with buffer for padding & right bookcase rail
  const usableW = Math.max(280, containerWidth - 48);

  function getSeriesWidth(numBooks) {
    if (numBooks <= 0) return 0;
    const booksW = (numBooks * bookW) + ((numBooks - 1) * bookGap);
    // Single books have title minimum width of ~115px
    return Math.max(booksW, numBooks === 1 ? 115 : 0);
  }

  const maxBooksOnEmptyShelf = Math.max(1, Math.floor((usableW + bookGap) / (bookW + bookGap)));

  // Pre-process: Chunk any series that has more books than physical shelf width
  const chunkedSeriesList = [];
  for (const s of seriesList) {
    if (s.books.length <= maxBooksOnEmptyShelf) {
      chunkedSeriesList.push(s);
    } else {
      let offset = 0;
      let part = 1;
      while (offset < s.books.length) {
        const chunk = s.books.slice(offset, offset + maxBooksOnEmptyShelf);
        chunkedSeriesList.push({
          ...s,
          id: `${s.id}-part-${part}`,
          name: part === 1 ? s.name : `${s.name} (cont.)`,
          books: chunk,
          readCount: chunk.filter((b) => b.isRead).length,
          totalCount: chunk.length,
          isCompleted: chunk.every((b) => b.isRead),
        });
        offset += maxBooksOnEmptyShelf;
        part++;
      }
    }
  }

  const shelves = [];
  let currentShelfItems = [];
  let currentShelfWidth = 0;

  // Single books pool
  const allSingleBooks = [
    ...(standaloneBooks || []),
    ...(wantToReadStandalone || []),
  ];
  let singleBooksQueue = [...allSingleBooks];

  // Pack series onto shelves based on physical width
  for (const series of chunkedSeriesList) {
    const seriesW = getSeriesWidth(series.books.length);
    const neededW = currentShelfItems.length > 0 ? dividerW + seriesW : seriesW;

    if (currentShelfWidth + neededW <= usableW) {
      currentShelfItems.push({ type: 'series', data: series });
      currentShelfWidth += neededW;
    } else {
      const remainingW = usableW - currentShelfWidth;
      const neededForSinglesDivider = currentShelfItems.length > 0 ? dividerW : 0;
      const availForSingles = remainingW - neededForSinglesDivider;
      const singleSlots = Math.max(0, Math.floor((availForSingles + bookGap) / (bookW + bookGap)));

      if (singleSlots > 0 && singleBooksQueue.length > 0) {
        const fillBooks = singleBooksQueue.splice(0, singleSlots);
        const fillW = getSeriesWidth(fillBooks.length);
        currentShelfItems.push({
          type: 'standalone-group',
          title: 'Single Editions',
          books: fillBooks,
        });
        currentShelfWidth += neededForSinglesDivider + fillW;
      }

      if (currentShelfItems.length > 0) {
        shelves.push(currentShelfItems);
      }

      currentShelfItems = [{ type: 'series', data: series }];
      currentShelfWidth = seriesW;
    }
  }

  // Pack any remaining single books across subsequent shelves
  while (singleBooksQueue.length > 0) {
    const remainingW = usableW - currentShelfWidth;
    const neededForSinglesDivider = currentShelfItems.length > 0 ? dividerW : 0;
    const availForSingles = remainingW - neededForSinglesDivider;
    const singleSlots = Math.max(0, Math.floor((availForSingles + bookGap) / (bookW + bookGap)));

    if (singleSlots > 0) {
      const fillBooks = singleBooksQueue.splice(0, singleSlots);
      const fillW = getSeriesWidth(fillBooks.length);
      currentShelfItems.push({
        type: 'standalone-group',
        title: currentShelfItems.length === 0 ? 'Individual Works & Wishlist' : 'Single Editions',
        books: fillBooks,
      });
      currentShelfWidth += neededForSinglesDivider + fillW;
    }

    if (singleBooksQueue.length > 0 || currentShelfItems.length > 0) {
      shelves.push(currentShelfItems);
      currentShelfItems = [];
      currentShelfWidth = 0;
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
  const [bookSize, setBookSize] = useState('default'); // 'compact' | 'default'

  // Tab State: 'library' (My Library) vs 'wantToRead' (Want to Read Shelf)
  const [activeTab, setActiveTab] = useState('library');

  // Dynamic Shelf Container Width via ResizeObserver
  const shelfContainerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1260) : 1200
  );

  // Non-clipping Global Tooltip Hover State
  const [activeHover, setActiveHover] = useState(null);

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOpenLibraryInfoOpen, setIsOpenLibraryInfoOpen] = useState(false);

  // Measure shelf width dynamically
  useEffect(() => {
    const el = shelfContainerRef.current;
    const updateWidth = () => {
      const w = el ? el.clientWidth : window.innerWidth - 48;
      if (w > 0) {
        setContainerWidth(Math.min(w, 1260));
      }
    };

    updateWidth();

    let ro = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          if (w > 0) {
            setContainerWidth(Math.min(w, 1260));
          }
        }
      });
      ro.observe(el);
    }

    window.addEventListener('resize', updateWidth);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [seriesList.length, standaloneBooks.length, activeTab]);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const cachedName = localStorage.getItem(STORAGE_KEY_NAME);
      if (cachedName) {
        setUserName(cachedName);
      }
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
        particleCount: 40,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#0071e3', '#34c759', '#ffffff'],
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

    // Recompute library stats
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
      if (newName) {
        setUserName(newName);
      }

      persistState(resolved.seriesList, resolved.standaloneBooks, resolved.wantToReadStandalone || [], resolved.stats, newName);

      setTimeout(() => {
        setIsLoading(false);
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#0071e3', '#34c759', '#ffffff'],
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

  const handleHoverStart = useCallback((book, rect) => {
    setActiveHover({ book, rect });
  }, []);

  const handleHoverEnd = useCallback(() => {
    setActiveHover(null);
  }, []);

  const hasData = seriesList.length > 0 || standaloneBooks.length > 0 || wantToReadStandalone.length > 0;

  // 1. ACTIVE SERIES: Series where AT LEAST ONE book has been read!
  // Any "want-to-read" or missing companions stay beside the already read books!
  const activeSeries = useMemo(() => {
    return seriesList.filter((s) => s.books.some((b) => b.isRead));
  }, [seriesList]);

  // 2. UNSTARTED WANT-TO-READ SERIES: 0 books read, but contains want-to-read books!
  const wantToReadSeries = useMemo(() => {
    return seriesList
      .filter((s) => !s.books.some((b) => b.isRead)) // 0 books read in this series
      .filter((s) => s.books.some((b) => b.isWantToRead));
  }, [seriesList]);

  // 3. READ STANDALONE BOOKS
  const readStandalone = useMemo(() => {
    return standaloneBooks.filter((b) => b.isRead);
  }, [standaloneBooks]);

  // 4. UNREAD WANT-TO-READ STANDALONE BOOKS
  const tbrStandalone = useMemo(() => {
    const fromStandalone = standaloneBooks.filter((b) => !b.isRead && b.isWantToRead);
    const fromWantToRead = wantToReadStandalone.filter((b) => !b.isRead);
    const seen = new Set();
    const result = [];
    for (const b of [...fromStandalone, ...fromWantToRead]) {
      const key = b.id || cleanForMatch(b.title);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(b);
      }
    }
    return result;
  }, [standaloneBooks, wantToReadStandalone]);

  // Total counts for tab badges
  const libraryBookCount = useMemo(() => {
    let count = readStandalone.length;
    activeSeries.forEach((s) => {
      count += s.books.length;
    });
    return count;
  }, [activeSeries, readStandalone]);

  const wantToReadBookCount = useMemo(() => {
    let count = tbrStandalone.length;
    wantToReadSeries.forEach((s) => {
      count += s.books.length;
    });
    return count;
  }, [wantToReadSeries, tbrStandalone]);

  // Compute dynamically packed shelves based on active tab
  const packedShelves = useMemo(() => {
    if (activeTab === 'library') {
      return packBookshelfResponsive(
        activeSeries,
        readStandalone,
        [],
        containerWidth,
        bookSize
      );
    } else {
      return packBookshelfResponsive(
        wantToReadSeries,
        tbrStandalone,
        [],
        containerWidth,
        bookSize
      );
    }
  }, [activeTab, activeSeries, readStandalone, wantToReadSeries, tbrStandalone, containerWidth, bookSize]);

  // Seamless Search selection: auto-switches to the appropriate tab if needed
  const handleSelectBook = (book) => {
    if (!book) return;
    setSelectedBook(book);

    const isInActiveSeries = activeSeries.some((s) =>
      s.books.some((b) => String(b.id) === String(book.id) || cleanForMatch(b.title) === cleanForMatch(book.title))
    );
    const isRead = !!book.isRead;

    if (!isRead && !isInActiveSeries) {
      setActiveTab('wantToRead');
    } else {
      setActiveTab('library');
    }

    setTimeout(() => {
      const el = document.getElementById(`book-${book.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('book-search-pulse');
        setTimeout(() => el.classList.remove('book-search-pulse'), 2200);
      }
    }, 180);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#0071e3] selection:text-white relative bg-[#0c0d12] text-neutral-100 overflow-x-hidden">
      {/* Global Fixed Non-Clipping Tooltip */}
      <GlobalBookTooltip activeHover={activeHover} isNight={true} />

      {/* Navbar with Instant Search */}
      <Navbar
        userName={userName}
        onUpdateUserName={handleUpdateUserName}
        stats={stats}
        onOpenImport={() => setIsImportOpen(true)}
        onResetLibrary={handleResetLibrary}
        onOpenOpenLibraryInfo={() => setIsOpenLibraryInfoOpen(true)}
        hasData={hasData}
        bookSize={bookSize}
        onChangeBookSize={(sz) => setBookSize(sz)}
        seriesList={seriesList}
        standaloneBooks={standaloneBooks}
        wantToReadStandalone={wantToReadStandalone}
        onSelectBook={handleSelectBook}
      />

      {/* Main Bookshelf Area */}
      <main className="flex-1 w-full pt-4 pb-16 relative z-10">
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

        {/* Loaded Shelves Area */}
        {!isLoading && hasData && (
          <div className="w-full">
            {/* Elegant Tab Switcher: My Library vs Want to Read */}
            <div className="flex items-center justify-between flex-wrap gap-3 max-w-[1260px] mx-auto px-3 sm:px-6 mb-5 select-none">
              <div className="inline-flex items-center p-1 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-xl shadow-lg">
                <button
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('library');
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-tight transition-all ${
                    activeTab === 'library'
                      ? 'bg-[#0071e3] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>My Library</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === 'library' ? 'bg-black/25 text-white' : 'bg-white/10 text-neutral-400'
                  }`}>
                    {libraryBookCount}
                  </span>
                </button>

                <button
                  onClick={() => {
                    soundFX.playClick();
                    setActiveTab('wantToRead');
                  }}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-full text-xs font-semibold tracking-tight transition-all ${
                    activeTab === 'wantToRead'
                      ? 'bg-[#0071e3] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Want to Read</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    activeTab === 'wantToRead' ? 'bg-black/25 text-white' : 'bg-white/10 text-neutral-400'
                  }`}>
                    {wantToReadBookCount}
                  </span>
                </button>
              </div>

              {/* Informative Sub-caption */}
              <div className="text-[11px] text-neutral-400 hidden sm:block">
                {activeTab === 'library' ? (
                  <span>Showing <strong>read tomes</strong> & <strong>active series</strong> with upcoming editions</span>
                ) : (
                  <span>Showing your <strong>unstarted wishlist series</strong> & <strong>TBR books</strong></span>
                )}
              </div>
            </div>

            {/* Empty State for Want to Read Tab if user has 0 TBR books */}
            {activeTab === 'wantToRead' && wantToReadBookCount === 0 && (
              <div className="max-w-md mx-auto py-16 px-4 text-center animate-fadeIn">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-white">Your Want to Read Shelf is Empty</h3>
                <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Books or unstarted series you mark as "Want to Read" in Goodreads will be collected right here on this shelf.
                </p>
                <button
                  onClick={() => setActiveTab('library')}
                  className="mt-5 text-xs text-[#0071e3] hover:text-[#0077ed] font-medium"
                >
                  ← Return to My Library
                </button>
              </div>
            )}

            {/* Architectural Built-In Bookshelf Stack */}
            {(activeTab === 'library' || wantToReadBookCount > 0) && (
              <div
                ref={shelfContainerRef}
                className="w-full max-w-[1260px] mx-auto px-3 sm:px-6 relative"
              >
                {/* Shelf Stack Unit Frame */}
                <div className="relative w-full">
                  {/* Left Upright Frame Rail */}
                  <div className="absolute -left-2 sm:-left-3 top-0 bottom-0 w-2.5 sm:w-3.5 rounded-sm bg-gradient-to-r from-[#14151b] to-[#22242e] border-r border-white/10 shadow-lg z-10 pointer-events-none" />

                  {/* Right Upright Frame Rail */}
                  <div className="absolute -right-2 sm:-right-3 top-0 bottom-0 w-2.5 sm:w-3.5 rounded-sm bg-gradient-to-l from-[#14151b] to-[#22242e] border-l border-white/10 shadow-lg z-10 pointer-events-none" />

                  {/* Continuous Shelves Stack */}
                  <div className="w-full">
                    {packedShelves.map((shelfItems, shelfIndex) => (
                      <WallShelf
                        key={`shelf-${activeTab}-${shelfIndex}`}
                        shelfItems={shelfItems}
                        bookSize={bookSize}
                        onInspectBook={(book) => setSelectedBook(book)}
                        onToggleRead={handleToggleRead}
                        onHoverStart={handleHoverStart}
                        onHoverEnd={handleHoverEnd}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Clean Dark Footer */}
      <footer className="w-full py-6 text-center text-xs text-neutral-500 border-t border-white/[0.06] mt-auto relative z-10 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{userName ? `${userName}'s Library` : 'Bookshelf'} • {stats.totalRead} Books Read</span>
          <span className="text-[11px] text-neutral-600">Built for avid readers & collectors</span>
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
