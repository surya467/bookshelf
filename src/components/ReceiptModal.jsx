import React, { useRef } from 'react';
import { X, Printer, Copy, Check, Sparkles } from 'lucide-react';
import { formatPrice } from '../services/priceDiscovery';

export default function ReceiptModal({ isOpen, onClose, books, totalValue, currency }) {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      '🌸 THE COZY BOOKSHOPPE 🌸',
      '====================================',
      `DATE: ${new Date().toLocaleDateString()}`,
      `TOTAL BOOKS: ${books.length}`,
      '------------------------------------',
      ...books.map(
        (b, i) => `${(i + 1).toString().padStart(2, '0')}. ${b.title.slice(0, 24).padEnd(24, ' ')} ${formatPrice(b.price, currency).padStart(8, ' ')}`
      ),
      '------------------------------------',
      `TOTAL VALUE: ${formatPrice(totalValue, currency)}`,
      '====================================',
      'Thank you for reading! Have a magical day! ✨',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col bg-amber-50 rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 bg-amber-100/70 border-b border-amber-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Bookshelf Receipt</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-200/80 text-amber-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body with jagged top/bottom styling */}
        <div
          ref={receiptRef}
          className="p-6 overflow-y-auto font-mono text-xs text-slate-800 space-y-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"
        >
          {/* Store Banner */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-black tracking-wider text-slate-900">
              🌸 COZY BOOKSHOP MART 🌸
            </h3>
            <p className="text-[11px] text-slate-500">123 READING LANE, BOOKSHELF CITY</p>
            <p className="text-[10px] text-slate-400">TEL: (555) 432-BOOK</p>
            <p className="text-[10px] text-slate-400">
              DATE: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </div>

          <div className="border-t border-dashed border-slate-400 my-2" />

          {/* Table Header */}
          <div className="flex justify-between font-bold text-[11px] text-slate-700">
            <span>QTY & TITLE</span>
            <span>PRICE</span>
          </div>

          <div className="border-t border-slate-300 my-1" />

          {/* Book Items List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {books.map((b, idx) => (
              <div key={b.id || idx} className="flex justify-between items-start gap-2">
                <div className="flex-1 truncate">
                  <span className="font-semibold text-slate-900">1x {b.title}</span>
                  <span className="block text-[10px] text-slate-500 truncate">{b.author}</span>
                </div>
                <span className="font-bold text-slate-900 flex-shrink-0">
                  {formatPrice(b.price, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-slate-400 my-2" />

          {/* Totals */}
          <div className="space-y-1 text-slate-700">
            <div className="flex justify-between">
              <span>SUBTOTAL ({books.length} items):</span>
              <span>{formatPrice(totalValue, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>TAX (0.00%):</span>
              <span>$0.00</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-900 pt-1 border-t border-slate-300">
              <span>TOTAL ESTIMATED WORTH:</span>
              <span className="text-pink-600 font-extrabold">{formatPrice(totalValue, currency)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-400 my-3" />

          {/* Cute Barcode */}
          <div className="text-center space-y-1 pt-1">
            <div className="tracking-[6px] font-black text-slate-800 text-sm">
              ||| | |||| | ||||| || |||
            </div>
            <p className="text-[10px] text-slate-500">AUTH CODE: #READ-MORE-BOOKS</p>
            <p className="text-[11px] font-semibold text-pink-600 mt-2">
              ✨ Reading is the greatest treasure! ✨
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-2 p-4 bg-amber-100/70 border-t border-amber-200">
          <button
            onClick={handleCopyText}
            className="flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs py-2.5 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
