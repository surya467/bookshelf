import React from 'react';
import Book3D from './Book3D';

/**
 * WallShelf: Built-in Architectural Bookshelf Row.
 * Features titanium / dark walnut shelf ledges, brass series plaques,
 * and minimal bookend dividers.
 */
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

  return (
    <div className="relative mb-6 sm:mb-8 animate-fadeIn w-full">
      {/* Content Container */}
      <div className="relative w-full pb-0 pt-2 px-2 sm:px-3">
        <div className="flex items-end gap-2 sm:gap-2.5 w-full justify-start">
          {items.map((item, itemIdx) => {
            const isLast = itemIdx === items.length - 1;

            if (item.type === 'series') {
              const s = item.data;
              return (
                <React.Fragment key={s.id || `series-${itemIdx}`}>
                  {/* Series Block */}
                  <div id={`series-${s.id || itemIdx}`} className="flex flex-col flex-shrink-0 scroll-mt-24">
                    {/* Series Title: Placed at top with Editorial Serif */}
                    <div className="flex items-center gap-2 mb-2 pl-0.5 select-none">
                      <span
                        title={s.name}
                        className={`font-editorial text-xs sm:text-[13px] font-bold tracking-tight truncate text-neutral-200 ${
                          s.books.length === 1
                            ? 'max-w-[105px] sm:max-w-[115px]'
                            : s.books.length === 2
                            ? 'max-w-[175px] sm:max-w-[195px]'
                            : 'max-w-[260px] sm:max-w-[320px]'
                        }`}
                      >
                        {s.name}
                      </span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full font-medium bg-white/10 text-neutral-300">
                        {s.readCount}/{s.totalCount}
                      </span>
                      {s.isCompleted && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded text-emerald-300 bg-emerald-500/15 border border-emerald-500/20">
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

                  {/* Minimalist Machined Titanium Bookend Divider */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[110px] px-1.5 sm:px-2 pb-1 select-none pointer-events-none">
                      <div className="w-[2px] h-10 rounded-full bg-gradient-to-b from-white/20 via-white/10 to-transparent shadow-sm" />
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
                    <div className="flex items-center gap-2 mb-2 pl-0.5 select-none">
                      <span
                        title={groupTitle}
                        className={`font-editorial text-xs sm:text-[13px] font-bold tracking-tight text-neutral-300 truncate ${
                          books.length === 1
                            ? 'max-w-[105px] sm:max-w-[115px]'
                            : books.length === 2
                            ? 'max-w-[175px] sm:max-w-[195px]'
                            : 'max-w-[260px] sm:max-w-[320px]'
                        }`}
                      >
                        {groupTitle}
                      </span>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-300">
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
                    <div className="flex flex-col justify-end self-end h-[95px] sm:h-[110px] px-1.5 sm:px-2 pb-1 select-none pointer-events-none">
                      <div className="w-[2px] h-10 rounded-full bg-gradient-to-b from-white/20 via-white/10 to-transparent shadow-sm" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Sleek Architectural Dark Shelf Ledge with Specular Edge */}
      <div className="relative w-full z-0 -mt-0.5 px-0.5 sm:px-1 select-none pointer-events-none">
        {/* Top Shelf Face with Bevel Edge */}
        <div className="h-2 w-full rounded-t-[2px] bg-gradient-to-b from-[#252834] to-[#181922] border-t border-white/20" />

        {/* Shelf Front Fascia Rail with ambient shadow */}
        <div className="h-3 w-full rounded-b-[2px] dark-shelf-ledge" />
      </div>
    </div>
  );
}
