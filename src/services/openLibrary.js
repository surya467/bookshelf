// Open Library & Multi-Provider Cover Resolver
// Supports: Open Library (Default, 100% Free), Google Books API, and Hardcover GraphQL API

export const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
export const COVERS_BASE = 'https://covers.openlibrary.org';
export const HARDCOVER_API = 'https://api.hardcover.app/v1/graphql';

const COVER_CACHE_KEY = 'bookshelf_cover_cache_v2';

function getCoverCache() {
  try {
    const raw = localStorage.getItem(COVER_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCoverCache(key, url) {
  if (!key || !url) return;
  try {
    const cache = getCoverCache();
    cache[key] = url;
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    // Ignore storage limits
  }
}

/**
 * Strips Goodreads subtitles, parentheticals, and editions for cleaner searches.
 * e.g. "The Hobbit, or There and Back Again" -> "The Hobbit"
 * e.g. "Harry Potter and the Chamber of Secrets: Selected Themes..." -> "Harry Potter and the Chamber of Secrets"
 */
export function cleanTitleForSearch(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s*\([^)]*\)/g, '') // remove (Harry Potter, #1)
    .split(/[:,-]\s*(?:or There|Selected Themes|Piano Solos|Special Edition|Anniversary Edition|Illustrated Edition|Original Motion Picture)/i)[0]
    .replace(/[:,-]\s*A Novel.*$/i, '')
    .trim();
}

/**
 * Generates an Open Library cover image URL.
 */
export function getOpenLibraryCoverUrl(value, key = 'id', size = 'L') {
  if (!value) return null;
  const cleanVal = String(value).trim().replace(/[^0-9a-zA-Z]/g, '');
  if (!cleanVal) return null;
  return `${COVERS_BASE}/b/${key}/${cleanVal}-${size}.jpg`;
}

/**
 * Multi-Tier Cover Resolver:
 * 1. LocalStorage Cache hit
 * 2. Open Library by ISBN (Direct CDN)
 * 3. Open Library Title + Author search (Retrieves verified cover_i for Kindle/audiobooks)
 * 4. Google Books API (if user supplied API key in Settings)
 * 5. Hardcover GraphQL API (if user supplied personal token in Settings)
 */
export async function resolveBookCover({ title, author = '', isbn = '', isbn13 = '', googleApiKey = '', hardcoverToken = '' }) {
  const cleanIsbn = String(isbn13 || isbn || '').replace(/[^0-9X]/gi, '');
  const cleanTitle = cleanTitleForSearch(title);
  const cleanAuthor = String(author || '').split(/[,&/]/)[0].trim();
  const cacheKey = cleanIsbn || `${cleanTitle}_${cleanAuthor}`.toLowerCase().replace(/[^a-z0-9]/g, '');

  const cache = getCoverCache();
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // 1. Direct Open Library ISBN lookup if ISBN is present
  if (cleanIsbn) {
    const directUrl = getOpenLibraryCoverUrl(cleanIsbn, 'isbn', 'L');
    saveCoverCache(cacheKey, directUrl);
    return directUrl;
  }

  // 2. Hardcover GraphQL lookup (if user provided token)
  if (hardcoverToken) {
    try {
      const q = `
        query SearchBookCover {
          books(where: { title: { _ilike: "%${cleanTitle.replace(/"/g, '')}%" } }, limit: 1) {
            image {
              url
            }
          }
        }
      `;
      const hRes = await fetch(HARDCOVER_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hardcoverToken}`,
        },
        body: JSON.stringify({ query: q }),
        signal: AbortSignal.timeout(4000),
      });
      if (hRes.ok) {
        const hData = await hRes.json();
        const imgUrl = hData.data?.books?.[0]?.image?.url;
        if (imgUrl) {
          saveCoverCache(cacheKey, imgUrl);
          return imgUrl;
        }
      }
    } catch (e) {
      console.warn('Hardcover cover fetch failed:', e);
    }
  }

  // 3. Google Books lookup (if user provided API key)
  if (googleApiKey) {
    try {
      const gQuery = encodeURIComponent(`intitle:${cleanTitle} inauthor:${cleanAuthor}`);
      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${gQuery}&key=${googleApiKey}&maxResults=1`, {
        signal: AbortSignal.timeout(4000),
      });
      if (gRes.ok) {
        const gData = await gRes.json();
        const item = gData.items && gData.items[0];
        const gThumb = item?.volumeInfo?.imageLinks?.thumbnail || item?.volumeInfo?.imageLinks?.small;
        if (gThumb) {
          const secure = gThumb.replace(/^http:\/\//i, 'https://').replace('&edge=curl', '');
          saveCoverCache(cacheKey, secure);
          return secure;
        }
      }
    } catch (e) {
      console.warn('Google Books fetch failed:', e);
    }
  }

  // 4. Open Library Title + Author search (Default free fallback for Kindle/audiobooks)
  try {
    const params = new URLSearchParams({
      title: cleanTitle,
      limit: '1',
      fields: 'cover_i,cover_edition_key,isbn',
    });
    if (cleanAuthor) params.append('author', cleanAuthor);

    const res = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`, {
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      const first = data.docs && data.docs[0];
      if (first && first.cover_i) {
        const coverUrl = getOpenLibraryCoverUrl(first.cover_i, 'id', 'L');
        saveCoverCache(cacheKey, coverUrl);
        return coverUrl;
      } else if (first && first.isbn && first.isbn[0]) {
        const coverUrl = getOpenLibraryCoverUrl(first.isbn[0], 'isbn', 'L');
        saveCoverCache(cacheKey, coverUrl);
        return coverUrl;
      }
    }
  } catch (err) {
    console.warn('Open Library title search failed:', err);
  }

  return null;
}

/**
 * Searches Open Library by title and author.
 */
export async function searchOpenLibraryBooks(title, author = '', limit = 10) {
  try {
    const params = new URLSearchParams();
    if (title) params.append('title', cleanTitleForSearch(title));
    if (author) params.append('author', author);
    params.append('limit', String(limit));
    params.append('fields', 'key,title,author_name,first_publish_year,cover_i,cover_edition_key,isbn,edition_count');

    const res = await fetch(`${OPEN_LIBRARY_BASE}/search.json?${params.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Open Library search returned status ${res.status}`);
    }

    const data = await res.json();
    return (data.docs || []).map((doc) => ({
      key: doc.key,
      title: doc.title,
      author: (doc.author_name && doc.author_name[0]) || author || 'Unknown Author',
      firstPublishYear: doc.first_publish_year,
      coverId: doc.cover_i,
      coverUrl: doc.cover_i ? getOpenLibraryCoverUrl(doc.cover_i, 'id', 'L') : null,
      coverEditionKey: doc.cover_edition_key,
      isbn: (doc.isbn && doc.isbn[0]) || null,
      editionCount: doc.edition_count || 1,
    }));
  } catch (err) {
    console.warn('Open Library search failed or timed out:', err);
    return [];
  }
}

/**
 * Searches Open Library for an entire series by series name and author.
 */
export async function searchSeriesBooks(seriesName, author = '', limit = 20) {
  try {
    const q = `${seriesName} ${author}`.trim();
    const res = await fetch(`${OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(q)}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn`, {
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set();
    const books = [];

    for (const doc of (data.docs || [])) {
      if (!doc.title) continue;
      const lower = doc.title.toLowerCase().trim();
      if (seen.has(lower)) continue;
      if (lower.includes('boxed set') || lower.includes('collection') || lower.includes('series 1-')) continue;

      seen.add(lower);
      books.push({
        title: doc.title,
        author: (doc.author_name && doc.author_name[0]) || author,
        year: doc.first_publish_year,
        coverId: doc.cover_i,
        coverUrl: doc.cover_i ? getOpenLibraryCoverUrl(doc.cover_i, 'id', 'L') : null,
        isbn: (doc.isbn && doc.isbn[0]) || null,
      });
    }

    books.sort((a, b) => (a.year || 9999) - (b.year || 9999));
    return books;
  } catch (err) {
    console.warn('Series search error:', err);
    return [];
  }
}

/**
 * Generates external purchasing and catalog links for any book.
 */
export function getPurchaseLinks(title, author = '', isbn = '') {
  const query = encodeURIComponent(`${title} ${author}`.trim());
  const cleanIsbn = isbn ? String(isbn).replace(/[^0-9X]/gi, '') : '';

  return [
    {
      name: 'Amazon',
      icon: 'amazon',
      color: 'hover:bg-amber-500/20 text-amber-300 border-amber-500/30',
      badge: 'Fast Delivery',
      url: cleanIsbn 
        ? `https://www.amazon.com/s?k=${cleanIsbn}`
        : `https://www.amazon.com/s?k=${query}`,
    },
    {
      name: 'Bookshop.org',
      icon: 'store',
      color: 'hover:bg-rose-500/20 text-rose-300 border-rose-500/30',
      badge: 'Support Indies',
      url: cleanIsbn 
        ? `https://bookshop.org/books?keywords=${cleanIsbn}`
        : `https://bookshop.org/search?keywords=${query}`,
    },
    {
      name: 'Barnes & Noble',
      icon: 'bookmark',
      color: 'hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      badge: 'Classic Bookseller',
      url: `https://www.barnesandnoble.com/s/${query}`,
    },
    {
      name: 'Google Books',
      icon: 'google',
      color: 'hover:bg-blue-500/20 text-blue-300 border-blue-500/30',
      badge: 'Preview & Buy',
      url: `https://www.google.com/search?tbm=bks&q=${query}`,
    },
    {
      name: 'Open Library',
      icon: 'library',
      color: 'hover:bg-purple-500/20 text-purple-300 border-purple-500/30',
      badge: 'Free Archive Loan',
      url: `https://openlibrary.org/search?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`,
    },
  ];
}
