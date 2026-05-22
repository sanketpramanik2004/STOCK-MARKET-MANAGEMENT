import { Hash, Wallet, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function TradeModal({ stock, type, walletBalance, onClose, onConfirm, loading }) {
  const [quantity, setQuantity] = useState(1);
  const isBuy = type === 'BUY';
  const total = useMemo(() => Number(stock?.price || 0) * Number(quantity || 0), [stock, quantity]);
  const hasEnoughBalance = !isBuy || walletBalance >= total;

  if (!stock) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-line bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-black uppercase ${isBuy ? 'text-rise' : 'text-fall'}`}>{type} ORDER</p>
            <h2 className="mt-1 text-2xl font-black text-ink">{stock.symbol}</h2>
            <p className="text-sm text-muted">{stock.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-line p-2 text-muted hover:text-ink" aria-label="Close trade modal">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Market price</span>
            <span className="font-black text-ink">₹{stock.price.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted"><Wallet size={16} /> Wallet balance</span>
            <span className="font-black text-ink">₹{walletBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-bold text-ink">Quantity</span>
          <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
            <Hash size={18} className="text-muted" />
            <input
              className="w-full outline-none"
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
        </label>

        <div className="mt-5 rounded-lg border border-line p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-muted">Estimated total</span>
            <span className="text-xl font-black text-ink">₹{total.toLocaleString('en-IN')}</span>
          </div>
          {!hasEnoughBalance && <p className="mt-2 text-sm font-bold text-fall">Insufficient wallet balance.</p>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="rounded-lg border border-line px-4 py-3 text-sm font-bold text-ink">Cancel</button>
          <button
            disabled={loading || !quantity || Number(quantity) <= 0 || !hasEnoughBalance}
            onClick={() => onConfirm(Number(quantity))}
            className={`rounded-lg px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60 ${isBuy ? 'bg-rise hover:bg-green-600' : 'bg-fall hover:bg-red-600'}`}
          >
            {loading ? 'Placing order...' : `Confirm ${type}`}
          </button>
        </div>
      </div>
    </div>
  );
}
