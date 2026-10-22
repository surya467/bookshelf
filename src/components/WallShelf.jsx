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
  onToggleRead,
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

  return (
    <div className="relative mb-14 sm:mb-16 animate-fadeIn w-full">
      {/* Scrollable / Responsive Content Container */}
      <div className="relative w-full overflow-x-auto pb-0 pt-4 px-4 sm:px-8 scrollbar-none">
        <div className="flex items-end gap-2 sm:gap-3 min-w-max mx-auto justify-start">
          {items.map((item, itemIdx) => {
            const isLast = itemIdx === items.length - 1;

            if (item.type === 'series') {
              const s = item.data;
              return (
                <React.Fragment key={s.id || `series-${itemIdx}`}>
                  {/* Series Block */}
                  <div id={`series-${s.id || itemIdx}`} className="flex flex-col flex-shrink-0 scroll-mt-24">
                    {/* Series Title: Placed at the top starting from the left of the 1st book */}
                    <div className="flex items-center gap-2 mb-2 pl-0.5 select-none">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-white/95 tracking-tight truncate max-w-[200px] sm:max-w-[300px]">
                        {s.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-white/70 rounded-full font-normal">
                        {s.readCount}/{s.totalCount}
                      </span>
                      {s.isCompleted && (
                        <span className="text-[9px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Complete
                        </span>
                      )}
                    </div>

                    {/* Books of this Series */}
                    <div className="flex items-end gap-2.5 sm:gap-3.5">
                      {s.books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onToggleRead={onToggleRead}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Elegant Metallic Bookend Gap between different series on same shelf */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[105px] sm:h-[125px] px-2 sm:px-3 pb-1 select-none">
                      <div className="w-[3px] h-12 bg-gradient-to-t from-amber-400/50 via-white/20 to-transparent rounded-full shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
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
                  {/* Standalone Books Block Sitting in Remaining Space */}
                  <div className="flex flex-col flex-shrink-0 scroll-mt-24">
                    {/* Standalone Header starting from left of first book */}
                    <div className="flex items-center gap-2 mb-2 pl-0.5 select-none">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-white/70 tracking-tight">
                        {groupTitle}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-white/10 text-white/50 rounded-full">
                        {books.length}
                      </span>
                    </div>

                    {/* Standalone Books */}
                    <div className="flex items-end gap-2.5 sm:gap-3.5">
                      {books.map((book) => (
                        <Book3D
                          key={book.id}
                          book={book}
                          size={bookSize}
                          onInspect={onInspectBook}
                          onToggleRead={onToggleRead}
                          onHoverStart={onHoverStart}
                          onHoverEnd={onHoverEnd}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bookend Gap if followed by another item */}
                  {!isLast && (
                    <div className="flex flex-col justify-end self-end h-[105px] sm:h-[125px] px-2 sm:px-3 pb-1 select-none">
                      <div className="w-[3px] h-12 bg-gradient-to-t from-amber-400/50 via-white/20 to-transparent rounded-full shadow-[0_0_8px_rgba(251,191,36,0.3)]" />
                    </div>
                  )}
                </React.Fragment>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* Realistic Continuous Floating Architectural Shelf Ledge with Sculpted End Caps */}
      <div className="relative w-full z-0 -mt-1 px-1 sm:px-2">
        {/* Top Metallic Bevel Running Full Width */}
        <div className="relative h-2 w-full bg-gradient-to-b from-[#2e313e] to-[#181a22] border-t border-white/25 rounded-t-[4px]">
          {/* Left Sculpted Edge Cap */}
          <div className="absolute left-0 inset-y-0 w-3 rounded-tl-[4px] bg-gradient-to-r from-white/25 to-transparent border-l border-white/30" />
          {/* Right Sculpted Edge Cap */}
          <div className="absolute right-0 inset-y-0 w-3 rounded-tr-[4px] bg-gradient-to-l from-white/25 to-transparent border-r border-white/30" />
        </div>

        {/* Shelf Front Fascia Rail with Polished Metallic Trim */}
        <div className="relative h-3.5 w-full shelf-ledge-dark rounded-b-[4px]">
          {/* Left Finished Cap */}
          <div className="absolute left-0 inset-y-0 w-2.5 rounded-bl-[4px] bg-gradient-to-r from-white/20 via-transparent to-transparent border-l border-white/25 shadow-sm" />
          {/* Right Finished Cap */}
          <div className="absolute right-0 inset-y-0 w-2.5 rounded-br-[4px] bg-gradient-to-l from-white/20 via-transparent to-transparent border-r border-white/25 shadow-sm" />
        </div>

        {/* Soft Ambient Warm/Cool LED Glow Cast onto Black Wall Underneath */}
        <div className="h-8 w-full shelf-ambient-glow -mt-1 pointer-events-none" />

        {/* Realistic Architectural Mounting Wall Brackets */}
        <div className="absolute left-6 -bottom-2 w-2 h-3.5 bg-gradient-to-b from-zinc-600 to-black rounded-b border-x border-b border-white/10 opacity-75 shadow-sm pointer-events-none" />
        <div className="absolute right-6 -bottom-2 w-2 h-3.5 bg-gradient-to-b from-zinc-600 to-black rounded-b border-x border-b border-white/10 opacity-75 shadow-sm pointer-events-none" />
      </div>
    </div>
  );
}
