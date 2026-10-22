// Series Resolver & Missing Book Generator
// Combines parsed Goodreads data with Curated Series and Open Library APIs

import { findCuratedSeries } from './seriesDatabase.js';
import { getOpenLibraryCoverUrl, getPurchaseLinks, searchSeriesBooks, searchOpenLibraryBooks } from './openLibrary.js';

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
 * Resolves all books from a Goodreads export into:
 * 1. Series groups with read (color) and missing (greyed-out) tomes.
 * 2. Standalone read tomes.
 *
 * STRICT RULE: Only books the user has read AND the unread books in their specific series are included.
 * Never includes arbitrary books from unrelated series!
 */
export async function resolveLibrarySeries(parsedBooks) {
  if (!parsedBooks || parsedBooks.length === 0) {
    return {
      seriesList: [],
      standaloneBooks: [],
      stats: {
        totalRead: 0,
        totalMissing: 0,
        totalSeries: 0,
        completedSeries: 0,
        completionRate: 0,
        totalMissingCost: 0,
      },
    };
  }

  // Filter for books the user has read (or user added to library)
  const readBooks = parsedBooks.filter((b) => b.isRead || b.shelf === 'read');

  // Map of series name / key -> array of read books belonging to it
  const seriesBuckets = new Map();
  const standaloneBooks = [];

  for (const book of readBooks) {
    const curated = findCuratedSeries(book.seriesName, book.author, book.title);

    if (curated) {
      const key = curated.name.toLowerCase();
      if (!seriesBuckets.has(key)) {
        seriesBuckets.set(key, { curated, readBooks: [] });
      }
      seriesBuckets.get(key).readBooks.push(book);
    } else if (book.seriesName) {
      // Custom series not in curated list
      const key = book.seriesName.toLowerCase();
      if (!seriesBuckets.has(key)) {
        seriesBuckets.set(key, { customName: book.seriesName, author: book.author, readBooks: [] });
      }
      seriesBuckets.get(key).readBooks.push(book);
    } else {
      // Standalone book
      // Ensure it has a coverUrl
      const cleanIsbn = book.isbn13 || book.isbn;
      let coverUrl = cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null;
      standaloneBooks.push({
        ...book,
        coverUrl,
        isRead: true,
        isGreyedOut: false,
        purchaseLinks: getPurchaseLinks(book.title, book.author, cleanIsbn),
        price: 14.99,
      });
    }
  }

  const seriesList = [];
  let totalMissingCount = 0;
  let totalMissingCost = 0;

  // Process each series bucket
  for (const [key, bucket] of seriesBuckets.entries()) {
    if (bucket.curated) {
      const curated = bucket.curated;
      const allSeriesBooks = [];
      const userReadMap = new Map();

      // Index user's read books by order or cleaned title
      for (const rb of bucket.readBooks) {
        if (rb.seriesNumber !== null && rb.seriesNumber !== undefined) {
          userReadMap.set(`order-${rb.seriesNumber}`, rb);
        }
        userReadMap.set(cleanForMatch(rb.title), rb);
      }

      for (const canonBook of curated.books) {
        // Check if user read this book
        const userRead =
          userReadMap.get(`order-${canonBook.order}`) ||
          userReadMap.get(cleanForMatch(canonBook.title)) ||
          (canonBook.altTitle && userReadMap.get(cleanForMatch(canonBook.altTitle)));

        const isRead = !!userRead;
        const isbn = (userRead && (userRead.isbn13 || userRead.isbn)) || canonBook.isbn13;
        const coverUrl = canonBook.coverId
          ? getOpenLibraryCoverUrl(canonBook.coverId, 'id', 'L')
          : isbn
          ? getOpenLibraryCoverUrl(isbn, 'isbn', 'L')
          : null;

        const price = 14.99 + (canonBook.order % 3) * 2.0;

        if (!isRead) {
          totalMissingCount++;
          totalMissingCost += price;
        }

        allSeriesBooks.push({
          id: userRead ? userRead.id : `missing-${curated.name}-${canonBook.order}`,
          title: canonBook.title,
          author: curated.author,
          order: canonBook.order,
          seriesName: curated.name,
          seriesNumber: canonBook.order,
          year: canonBook.year,
          pages: canonBook.pages,
          description: canonBook.description,
          isbn: isbn,
          isbn13: canonBook.isbn13,
          coverUrl,
          coverId: canonBook.coverId,
          isRead,
          isGreyedOut: !isRead,
          rating: userRead ? userRead.rating : 0,
          dateRead: userRead ? userRead.dateRead : null,
          price,
          purchaseLinks: getPurchaseLinks(canonBook.title, curated.author, isbn),
        });
      }

      // Check for any extra user read books that might be companions (like piano score or novella)
      for (const rb of bucket.readBooks) {
        const isMatched = allSeriesBooks.some((b) => b.isRead && (b.id === rb.id || cleanForMatch(b.title) === cleanForMatch(rb.title)));
        if (!isMatched) {
          const cleanIsbn = rb.isbn13 || rb.isbn;
          allSeriesBooks.push({
            ...rb,
            order: rb.seriesNumber || 99,
            seriesName: curated.name,
            isRead: true,
            isGreyedOut: false,
            coverUrl: cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null,
            purchaseLinks: getPurchaseLinks(rb.title, rb.author, cleanIsbn),
            price: 15.99,
          });
        }
      }

      // Sort books by sequence order
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
      // Dynamic resolution for non-curated series using Open Library
      const customName = bucket.customName;
      const author = bucket.author;
      const readList = bucket.readBooks;

      // Create entries for read books
      const seriesBooks = readList.map((rb) => {
        const cleanIsbn = rb.isbn13 || rb.isbn;
        return {
          ...rb,
          order: rb.seriesNumber || 1,
          seriesName: customName,
          isRead: true,
          isGreyedOut: false,
          coverUrl: cleanIsbn ? getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L') : null,
          purchaseLinks: getPurchaseLinks(rb.title, rb.author, cleanIsbn),
          price: 15.99,
        };
      });

      // Try discovering missing books from Open Library
      try {
        const discovered = await searchSeriesBooks(customName, author, 12);
        for (const disc of discovered) {
          const alreadyExists = seriesBooks.some((b) => cleanForMatch(b.title) === cleanForMatch(disc.title));
          if (!alreadyExists && seriesBooks.length < 15) {
            totalMissingCount++;
            totalMissingCost += 16.99;
            seriesBooks.push({
              id: `missing-${customName}-${disc.title}`,
              title: disc.title,
              author: disc.author || author,
              order: seriesBooks.length + 1,
              seriesName: customName,
              seriesNumber: seriesBooks.length + 1,
              year: disc.year,
              coverUrl: disc.coverUrl,
              coverId: disc.coverId,
              isbn: disc.isbn,
              isRead: false,
              isGreyedOut: true,
              rating: 0,
              dateRead: null,
              price: 16.99,
              purchaseLinks: getPurchaseLinks(disc.title, disc.author || author, disc.isbn),
            });
          }
        }
      } catch (e) {
        console.warn('Could not query Open Library for custom series:', e);
      }

      seriesBooks.sort((a, b) => a.order - b.order);

      const readCount = seriesBooks.filter((b) => b.isRead).length;
      const totalCount = seriesBooks.length;
      const percent = Math.round((readCount / totalCount) * 100);

      seriesList.push({
        id: `series-${key}`,
        name: customName,
        author: author,
        universe: 'Literary World',
        books: seriesBooks,
        readCount,
        totalCount,
        missingCount: totalCount - readCount,
        completionPercent: percent,
        isCompleted: readCount === totalCount,
      });
    }
  }

  // Sort series: In-progress series first, then completed
  seriesList.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return b.completionPercent - a.completionPercent;
  });

  const totalReadCount = readBooks.length;
  const completedSeriesCount = seriesList.filter((s) => s.isCompleted).length;
  const totalBooksInTrackedSeries = seriesList.reduce((acc, s) => acc + s.totalCount, 0);
  const overallRate = totalBooksInTrackedSeries > 0 
    ? Math.round((readBooks.length / totalBooksInTrackedSeries) * 100) 
    : 100;

  return {
    seriesList,
    standaloneBooks,
    stats: {
      totalRead: totalReadCount,
      totalMissing: totalMissingCount,
      totalSeries: seriesList.length,
      completedSeries: completedSeriesCount,
      completionRate: overallRate,
      totalMissingCost: Math.round(totalMissingCost * 100) / 100,
    },
  };
}
