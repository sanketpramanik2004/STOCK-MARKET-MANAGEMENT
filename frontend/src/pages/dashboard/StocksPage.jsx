import { Heart, RefreshCw, Search, SlidersHorizontal, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StockBadge from '../../components/StockBadge';
import Skeleton from '../../components/Skeleton';
import TradeModal from '../../components/TradeModal';
import { stocks as fallbackStocks } from '../../assets/marketData';
import { stockService } from '../../services/stockService';
import { tradingService } from '../../services/tradingService';
import { sessionService } from '../../services/sessionService';
import { watchlistService } from '../../services/watchlistService';
import { authService } from '../../services/authService';

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
    latestTradingDay: stock.latestTradingDay,
  };
}

export default function StocksPage() {
  const navigate = useNavigate();
  const [stockRows, setStockRows] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [watchlist, setWatchlist] = useState([]);
  const [tradeModal, setTradeModal] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(sessionService.getWalletBalance());

  const visibleStocks = useMemo(() => {
    const normalized = stockRows.map(normalizeStock);
    if (!query.trim()) {
      return normalized;
    }

    return normalized.filter((stock) =>
      `${stock.symbol} ${stock.name} ${stock.sector}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [stockRows, query]);

  const loadStocks = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await stockService.getLive();
      setStockRows(response.data.length ? response.data : fallbackStocks);
    } catch (error) {
      setStockRows(fallbackStocks);
      setMessage('Live API not reachable or Alpha Vantage limit hit, showing fallback stocks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
    loadWatchlist();
    refreshWallet();
  }, []);

  const loadWatchlist = async () => {
    try {
      const response = await watchlistService.getAll();
      setWatchlist(response.data.map((item) => item.stockSymbol));
    } catch (error) {
      setWatchlist([]);
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

  const seedStocks = async () => {
    try {
      const response = await stockService.addSamples();
      setMessage(response.data);
      await loadStocks();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to add sample stocks.');
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
      setMessage(error.response?.data?.message || `${tradeModal.type} order failed. Login/register first, then try again.`);
    } finally {
      setOrderLoading(false);
    }
  };

  const toggleWatchlist = async (stock) => {
    try {
      if (watchlist.includes(stock.symbol)) {
        const response = await watchlistService.remove(stock.symbol);
        setWatchlist(watchlist.filter((symbol) => symbol !== stock.symbol));
        setMessage(response.data);
      } else {
        const response = await watchlistService.add(stock.symbol);
        setWatchlist([...watchlist, stock.symbol]);
        setMessage(response.data);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login/register first to manage your watchlist.');
    }
  };

  const stopCardNavigation = (event) => {
    event.stopPropagation();
  };

  return (
    <>
      <PageHeader
        title="Stocks"
        subtitle="Search, compare, and act on market opportunities with responsive stock cards and trade actions."
        action={
          <div className="flex gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink sm:flex">
              <Wallet size={17} className="text-blue-600" /> ₹{walletBalance.toLocaleString('en-IN')}
            </div>
            <button onClick={loadStocks} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"><RefreshCw size={17} /> Refresh Live</button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink"><SlidersHorizontal size={17} /> Filters</button>
          </div>
        }
      />
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-sm">
        <Search className="text-muted" size={19} />
        <input className="w-full outline-none" placeholder="Search by company, symbol, or sector" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {message && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800 sm:flex-row sm:items-center sm:justify-between">
          <span>{message}</span>
          <button onClick={seedStocks} className="rounded-md bg-blue-600 px-3 py-2 text-white">Add sample stocks</button>
        </div>
      )}
      {loading && <div className="mb-6 grid gap-4 md:grid-cols-3"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleStocks.map((stock) => (
          <article
            key={stock.symbol}
            onClick={() => navigate(`/dashboard/stocks/${stock.symbol}`)}
            className="cursor-pointer rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-ink">{stock.symbol}</h2>
                <p className="mt-1 text-sm text-muted">{stock.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(event) => { stopCardNavigation(event); toggleWatchlist(stock); }} className={`rounded-lg p-2 ${watchlist.includes(stock.symbol) ? 'bg-red-50 text-fall' : 'bg-slate-50 text-muted'}`} aria-label="Toggle watchlist">
                  <Heart size={17} fill={watchlist.includes(stock.symbol) ? 'currentColor' : 'none'} />
                </button>
                <StockBadge value={stock.change} />
              </div>
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
            <div className="mt-5 grid grid-cols-2 gap-3" onClick={stopCardNavigation}>
              <button onClick={() => setTradeModal({ stock, type: 'BUY' })} className="rounded-lg bg-rise px-4 py-2 text-sm font-bold text-white transition hover:bg-green-600">Buy</button>
              <button onClick={() => setTradeModal({ stock, type: 'SELL' })} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-fall transition hover:bg-red-100">Sell</button>
            </div>
          </article>
        ))}
      </div>
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
