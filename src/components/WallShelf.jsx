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
  isNight = false,
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

  // Fix vertical scroll getting stuck when hovering over horizontal scroll container
  const handleWheel = (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) * 0.8) {
      window.scrollBy({
        top: e.deltaY,
        behavior: 'auto',
      });
    }
  };

  return (
    <div className="relative mb-12 sm:mb-14 animate-fadeIn w-full">
      {/* Scrollable / Responsive Content Container */}
      <div
        onWheel={handleWheel}
        className="relative w-full overflow-x-auto pb-0 pt-3 px-3 sm:px-6 scrollbar-none"
      >
        <div className="flex items-end gap-2 sm:gap-3.5 min-w-max mx-auto justify-start">
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
                      <span className={`text-[11px] sm:text-[12px] font-semibold tracking-tight truncate max-w-[200px] sm:max-w-[300px] ${
                        isNight ? 'text-neutral-200' : 'text-neutral-800'
                      }`}>
                        {s.name}
                      </span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-normal ${
                        isNight ? 'bg-white/10 text-neutral-400' : 'bg-black/5 text-neutral-600'
                      }`}>
                        {s.readCount}/{s.totalCount}
                      </span>
                      {s.isCompleted && (
                        <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded ${
                          isNight ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-700 bg-emerald-100'
                        }`}>
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Books in this series */}
                    <div className="flex items-end gap-2.5 sm:gap-3">
                      {s.books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                          isNight={isNight}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Clean Minimalist Bookend Gap between different series on same shelf */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[115px] px-2.5 sm:px-3 pb-1 select-none pointer-events-none">
                      <div className={`w-[2.5px] h-10 rounded-full ${
                        isNight ? 'bg-amber-400/40 shadow-[0_0_6px_rgba(251,191,36,0.3)]' : 'bg-neutral-300'
                      }`} />
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
                      <span className={`text-[11px] sm:text-[12px] font-semibold tracking-tight ${
                        isNight ? 'text-neutral-400' : 'text-neutral-600'
                      }`}>
                        {groupTitle}
                      </span>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.2 rounded-full ${
                        isNight ? 'bg-white/10 text-neutral-400' : 'bg-black/5 text-neutral-500'
                      }`}>
                        {books.length}
                      </span>
                    </div>

                    {/* Standalone Books */}
                    <div className="flex items-end gap-2.5 sm:gap-3">
                      {books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                          isNight={isNight}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bookend Gap if followed by another item */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[115px] px-2.5 sm:px-3 pb-1 select-none pointer-events-none">
                      <div className={`w-[2.5px] h-10 rounded-full ${
                        isNight ? 'bg-amber-400/40 shadow-[0_0_6px_rgba(251,191,36,0.3)]' : 'bg-neutral-300'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Real Built-In Bedroom Shelf Stack Ledge (White Shelves on Off-White Wall) */}
      <div className="relative w-full z-0 -mt-1 px-1 sm:px-3 select-none pointer-events-none">
        {/* Shelf Top Face (Beveled Lacquer Surface) */}
        <div className={`h-2.5 w-full rounded-t-[3px] border-t transition-colors duration-500 ${
          isNight
            ? 'bg-gradient-to-b from-[#252834] to-[#161822] border-white/20'
            : 'bg-gradient-to-b from-[#ffffff] to-[#f4f2ea] border-white shadow-inner'
        }`} />

        {/* Shelf Front Fascia Rail (Clean Architectural White) */}
        <div className={`h-3 w-full rounded-b-[3px] transition-colors duration-500 ${
          isNight
            ? 'night-shelf-ledge'
            : 'white-shelf-ledge'
        }`} />
      </div>
    </div>
  );
}
