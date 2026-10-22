// Open Library API Client & Cover Utility
// Documentation: https://openlibrary.org/developers/api

export const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
export const COVERS_BASE = 'https://covers.openlibrary.org';

/**
 * Generates an Open Library cover image URL.
 * Sizes: 'S' (small thumbnail), 'M' (medium ~200px), 'L' (large ~500px)
 * Key types: 'id' (Cover ID), 'isbn' (ISBN-10 or 13), 'olid' (Open Library ID), 'lccn', 'oclc'
 */
export function getOpenLibraryCoverUrl(value, key = 'id', size = 'L') {
  if (!value) return null;
  const cleanVal = String(value).trim().replace(/[^0-9a-zA-Z]/g, '');
  if (!cleanVal) return null;
  return `${COVERS_BASE}/b/${key}/${cleanVal}-${size}.jpg`;
}

/**
 * Searches Open Library by title and author.
 * Returns candidate work/edition docs with covers, first_publish_year, and ISBNs.
 */
export async function searchOpenLibraryBooks(title, author = '', limit = 10) {
  try {
    const params = new URLSearchParams();
    if (title) params.append('title', title);
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
      // Filter out boxed sets, companion guides, omnibus if individual books exist
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

    // Sort by publication year
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
  const cleanIsbn = isbn ? isbn.replace(/[^0-9X]/gi, '') : '';

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
