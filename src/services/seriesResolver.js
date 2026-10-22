// Series Resolver & Missing Book Generator
// Combines parsed Goodreads data with Curated Series and strict author-verified series logic

import { findCuratedSeries } from './seriesDatabase.js';
import { getOpenLibraryCoverUrl, getPurchaseLinks } from './openLibrary.js';

/**
 * Normalizes title strings for fuzzy matching
 */
function cleanForMatch(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks if two author strings refer to the same author.
 * Strictly prevents adding books by unrelated authors or institutions.
 */
export function isSameAuthor(authorA, authorB) {
  if (!authorA || !authorB) return false;
  const cleanA = authorA.toLowerCase().replace(/[^a-z]/g, ' ').trim().split(/\s+/).filter((w) => w.length > 1);
  const cleanB = authorB.toLowerCase().replace(/[^a-z]/g, ' ').trim().split(/\s+/).filter((w) => w.length > 1);
  if (cleanA.length === 0 || cleanB.length === 0) return false;

  const lastA = cleanA[cleanA.length - 1];
  const lastB = cleanB[cleanB.length - 1];
  if (lastA && lastB && lastA === lastB && lastA.length >= 3) return true;

  return cleanA.some((w) => w.length >= 4 && cleanB.includes(w));
}

/**
 * Filters out omnibuses, companion magazines, box sets, or duplicate compilations.
 */
function isJunkOrCompilation(title) {
  if (!title) return true;
  const lower = title.toLowerCase();
  const junkWords = [
    'omnibus',
    'boxed set',
    'box set',
    'series 1-',
    'collection',
    'magazine',
    'periodical',
    'film',
    'institute',
    'journal',
    'study guide',
    'summary of',
    'analysis of',
    'trivia',
    'anthology',
  ];
  return junkWords.some((word) => lower.includes(word));
}

/**
 * Resolves all books from a Goodreads export into:
 * 1. Series groups with read (color), want-to-read (greyed-out on same shelf), and missing tomes.
 * 2. Standalone read tomes.
 * 3. Standalone want-to-read tomes.
 *
 * STRICT RULE: Keep it to the series only! Never add random unrelated books.
 */
export async function resolveLibrarySeries(parsedBooks) {
  if (!parsedBooks || parsedBooks.length === 0) {
    return {
      seriesList: [],
      standaloneBooks: [],
      wantToReadStandalone: [],
      stats: {
        totalRead: 0,
        totalWantToRead: 0,
        totalMissing: 0,
        totalSeries: 0,
        completedSeries: 0,
        completionRate: 0,
        totalMissingCost: 0,
      },
    };
  }

  // Buckets for grouping series
  const seriesBuckets = new Map();
  const standaloneBooks = [];
  const wantToReadStandalone = [];

  for (const book of parsedBooks) {
    const curated = findCuratedSeries(book.seriesName, book.author, book.title);

    if (curated) {
      const key = curated.name.toLowerCase();
      if (!seriesBuckets.has(key)) {
        seriesBuckets.set(key, { curated, userBooks: [] });
      }
      seriesBuckets.get(key).userBooks.push(book);
    } else if (book.seriesName) {
      // Non-curated series detected from Goodreads title
      const key = book.seriesName.toLowerCase();
      if (!seriesBuckets.has(key)) {
        seriesBuckets.set(key, { customName: book.seriesName, author: book.author, userBooks: [] });
      }
      seriesBuckets.get(key).userBooks.push(book);
    } else {
      // Standalone book (no series detected)
      const cleanIsbn = book.isbn13 || book.isbn;
      let coverUrl = cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null;

      const formatted = {
        ...book,
        coverUrl,
        isRead: book.isRead,
        isGreyedOut: !book.isRead,
        isWantToRead: !!book.isWantToRead,
        purchaseLinks: getPurchaseLinks(book.title, book.author, cleanIsbn),
        price: 14.99,
      };

      if (book.isRead) {
        standaloneBooks.push(formatted);
      } else if (book.isWantToRead) {
        wantToReadStandalone.push(formatted);
      }
    }
  }

  const seriesList = [];
  let totalReadCount = 0;
  let totalWantToReadCount = 0;
  let totalMissingCount = 0;
  let totalMissingCost = 0;

  // Process each series bucket
  for (const [key, bucket] of seriesBuckets.entries()) {
    if (bucket.curated) {
      // --- Case 1: Curated Iconic Series (Verified 100% accurate sequence) ---
      const curated = bucket.curated;
      const allSeriesBooks = [];
      const userBookMap = new Map();

      for (const ub of bucket.userBooks) {
        if (ub.seriesNumber !== null && ub.seriesNumber !== undefined) {
          userBookMap.set(`order-${ub.seriesNumber}`, ub);
        }
        userBookMap.set(cleanForMatch(ub.title), ub);
      }

      for (const canonBook of curated.books) {
        const userBook =
          userBookMap.get(`order-${canonBook.order}`) ||
          userBookMap.get(cleanForMatch(canonBook.title)) ||
          (canonBook.altTitle && userBookMap.get(cleanForMatch(canonBook.altTitle)));

        const isRead = !!userBook && !!userBook.isRead;
        const isWantToRead = !!userBook && !!userBook.isWantToRead;
        const isbn = (userBook && (userBook.isbn13 || userBook.isbn)) || canonBook.isbn13;
        const coverUrl = canonBook.coverId
          ? getOpenLibraryCoverUrl(canonBook.coverId, 'id', 'L')
          : isbn
          ? getOpenLibraryCoverUrl(isbn, 'isbn', 'L')
          : null;

        const price = 14.99 + (canonBook.order % 3) * 2.0;

        if (isRead) {
          totalReadCount++;
        } else if (isWantToRead) {
          totalWantToReadCount++;
          totalMissingCount++;
          totalMissingCost += price;
        } else {
          totalMissingCount++;
          totalMissingCost += price;
        }

        allSeriesBooks.push({
          id: userBook ? userBook.id : `missing-${curated.name}-${canonBook.order}`,
          title: canonBook.title,
          author: curated.author,
          order: canonBook.order,
          seriesName: curated.name,
          seriesNumber: canonBook.order,
          year: canonBook.year,
          pages: canonBook.pages,
          description: canonBook.description,
          isbn,
          isbn13: canonBook.isbn13,
          coverUrl,
          coverId: canonBook.coverId,
          isRead,
          isGreyedOut: !isRead,
          isWantToRead,
          rating: userBook ? userBook.rating : 0,
          dateRead: userBook ? userBook.dateRead : null,
          price,
          purchaseLinks: getPurchaseLinks(canonBook.title, curated.author, isbn),
        });
      }

      // Add any extra user read/want-to-read companion books (e.g. musical score)
      for (const ub of bucket.userBooks) {
        const isMatched = allSeriesBooks.some((b) => b.id === ub.id || cleanForMatch(b.title) === cleanForMatch(ub.title));
        if (!isMatched) {
          const cleanIsbn = ub.isbn13 || ub.isbn;
          if (ub.isRead) totalReadCount++;
          if (ub.isWantToRead) totalWantToReadCount++;

          allSeriesBooks.push({
            ...ub,
            order: ub.seriesNumber || 99,
            seriesName: curated.name,
            isRead: ub.isRead,
            isGreyedOut: !ub.isRead,
            isWantToRead: !!ub.isWantToRead,
            coverUrl: cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null,
            purchaseLinks: getPurchaseLinks(ub.title, ub.author, cleanIsbn),
            price: 15.99,
          });
        }
      }

      allSeriesBooks.sort((a, b) => a.order - b.order);

      const readCount = allSeriesBooks.filter((b) => b.isRead).length;
      const totalCount = allSeriesBooks.length;
      const percent = Math.round((readCount / totalCount) * 100);

      seriesList.push({
        id: `series-${key}`,
        name: curated.name,
        author: curated.author,
        universe: curated.universe,
        books: allSeriesBooks,
        readCount,
        totalCount,
        missingCount: totalCount - readCount,
        completionPercent: percent,
        isCompleted: readCount === totalCount,
      });
    } else {
      // --- Case 2: Custom / Non-Curated Series (from user's CSV) ---
      const customName = bucket.customName;
      const author = bucket.author;
      const userList = bucket.userBooks;

      // Group all books the user has for this series (both read and want-to-read!)
      const seriesBooks = userList.map((ub) => {
        const cleanIsbn = ub.isbn13 || ub.isbn;
        const isRead = !!ub.isRead;
        const isWantToRead = !!ub.isWantToRead;

        if (isRead) {
          totalReadCount++;
        } else {
          totalMissingCount++;
          totalMissingCost += 14.99;
          if (isWantToRead) totalWantToReadCount++;
        }

        return {
          ...ub,
          order: ub.seriesNumber || 1,
          seriesName: customName,
          isRead,
          isGreyedOut: !isRead,
          isWantToRead,
          coverUrl: cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null,
          purchaseLinks: getPurchaseLinks(ub.title, ub.author, cleanIsbn),
          price: 14.99,
        };
      });

      // Deduplicate by clean title so same book isn't shown twice
      const seenTitles = new Set();
      const cleanSeriesBooks = [];
      for (const b of seriesBooks) {
        const t = cleanForMatch(b.title);
        if (!seenTitles.has(t)) {
          seenTitles.add(t);
          cleanSeriesBooks.push(b);
        }
      }

      cleanSeriesBooks.sort((a, b) => a.order - b.order);

      const readCount = cleanSeriesBooks.filter((b) => b.isRead).length;
      const totalCount = cleanSeriesBooks.length;
      const percent = Math.round((readCount / totalCount) * 100);

      seriesList.push({
        id: `series-${key}`,
        name: customName,
        author: author,
        universe: 'Series Collection',
        books: cleanSeriesBooks,
        readCount,
        totalCount,
        missingCount: totalCount - readCount,
        completionPercent: percent,
        isCompleted: readCount === totalCount,
      });
    }
  }

  // Count standalone read
  standaloneBooks.forEach((b) => {
    if (b.isRead) totalReadCount++;
  });
  wantToReadStandalone.forEach(() => {
    totalWantToReadCount++;
  });

  const totalTrackedBooks = seriesList.reduce((acc, s) => acc + s.totalCount, 0);
  const overallRate = totalTrackedBooks > 0 ? Math.round((totalReadCount / totalTrackedBooks) * 100) : 100;

  return {
    seriesList,
    standaloneBooks,
    wantToReadStandalone,
    stats: {
      totalRead: totalReadCount,
      totalWantToRead: totalWantToReadCount,
      totalMissing: totalMissingCount,
      totalSeries: seriesList.length,
      completedSeries: seriesList.filter((s) => s.isCompleted).length,
      completionRate: overallRate,
      totalMissingCost: Math.round(totalMissingCost * 100) / 100,
    },
  };
}
