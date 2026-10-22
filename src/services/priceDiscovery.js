// Price Discovery & Cover Artwork Engine

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1.0, label: 'USD ($)', decimals: 2 },
  EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)', decimals: 2 },
  GBP: { symbol: '£', rate: 0.78, label: 'GBP (£)', decimals: 2 },
  CAD: { symbol: 'CA$', rate: 1.36, label: 'CAD ($)', decimals: 2 },
  AUD: { symbol: 'AU$', rate: 1.52, label: 'AUD ($)', decimals: 2 },
  INR: { symbol: '₹', rate: 83.5, label: 'INR (₹)', decimals: 0 },
  JPY: { symbol: '¥', rate: 155.0, label: 'JPY (¥)', decimals: 0 },
};

export function formatPrice(amountInUSD, currencyCode = 'USD') {
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = amountInUSD * curr.rate;
  if (curr.decimals === 0) {
    return `${curr.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${curr.symbol}${converted.toFixed(curr.decimals)}`;
}

/**
 * Generates a deterministic realistic book price based on ISBN, title, page count, and binding
 * Used when online retail APIs are rate limited or don't list retail prices.
 */
export function estimateRealisticBookPrice(book) {
  const binding = (book.binding || '').toLowerCase();
  const pages = book.pages || 320;
  
  // Base price tier by binding
  let basePrice = 16.99;
  if (binding.includes('hardcover') || binding.includes('hardback') || binding.includes('cloth')) {
    basePrice = 28.99;
  } else if (binding.includes('mass market')) {
    basePrice = 9.99;
  } else if (binding.includes('paperback') || binding.includes('trade')) {
    basePrice = 17.99;
  } else if (binding.includes('kindle') || binding.includes('ebook')) {
    basePrice = 12.99;
  } else if (binding.includes('audio')) {
    basePrice = 24.99;
  }

  // Adjust for page count
  const pageAdjustment = (pages - 300) * 0.018; // ~ $1.80 per 100 extra pages
  let calculated = basePrice + pageAdjustment;

  // Add deterministic subtle jitter from ISBN or title so prices look natural (e.g. $18.99, $24.50)
  const seedString = (book.isbn13 || book.isbn || book.title || 'book').toString();
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash * 31 + seedString.charCodeAt(i)) & 0xffffffff;
  }
  const varianceOptions = [-2.0, -1.0, 0.0, 1.0, 2.0, 3.0, 4.0];
  const centsEnding = [0.99, 0.95, 0.50, 0.00, 0.99];

  const variance = varianceOptions[Math.abs(hash) % varianceOptions.length];
  const cents = centsEnding[Math.abs(hash >> 3) % centsEnding.length];

  calculated = Math.max(7.99, calculated + variance);
  const finalPrice = Math.floor(calculated) + cents;

  return Math.round(finalPrice * 100) / 100;
}

/**
 * Searches OpenLibrary or Google Books for price and cover
 */
export async function lookupBookMetadata(book) {
  let coverUrl = book.coverUrl;
  let price = book.price;
  let priceSource = book.priceSource;
  let description = '';

  const cleanIsbn = book.isbn13 || book.isbn;

  // If we already have a cover (e.g. from Goodreads RSS), check price first
  // Try Google Books API
  try {
    const q = cleanIsbn 
      ? `isbn:${cleanIsbn}` 
      : `intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}`;

    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`, {
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      const item = data.items?.[0];
      if (item) {
        const volumeInfo = item.volumeInfo || {};
        const saleInfo = item.saleInfo || {};

        if (!coverUrl && volumeInfo.imageLinks) {
          const img = volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail;
          if (img) {
            coverUrl = img.replace(/^http:\/\//i, 'https://');
          }
        }

        if (volumeInfo.description) {
          description = volumeInfo.description;
        }

        // Check if real retail price is listed in Google Books
        if (saleInfo.retailPrice?.amount) {
          price = saleInfo.retailPrice.amount;
          priceSource = 'verified';
        } else if (saleInfo.listPrice?.amount) {
          price = saleInfo.listPrice.amount;
          priceSource = 'verified';
        }
      }
    }
  } catch {
    // Timeout or Google Books quota exceeded — gracefully continue to OpenLibrary/fallback
  }

  // If cover still missing and we have an ISBN, OpenLibrary covers are fast & reliable
  if (!coverUrl && cleanIsbn) {
    coverUrl = `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`;
  }

  // If price is still not found from retail APIs, use realistic publisher MSRP estimate
  if (!price || price <= 0) {
    price = estimateRealisticBookPrice(book);
    priceSource = 'market_msrp';
  }

  return {
    ...book,
    coverUrl,
    price,
    priceSource,
    description: description || book.description || '',
  };
}
