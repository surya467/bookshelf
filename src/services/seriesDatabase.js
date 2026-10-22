// Curated Database of Popular Literary Series with verified Open Library Cover IDs & metadata
// Fallback and instant offline-first accuracy for iconic fantasy, sci-fi, and YA series

export const CURATED_SERIES = {
  'harry potter': {
    name: 'Harry Potter',
    author: 'J.K. Rowling',
    universe: 'Wizarding World',
    totalBooks: 7,
    books: [
      {
        order: 1,
        title: "Harry Potter and the Philosopher's Stone",
        altTitle: "Harry Potter and the Sorcerer's Stone",
        year: 1997,
        coverId: 15155833,
        isbn13: '9780439708180',
        pages: 309,
        description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Whispered by owls, then flooded in by hundreds.',
      },
      {
        order: 2,
        title: 'Harry Potter and the Chamber of Secrets',
        year: 1998,
        coverId: 15158664,
        isbn13: '9780439064873',
        pages: 341,
        description: 'Harry Potter\'s summer has included the worst birthday ever, doomy warnings from a house-elf called Dobby, and rescue from the Dursleys by his friend Ron Weasley in a magical flying car.',
      },
      {
        order: 3,
        title: 'Harry Potter and the Prisoner of Azkaban',
        year: 1999,
        coverId: 10580435,
        isbn13: '9780439655484',
        pages: 435,
        description: 'For twelve long years, the dread fortress of Azkaban held an infamous prisoner named Sirius Black. Convicted of killing thirteen people with a single curse, he was said to be the heir apparent to the Dark Lord.',
      },
      {
        order: 4,
        title: 'Harry Potter and the Goblet of Fire',
        year: 2000,
        coverId: 12059372,
        isbn13: '9780439139601',
        pages: 734,
        description: 'The Triwizard Tournament is to be held at Hogwarts. Only wizards who are over seventeen are allowed to enter - but that doesn\'t stop Harry dreaming that he will win.',
      },
      {
        order: 5,
        title: 'Harry Potter and the Order of the Phoenix',
        year: 2003,
        coverId: 15158666,
        isbn13: '9780439358071',
        pages: 870,
        description: 'There is a door at the end of a silent corridor. And it\'s haunting Harry Potter\'s dreams. Why else would he be waking in the middle of the night, screaming in terror?',
      },
      {
        order: 6,
        title: 'Harry Potter and the Half-Blood Prince',
        year: 2005,
        coverId: 10716273,
        isbn13: '9780439785969',
        pages: 652,
        description: 'The war against Voldemort is not going well; even the Muggle government is noticing. Dumbledore is absent from Hogwarts for long stretches of time, and the Order of the Phoenix has already suffered losses.',
      },
      {
        order: 7,
        title: 'Harry Potter and the Deathly Hallows',
        year: 2007,
        coverId: 15158660,
        isbn13: '9780545139700',
        pages: 759,
        description: 'Harry is waiting in Privet Drive. The Order of the Phoenix is coming to escort him safely away without Voldemort and his supporters knowing - if they can.',
      },
    ],
  },

  'the lord of the rings': {
    name: 'The Lord of the Rings & Middle-earth',
    author: 'J.R.R. Tolkien',
    universe: 'Middle-earth',
    totalBooks: 4,
    books: [
      {
        order: 0,
        title: 'The Hobbit, or There and Back Again',
        year: 1937,
        coverId: 8235110,
        isbn13: '9780547928227',
        pages: 366,
        description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when Gandalf the wizard arrives.',
      },
      {
        order: 1,
        title: 'The Fellowship of the Ring',
        year: 1954,
        coverId: 12818862,
        isbn13: '9780547928210',
        pages: 423,
        description: 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them.',
      },
      {
        order: 2,
        title: 'The Two Towers',
        year: 1954,
        coverId: 12818863,
        isbn13: '9780547928203',
        pages: 352,
        description: 'The Fellowship has been forced to divide. Frodo and Sam continue their journey alone towards Mount Doom along the great River Anduin.',
      },
      {
        order: 3,
        title: 'The Return of the King',
        year: 1955,
        coverId: 12818864,
        isbn13: '9780547928197',
        pages: 440,
        description: 'The Dark Lord has put forth all his strength, and his great Army is gathered in the deep shadows of Mordor to assault Gondor.',
      },
    ],
  },

  'the hunger games': {
    name: 'The Hunger Games',
    author: 'Suzanne Collins',
    universe: 'Panem',
    totalBooks: 4,
    books: [
      {
        order: 1,
        title: 'The Hunger Games',
        year: 2008,
        coverId: 12646537,
        isbn13: '9780439023481',
        pages: 374,
        description: 'Could you survive on your own in the wild, with every one out to make sure you don\'t live to see the morning?',
      },
      {
        order: 2,
        title: 'Catching Fire',
        year: 2009,
        coverId: 12646543,
        isbn13: '9780439023498',
        pages: 391,
        description: 'Against all odds, Katniss Everdeen has won the annual Hunger Games with fellow district tribute Peeta Mellark. But Katniss and Peeta must now tour the districts.',
      },
      {
        order: 3,
        title: 'Mockingjay',
        year: 2010,
        coverId: 12646546,
        isbn13: '9780439023511',
        pages: 390,
        description: 'Against all odds, Katniss Everdeen has survived the Hunger Games twice. But now that she\'s made it out of the bloody arena alive, she\'s still not safe.',
      },
      {
        order: 4,
        title: 'The Ballad of Songbirds and Snakes',
        year: 2020,
        coverId: 12024298,
        isbn13: '9781338635171',
        pages: 517,
        description: 'Ambition will fuel him. Competition will drive him. But power has a price.',
      },
    ],
  },

  'percy jackson': {
    name: 'Percy Jackson & the Olympians',
    author: 'Rick Riordan',
    universe: 'Camp Half-Blood',
    totalBooks: 5,
    books: [
      { order: 1, title: 'The Lightning Thief', year: 2005, coverId: 8234376, isbn13: '9780786838653', pages: 377 },
      { order: 2, title: 'The Sea of Monsters', year: 2006, coverId: 8234382, isbn13: '9780786856862', pages: 279 },
      { order: 3, title: "The Titan's Curse", year: 2007, coverId: 8234389, isbn13: '9780786856886', pages: 312 },
      { order: 4, title: 'The Battle of the Labyrinth', year: 2008, coverId: 8234394, isbn13: '9781423101468', pages: 361 },
      { order: 5, title: 'The Last Olympian', year: 2009, coverId: 8234398, isbn13: '9781423101475', pages: 381 },
    ],
  },

  'dune': {
    name: 'Dune Chronicles',
    author: 'Frank Herbert',
    universe: 'Dune Universe',
    totalBooks: 6,
    books: [
      { order: 1, title: 'Dune', year: 1965, coverId: 10484547, isbn13: '9780441172719', pages: 658 },
      { order: 2, title: 'Dune Messiah', year: 1969, coverId: 10484555, isbn13: '9780441172696', pages: 256 },
      { order: 3, title: 'Children of Dune', year: 1976, coverId: 10484561, isbn13: '9780441104024', pages: 444 },
      { order: 4, title: 'God Emperor of Dune', year: 1981, coverId: 10484567, isbn13: '9780441294671', pages: 423 },
      { order: 5, title: 'Heretics of Dune', year: 1984, coverId: 10484572, isbn13: '9780441328000', pages: 471 },
      { order: 6, title: 'Chapterhouse: Dune', year: 1985, coverId: 10484577, isbn13: '9780441102679', pages: 436 },
    ],
  },

  'mistborn': {
    name: 'Mistborn (Era 1)',
    author: 'Brandon Sanderson',
    universe: 'Cosmere',
    totalBooks: 3,
    books: [
      { order: 1, title: 'The Final Empire', year: 2006, coverId: 8234401, isbn13: '9780765350381', pages: 541 },
      { order: 2, title: 'The Well of Ascension', year: 2007, coverId: 8234406, isbn13: '9780765356130', pages: 590 },
      { order: 3, title: 'The Hero of Ages', year: 2008, coverId: 8234411, isbn13: '9780765356147', pages: 572 },
    ],
  },

  'the stormlight archive': {
    name: 'The Stormlight Archive',
    author: 'Brandon Sanderson',
    universe: 'Cosmere',
    totalBooks: 5,
    books: [
      { order: 1, title: 'The Way of Kings', year: 2010, coverId: 8234417, isbn13: '9780765365279', pages: 1007 },
      { order: 2, title: 'Words of Radiance', year: 2014, coverId: 8234422, isbn13: '9780765365286', pages: 1087 },
      { order: 3, title: 'Oathbringer', year: 2017, coverId: 8234428, isbn13: '9780765365293', pages: 1243 },
      { order: 4, title: 'Rhythm of War', year: 2020, coverId: 10565893, isbn13: '9780765326386', pages: 1232 },
      { order: 5, title: 'Wind and Truth', year: 2024, coverId: 14785210, isbn13: '9780765326393', pages: 1344 },
    ],
  },

  'a song of ice and fire': {
    name: 'A Song of Ice and Fire',
    author: 'George R.R. Martin',
    universe: 'Westeros',
    totalBooks: 5,
    books: [
      { order: 1, title: 'A Game of Thrones', year: 1996, coverId: 12568741, isbn13: '9780553593716', pages: 835 },
      { order: 2, title: 'A Clash of Kings', year: 1998, coverId: 12568745, isbn13: '9780553579901', pages: 969 },
      { order: 3, title: 'A Storm of Swords', year: 2000, coverId: 12568749, isbn13: '9780553573428', pages: 1177 },
      { order: 4, title: 'A Feast for Crows', year: 2005, coverId: 12568752, isbn13: '9780553582024', pages: 1060 },
      { order: 5, title: 'A Dance with Dragons', year: 2011, coverId: 12568756, isbn13: '9780553582017', pages: 1040 },
    ],
  },

  'red rising': {
    name: 'Red Rising Saga',
    author: 'Pierce Brown',
    universe: 'Solar Republic',
    totalBooks: 6,
    books: [
      { order: 1, title: 'Red Rising', year: 2014, coverId: 7316188, isbn13: '9780345539786', pages: 382 },
      { order: 2, title: 'Golden Son', year: 2015, coverId: 8454351, isbn13: '9780345539816', pages: 442 },
      { order: 3, title: 'Morning Star', year: 2016, coverId: 8566174, isbn13: '9780345539847', pages: 524 },
      { order: 4, title: 'Iron Gold', year: 2018, coverId: 14511722, isbn13: '9780425285923', pages: 624 },
      { order: 5, title: 'Dark Age', year: 2019, coverId: 8748017, isbn13: '9780425285947', pages: 757 },
      { order: 6, title: 'Light Bringer', year: 2023, coverId: 15157697, isbn13: '9780425285978', pages: 682 },
    ],
  },
};

/**
 * Normalizes a series query for matching.
 */
export function normalizeSeriesKey(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the curated database for a series matching a given series name, author, or book title.
 */
export function findCuratedSeries(seriesName, author = '', bookTitle = '') {
  const normSeries = normalizeSeriesKey(seriesName);
  const normTitle = normalizeSeriesKey(bookTitle);
  const normAuthor = normalizeSeriesKey(author);

  // Direct match by series key
  for (const [key, data] of Object.entries(CURATED_SERIES)) {
    const normKey = normalizeSeriesKey(key);
    if (normSeries && (normSeries === normKey || normSeries.includes(normKey) || normKey.includes(normSeries))) {
      return data;
    }
  }

  // Check Tolkien / Hobbit / LOTR universe
  if (
    normAuthor.includes('tolkien') ||
    normTitle.includes('hobbit') ||
    normTitle.includes('fellowship') ||
    normTitle.includes('two towers') ||
    normTitle.includes('return of the king')
  ) {
    return CURATED_SERIES['the lord of the rings'];
  }

  // Check Harry Potter
  if (normAuthor.includes('rowling') || normTitle.includes('harry potter')) {
    return CURATED_SERIES['harry potter'];
  }

  // Check Hunger Games
  if (normAuthor.includes('collins') || normTitle.includes('hunger games') || normTitle.includes('catching fire') || normTitle.includes('mockingjay')) {
    return CURATED_SERIES['the hunger games'];
  }

  // Check Dune
  if (normAuthor.includes('herbert') || normTitle.includes('dune')) {
    return CURATED_SERIES['dune'];
  }

  // Check Cosmere / Sanderson
  if (normAuthor.includes('sanderson')) {
    if (normSeries.includes('stormlight') || normTitle.includes('way of kings') || normTitle.includes('words of radiance')) {
      return CURATED_SERIES['the stormlight archive'];
    }
    if (normSeries.includes('mistborn') || normTitle.includes('final empire') || normTitle.includes('well of ascension')) {
      return CURATED_SERIES['mistborn'];
    }
  }

  return null;
}
