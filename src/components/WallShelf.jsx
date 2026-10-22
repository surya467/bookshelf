import React from 'react';
import Book3D from './Book3D';

export default function WallShelf({
  shelfItems = [],
  series,
  isStandalone = false,
  standaloneBooks = [],
  isWantToReadShelf = false,
  wantToReadBooks = [],
  onInspectBook,
  bookSize = 'default',
  onHoverStart,
  onHoverEnd,
}) {
  // Normalize items for the shelf
  let items = [];

  if (shelfItems && shelfItems.length > 0) {
    items = shelfItems;
  } else if (series) {
    items = [{ type: 'series', data: series }];
  } else if (isStandalone && standaloneBooks.length > 0) {
    items = [{ type: 'standalone-group', title: 'Individual Works', books: standaloneBooks }];
  } else if (isWantToReadShelf && wantToReadBooks.length > 0) {
    items = [{ type: 'standalone-group', title: 'Wishlist & To-Read', books: wantToReadBooks }];
  }

  if (items.length === 0) return null;

  // Pass-through vertical wheel events when hovering over shelf container
  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 0.8) {
      window.scrollBy({
        top: e.deltaY,
        behavior: 'auto',
      });
    }
  };

  return (
    <div className="relative mb-5 sm:mb-6 animate-fadeIn w-full">
      {/* Content Container */}
      <div
        onWheel={handleWheel}
        className="relative w-full overflow-x-auto pb-0 pt-2 px-2 sm:px-4 scrollbar-none"
      >
        <div className="flex items-end gap-2 sm:gap-3 min-w-max mx-auto justify-start">
          {items.map((item, itemIdx) => {
            const isLast = itemIdx === items.length - 1;

            if (item.type === 'series') {
              const s = item.data;
              return (
                <React.Fragment key={s.id || `series-${itemIdx}`}>
                  {/* Series Block */}
                  <div id={`series-${s.id || itemIdx}`} className="flex flex-col flex-shrink-0 scroll-mt-24">
                    {/* Series Title: Placed at top starting from left of 1st book */}
                    <div className="flex items-center gap-2 mb-1.5 pl-0.5 select-none">
                      <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight truncate max-w-[220px] sm:max-w-[320px] text-neutral-200">
                        {s.name}
                      </span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-normal bg-white/10 text-neutral-400">
                        {s.readCount}/{s.totalCount}
                      </span>
                      {s.isCompleted && (
                        <span className="text-[9px] font-medium px-1.5 py-0.2 rounded text-emerald-400 bg-emerald-500/15 border border-emerald-500/20">
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Books in this series */}
                    <div className="flex items-end gap-2 sm:gap-2.5">
                      {s.books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Clean Minimalist Bookend Divider between different series on same shelf */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[110px] px-2 sm:px-2.5 pb-1 select-none pointer-events-none">
                      <div className="w-[2px] h-9 rounded-full bg-white/15" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            if (item.type === 'standalone-group') {
              const books = item.books || [];
              const groupTitle = item.title || 'Individual Works';

              return (
                <React.Fragment key={`standalone-${itemIdx}`}>
                  {/* Standalone Single Books Sitting in Remaining Shelf Space */}
                  <div className="flex flex-col flex-shrink-0 scroll-mt-24">
                    {/* Standalone Header starting from left of first book */}
                    <div className="flex items-center gap-2 mb-1.5 pl-0.5 select-none">
                      <span className="text-[11px] sm:text-[12px] font-semibold tracking-tight text-neutral-300">
                        {groupTitle}
                      </span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-400">
                        {books.length}
                      </span>
                    </div>

                    {/* Standalone Books */}
                    <div className="flex items-end gap-2 sm:gap-2.5">
                      {books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bookend Divider if followed by another item */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[110px] px-2 sm:px-2.5 pb-1 select-none pointer-events-none">
                      <div className="w-[2px] h-9 rounded-full bg-white/15" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Sleek Architectural Dark Shelf Ledge */}
      <div className="relative w-full z-0 -mt-0.5 px-0.5 sm:px-1 select-none pointer-events-none">
        {/* Top Shelf Face with Bevel Edge */}
        <div className="h-2 w-full rounded-t-[2px] bg-gradient-to-b from-[#22242e] to-[#16171f] border-t border-white/15" />

        {/* Shelf Front Fascia Rail */}
        <div className="h-2.5 w-full rounded-b-[2px] dark-shelf-ledge" />
      </div>
    </div>
  );
}
