import { Heart, RefreshCw, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StockBadge from '../../components/StockBadge';
import Skeleton from '../../components/Skeleton';
import TradeModal from '../../components/TradeModal';
import { authService } from '../../services/authService';
import { sessionService } from '../../services/sessionService';
import { stockService } from '../../services/stockService';
import { tradingService } from '../../services/tradingService';
import { watchlistService } from '../../services/watchlistService';

function normalizeStock(stock) {
  const current = Number(stock.currentPrice ?? stock.price ?? 0);
  const previous = Number(stock.previousClose ?? current);
  const change = Number(stock.changePercentage ?? (previous > 0 ? (((current - previous) / previous) * 100).toFixed(2) : stock.change ?? 0));

  return {
    symbol: stock.stockSymbol ?? stock.symbol,
    name: stock.companyName ?? stock.name,
    price: current,
    change,
    volume: stock.volume ? Number(stock.volume).toLocaleString('en-IN') : '2.1M',
    sector: stock.sector ?? 'Market',
    source: stock.source ?? 'DATABASE',
  };
}

export default function WatchlistPage() {
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [tradeModal, setTradeModal] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(sessionService.getWalletBalance());

  const watchlistStocks = useMemo(() => {
    const symbols = watchlist.map((item) => item.stockSymbol);
    return stocks.map(normalizeStock).filter((stock) => symbols.includes(stock.symbol));
  }, [stocks, watchlist]);

  const loadData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [stocksResponse, watchlistResponse] = await Promise.all([
        stockService.getLive(),
        watchlistService.getAll(),
      ]);
      setStocks(stocksResponse.data);
      setWatchlist(watchlistResponse.data);
      await refreshWallet();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login again to load your watchlist.');
    } finally {
      setLoading(false);
    }
  };

  const refreshWallet = async () => {
    try {
      const response = await authService.me();
      sessionService.setWalletBalance(response.data.walletBalance);
      setWalletBalance(Number(response.data.walletBalance || 0));
    } catch (error) {
      setWalletBalance(sessionService.getWalletBalance());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const removeFromWatchlist = async (stock) => {
    try {
      const response = await watchlistService.remove(stock.symbol);
      setWatchlist(watchlist.filter((item) => item.stockSymbol !== stock.symbol));
      setMessage(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to remove stock from watchlist.');
    }
  };

  const placeOrder = async (quantity) => {
    if (!tradeModal) {
      return;
    }

    setOrderLoading(true);
    try {
      const payload = {
        stockSymbol: tradeModal.stock.symbol,
        quantity,
      };
      const response = tradeModal.type === 'BUY' ? await tradingService.buy(payload) : await tradingService.sell(payload);
      setMessage(response.data);
      setTradeModal(null);
      await refreshWallet();
    } catch (error) {
      setMessage(error.response?.data?.message || `${tradeModal.type} order failed.`);
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Watchlist"
        subtitle="Track your selected stocks separately from the full market list."
        action={
          <div className="flex gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink sm:flex">
              <Wallet size={17} className="text-blue-600" /> ₹{walletBalance.toLocaleString('en-IN')}
            </div>
            <button onClick={loadData} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              <RefreshCw size={17} /> Refresh
            </button>
          </div>
        }
      />

      {message && <p className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{message}</p>}
      {loading && <div className="mb-6 grid gap-4 md:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>}

      {!loading && watchlistStocks.length === 0 ? (
        <section className="rounded-lg border border-dashed border-line bg-white p-8 text-center shadow-sm">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-red-50 text-fall">
            <Heart size={23} />
          </div>
          <h2 className="mt-4 text-xl font-black text-ink">No watchlist stocks yet</h2>
          <p className="mt-2 text-muted">Go to Stocks and click the heart icon on stocks you want to track.</p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {watchlistStocks.map((stock) => (
            <article key={stock.symbol} className="rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-ink">{stock.symbol}</h2>
                  <p className="mt-1 text-sm text-muted">{stock.name}</p>
                </div>
                <StockBadge value={stock.change} />
              </div>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase text-muted">Current price</p>
                  <p className="mt-1 text-2xl font-black text-ink">₹{stock.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-muted">{stock.volume} volume</p>
                  <p className={`mt-1 text-xs font-bold ${stock.source === 'ALPHA_VANTAGE' ? 'text-blue-600' : 'text-amber-700'}`}>
                    {stock.source === 'ALPHA_VANTAGE' ? 'Live via Alpha Vantage' : 'Saved quote'}
                  </p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-[1fr_1fr_auto] gap-3">
                <button onClick={() => setTradeModal({ stock, type: 'BUY' })} className="rounded-lg bg-rise px-4 py-2 text-sm font-bold text-white">Buy</button>
                <button onClick={() => setTradeModal({ stock, type: 'SELL' })} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-fall">Sell</button>
                <button onClick={() => removeFromWatchlist(stock)} className="rounded-lg bg-red-50 px-3 py-2 text-fall" aria-label="Remove from watchlist">
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <TradeModal
        stock={tradeModal?.stock}
        type={tradeModal?.type}
        walletBalance={walletBalance}
        loading={orderLoading}
        onClose={() => setTradeModal(null)}
        onConfirm={placeOrder}
      />
    </>
  );
}
