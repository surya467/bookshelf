// Enhanced Goodreads CSV Parser with Series Detection and Formula Unescaping

/**
 * Parses CSV text into rows, accurately respecting quotes, escaped quotes (""), and multiline fields.
 */
function parseCSVRows(csvText) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // handle \r\n
      }
      currentRow.push(currentField);
      if (currentRow.some((f) => f.trim() !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim() !== '')) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Strips Goodreads Excel formula escapes like `="043965548X"` and removes enclosing quotes.
 */
function cleanExcelFormula(val) {
  if (!val) return '';
  let str = String(val).trim();
  // Strip Excel ="..." or =""
  const match = str.match(/^="*(.*?)"*$/);
  if (match) {
    str = match[1].trim();
  }
  return str.replace(/^["']|["']$/g, '').trim();
}

/**
 * Extracts series name and book order from a Goodreads title string.
 * Example formats:
 * - "Harry Potter and the Philosopher's Stone (Harry Potter, #1)"
 * - "Catching Fire (The Hunger Games, #2)"
 * - "The Way of Kings (The Stormlight Archive, #1)"
 * - "Dune (Dune Chronicles #1)"
 */
export function extractSeriesFromTitle(rawTitle) {
  if (!rawTitle) return { cleanTitle: '', seriesName: null, seriesNumber: null };

  const trimmed = rawTitle.trim();

  // Pattern 1: Title (Series Name, #1) or (Series Name, #2.5)
  const pattern1 = /^(.*?)\s*\(\s*([^,()]+?)\s*,\s*#(\d+(?:\.\d+)?)\s*\)\s*$/i;
  const match1 = trimmed.match(pattern1);
  if (match1) {
    return {
      cleanTitle: match1[1].trim(),
      seriesName: match1[2].trim(),
      seriesNumber: parseFloat(match1[3]),
    };
  }

  // Pattern 2: Title (Series Name #1)
  const pattern2 = /^(.*?)\s*\(\s*([^,()]+?)\s+#(\d+(?:\.\d+)?)\s*\)\s*$/i;
  const match2 = trimmed.match(pattern2);
  if (match2) {
    return {
      cleanTitle: match2[1].trim(),
      seriesName: match2[2].trim(),
      seriesNumber: parseFloat(match2[3]),
    };
  }

  // Pattern 3: Title (Series Name, Book 1)
  const pattern3 = /^(.*?)\s*\(\s*([^,()]+?)\s*,\s*Book\s+(\d+(?:\.\d+)?)\s*\)\s*$/i;
  const match3 = trimmed.match(pattern3);
  if (match3) {
    return {
      cleanTitle: match3[1].trim(),
      seriesName: match3[2].trim(),
      seriesNumber: parseFloat(match3[3]),
    };
  }

  return {
    cleanTitle: trimmed,
    seriesName: null,
    seriesNumber: null,
  };
}

/**
 * Parses a standard Goodreads CSV export file or text.
 */
export function parseGoodreadsCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];

  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));

  const getCol = (row, ...names) => {
    for (const name of names) {
      const idx = headers.indexOf(name);
      if (idx !== -1 && row[idx] !== undefined) {
        return row[idx].trim();
      }
    }
    return '';
  };

  const books = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0 || (row.length === 1 && !row[0])) continue;

    const rawTitle = cleanExcelFormula(getCol(row, 'title', 'booktitle', 'name'));
    const author = cleanExcelFormula(getCol(row, 'author', 'creator', 'primaryauthor'));
    if (!rawTitle) continue;

    const bookId = cleanExcelFormula(getCol(row, 'bookid', 'id')) || `goodreads-${i}`;
    const rawIsbn = cleanExcelFormula(getCol(row, 'isbn'));
    const rawIsbn13 = cleanExcelFormula(getCol(row, 'isbn13'));
    const pages = parseInt(getCol(row, 'numberofpages', 'pages', 'numpages'), 10) || 0;
    const rating = parseFloat(getCol(row, 'myrating', 'rating')) || 0;
    const avgRating = parseFloat(getCol(row, 'averagerating', 'avgrating')) || 0;
    const publisher = cleanExcelFormula(getCol(row, 'publisher'));
    const binding = cleanExcelFormula(getCol(row, 'binding')) || 'Paperback';
    const year = parseInt(getCol(row, 'originalpublicationyear', 'yearpublished', 'year'), 10) || 0;
    const shelf = (getCol(row, 'exclusiveshelf', 'shelf') || 'read').toLowerCase();
    const dateRead = cleanExcelFormula(getCol(row, 'dateread'));
    const dateAdded = cleanExcelFormula(getCol(row, 'dateadded'));

    const { cleanTitle, seriesName, seriesNumber } = extractSeriesFromTitle(rawTitle);

    books.push({
      id: bookId,
      rawTitle,
      title: cleanTitle || rawTitle,
      author: author || 'Unknown Author',
      isbn: rawIsbn,
      isbn13: rawIsbn13,
      pages,
      rating,
      avgRating,
      publisher,
      binding,
      year,
      shelf,
      dateRead,
      dateAdded,
      seriesName,
      seriesNumber,
      isRead: shelf === 'read' || rating > 0 || !!dateRead,
    });
  }

  return books;
}
