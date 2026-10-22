import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import WallShelf from './components/WallShelf';
import BookDetailModal from './components/BookDetailModal';
import ImportModal from './components/ImportModal';
import OpenLibraryInfoModal from './components/OpenLibraryInfoModal';
import EmptyState from './components/EmptyState';
import { parseGoodreadsCSV } from './services/goodreadsParser';
import { resolveLibrarySeries } from './services/seriesResolver';
import { soundFX } from './services/soundFx';

const DEMO_SAMPLE_CSV = `Book Id,Title,Author,Author l-f,Additional Authors,ISBN,ISBN13,My Rating,Publisher,Binding,Number of Pages,Year Published,Original Publication Year,Date Read,Date Added,Bookshelves,Bookshelves with positions,Exclusive Shelf,My Review,Spoiler,Private Notes,Read Count,Owned Copies
20698371,"Harry Potter and the Chamber of Secrets: Selected Themes from the Motion Picture - Piano Solos: Piano Solos (Includes Souvenir Poster), Book & Poster",John   Williams,"Williams, John",,"=""0739082671""","=""9780739082676""",5.0,Alfred Publishing Co - eBooks Account,Kindle Edition,68,2011,2002,,2026/09/30,,,read,,,,1,0
5907,"The Hobbit, or There and Back Again",J.R.R. Tolkien,"Tolkien, J.R.R.","Douglas A. Anderson, Michael Hague, Jemima Catlin","=""""","=""""",5.0,Houghton Mifflin,Paperback,366,2002,1937,,2026/09/30,,,read,,,,1,0
42844155,"Harry Potter and the Philosopher's Stone (Harry Potter, #1)",J.K. Rowling,"Rowling, J.K.",Olly Moss,"=""""","=""""",5.0,Pottermore Publishing,Kindle Edition,333,2015,1997,,2026/09/30,,,read,,,,1,0
239754337,"Harry Potter and the Chamber of Secrets (Harry Potter, #2)",J.K. Rowling,"Rowling, J.K.","Hugh Laurie, Matthew MacFadyen, Kit Harington, Riz Ahmed, Michelle Gomez, Daniel Mays, Mark Addy, Simon Pegg, Cush Jumbo, Alex Hassell, Gemma Whelan, Indira Varma, Frankie Treadaway, Max Lester, Arabella Stanton","=""""","=""""",5.0,Pottermore Publishing and Audible Studios,Audiobook,10,2025,1998,,2026/09/30,,,read,,,,1,0
5,"Harry Potter and the Prisoner of Azkaban (Harry Potter, #3)",J.K. Rowling,"Rowling, J.K.",Mary GrandPrAc,"=""043965548X""","=""9780439655484""",5.0,Scholastic Inc.,Mass Market Paperback,547,2004,1999,,2026/09/30,,,read,,,,1,0`;

const STORAGE_KEY_DATA = 'bookshelf_library_v4';
const STORAGE_KEY_NAME = 'bookshelf_user_name_v4';

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
  const [soundEnabled, setSoundEnabled] = useState(true);

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

    let updatedSeriesList = seriesList.map((series) => {
      const hasTarget = series.books.some((b) => b.id === targetBook.id);
      if (!hasTarget) return series;

      const updatedBooks = series.books.map((b) => {
        if (b.id === targetBook.id) {
          return {
            ...b,
            isRead: willBeRead,
            isGreyedOut: !willBeRead,
            isWantToRead: willBeRead ? false : b.isWantToRead,
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
      totalRead += s.readCount;
      totalMissing += s.missingCount;
      totalTrackedBooks += s.totalCount;
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
    soundFX.playPageFlip();
    try {
      const resolved = await resolveLibrarySeries(parsedBooks);
      const newName = name || userName;

      setSeriesList(resolved.seriesList);
      setStandaloneBooks(resolved.standaloneBooks);
      setWantToReadStandalone(resolved.wantToReadStandalone || []);
      setStats(resolved.stats);
      if (newName) {
        setUserName(newName);
      }

      persistState(resolved.seriesList, resolved.standaloneBooks, resolved.wantToReadStandalone || [], resolved.stats, newName);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0071e3', '#34c759', '#1d1d1f'],
      });
    } catch (e) {
      console.error('Import error:', e);
    } finally {
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

  const hasData = seriesList.length > 0 || standaloneBooks.length > 0 || wantToReadStandalone.length > 0;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-[#0071e3] selection:text-white relative">
      {/* Navbar */}
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
      />

      {/* Main Wall Shelf Gallery */}
      <main className="flex-1 w-full pt-10 pb-20">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className="w-10 h-10 border-2 border-black/[0.1] border-t-[#0071e3] rounded-full animate-spin mb-4" />
            <h3 className="text-sm font-semibold text-[#1d1d1f]">Mounting Books on Wall...</h3>
            <p className="text-xs text-[#86868b] mt-1">Resolving series & shelves</p>
          </div>
        )}

        {/* Empty / Onboarding State */}
        {!isLoading && !hasData && (
          <EmptyState
            onImportCSV={handleImportCSV}
            onLoadDemo={handleLoadDemo}
          />
        )}

        {/* The Wall with Floating Picture-Ledge Shelves */}
        {!isLoading && hasData && (
          <div className="w-full space-y-4">
            {/* Series Shelves */}
            {seriesList.map((series) => (
              <WallShelf
                key={series.id}
                series={series}
                onInspectBook={(book) => setSelectedBook(book)}
                onToggleRead={handleToggleRead}
              />
            ))}

            {/* Standalone Want-to-Read Shelf */}
            {wantToReadStandalone && wantToReadStandalone.length > 0 && (
              <WallShelf
                isWantToReadShelf={true}
                wantToReadBooks={wantToReadStandalone}
                onInspectBook={(book) => setSelectedBook(book)}
                onToggleRead={handleToggleRead}
              />
            )}

            {/* Standalone Completed Works Shelf */}
            {standaloneBooks && standaloneBooks.length > 0 && (
              <WallShelf
                isStandalone={true}
                standaloneBooks={standaloneBooks}
                onInspectBook={(book) => setSelectedBook(book)}
                onToggleRead={handleToggleRead}
              />
            )}
          </div>
        )}
      </main>

      {/* Scandinavian Oak Wood Floor Accent at Bottom */}
      <div className="w-full h-10 bg-gradient-to-t from-[#c5aa86] via-[#d4bc98] to-[#dfdeda] border-t border-black/[0.08] shadow-inner opacity-75 mt-auto" />

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
