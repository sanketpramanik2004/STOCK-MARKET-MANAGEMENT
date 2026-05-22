import { ArrowLeft, Bot, Building2, ExternalLink, Gauge, Heart, Newspaper, RefreshCw, ShieldAlert, ShieldCheck, Sparkles, Target, Wallet, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StockBadge from '../../components/StockBadge';
import TradeModal from '../../components/TradeModal';
import StockPriceChart from '../../components/charts/StockPriceChart';
import { authService } from '../../services/authService';
import { aiAnalysisService } from '../../services/aiAnalysisService';
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
    previousClose: previous,
    absoluteChange: Number(stock.change ?? current - previous),
    change,
    volume: stock.volume ? Number(stock.volume).toLocaleString('en-IN') : '2.1M',
    sector: stock.sector ?? 'Market',
    source: stock.source ?? 'DATABASE',
    latestTradingDay: stock.latestTradingDay,
    trend: stock.marketTrend ?? (change >= 0 ? 'UP' : 'DOWN'),
  };
}

function formatNewsDate(value) {
  if (!value || value.length < 8) {
    return 'Latest';
  }

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11) || '00';
  const minute = value.slice(11, 13) || '00';
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`);

  if (Number.isNaN(date.getTime())) {
    return 'Latest';
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [tradeModal, setTradeModal] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(sessionService.getWalletBalance());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsMessage, setNewsMessage] = useState('');

  const isInWatchlist = useMemo(() => watchlist.includes(symbol?.toUpperCase()), [watchlist, symbol]);

  const loadStock = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await stockService.getLiveBySymbol(symbol);
      setStock(normalizeStock(response.data));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load stock details.');
    } finally {
      setLoading(false);
    }
  };

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

  const loadNews = async () => {
    if (!symbol) {
      return;
    }

    setNewsLoading(true);
    setNewsMessage('');

    try {
      const response = await stockService.getNews(symbol);
      setNews(response.data || []);
      if (!response.data?.length) {
        setNewsMessage('No live news articles were returned for this stock right now.');
      }
    } catch (error) {
      setNews([]);
      setNewsMessage(error.response?.data?.message || 'Unable to load OpenAI market news. Please check your login session or OpenAI API key.');
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    loadStock();
    loadWatchlist();
    refreshWallet();
    loadNews();
  }, [symbol]);

  const toggleWatchlist = async () => {
    if (!stock) {
      return;
    }

    try {
      if (isInWatchlist) {
        const response = await watchlistService.remove(stock.symbol);
        setWatchlist(watchlist.filter((item) => item !== stock.symbol));
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

  const generateAiAnalysis = async () => {
    if (!stock) {
      return;
    }

    setAiLoading(true);
    setMessage('');

    try {
      const response = await aiAnalysisService.analyzeStock(stock.symbol);
      setAiAnalysis(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate AI analysis. Check your OpenAI API key and login session.');
    } finally {
      setAiLoading(false);
    }
  };

  const analysisLines = aiAnalysis?.analysis
    ? aiAnalysis.analysis.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];

  const parsedAnalysis = useMemo(() => {
    if (!aiAnalysis?.analysis) {
      return null;
    }

    try {
      return JSON.parse(aiAnalysis.analysis);
    } catch (error) {
      return null;
    }
  }, [aiAnalysis]);

  return (
    <>
      <PageHeader
        title={stock ? `${stock.symbol} Details` : 'Stock Details'}
        subtitle="Inspect price action, quote source, company context, and trade directly from one place."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/dashboard/stocks')} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink">
              <ArrowLeft size={17} /> Back
            </button>
            <button onClick={loadStock} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              <RefreshCw size={17} /> Refresh
            </button>
          </div>
        }
      />

      {message && <p className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{message}</p>}

      {loading ? (
        <div className="rounded-lg border border-line bg-white p-6 text-muted shadow-sm">Loading stock details...</div>
      ) : stock ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-ink">{stock.symbol}</h2>
                    <StockBadge value={stock.change} />
                  </div>
                  <p className="mt-1 text-muted">{stock.name}</p>
                </div>
                <button onClick={toggleWatchlist} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${isInWatchlist ? 'bg-red-50 text-fall' : 'bg-slate-100 text-ink'}`}>
                  <Heart size={17} fill={isInWatchlist ? 'currentColor' : 'none'} /> {isInWatchlist ? 'In Watchlist' : 'Add Watchlist'}
                </button>
              </div>
              <StockPriceChart price={stock.price} change={stock.change} />
            </div>

            <aside className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <p className="text-sm font-bold uppercase text-muted">Current price</p>
              <p className="mt-2 text-4xl font-black text-ink">₹{stock.price.toLocaleString('en-IN')}</p>
              <p className={stock.change >= 0 ? 'mt-2 text-sm font-bold text-rise' : 'mt-2 text-sm font-bold text-fall'}>
                {stock.absoluteChange >= 0 ? '+' : ''}{stock.absoluteChange.toFixed(2)} ({stock.change >= 0 ? '+' : ''}{stock.change}%)
              </p>

              <div className="mt-6 grid gap-3">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="text-muted">Previous close</span>
                  <span className="font-bold text-ink">₹{stock.previousClose.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="text-muted">Volume</span>
                  <span className="font-bold text-ink">{stock.volume}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="text-muted">Sector</span>
                  <span className="font-bold text-ink">{stock.sector}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="text-muted">Source</span>
                  <span className={stock.source === 'ALPHA_VANTAGE' ? 'font-bold text-blue-600' : 'font-bold text-amber-700'}>{stock.source === 'ALPHA_VANTAGE' ? 'Alpha Vantage' : 'Saved quote'}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 text-sm">
                  <span className="flex items-center gap-2 text-muted"><Wallet size={16} /> Wallet</span>
                  <span className="font-bold text-ink">₹{walletBalance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button onClick={() => setTradeModal({ stock, type: 'BUY' })} className="rounded-lg bg-rise px-4 py-3 text-sm font-bold text-white">Buy</button>
                <button onClick={() => setTradeModal({ stock, type: 'SELL' })} className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-fall">Sell</button>
              </div>
            </aside>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-line bg-slate-50 p-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white">
                  <Newspaper size={21} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink">Live Stock News</h2>
                  <p className="text-sm text-muted">OpenAI web search results for {stock.symbol} and related market coverage.</p>
                </div>
              </div>
              <button onClick={loadNews} disabled={newsLoading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink transition hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                <RefreshCw size={17} /> {newsLoading ? 'Loading...' : 'Refresh News'}
              </button>
            </div>

            <div className="p-5">
              {newsLoading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="rounded-lg border border-line p-4">
                      <div className="h-28 animate-pulse rounded-lg bg-slate-100" />
                      <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                      <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {!newsLoading && newsMessage && (
                <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{newsMessage}</p>
              )}

              {!newsLoading && news.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {news.map((item) => {
                    const sentiment = item.sentimentLabel || 'Neutral';
                    const sentimentClass = sentiment.toLowerCase().includes('bull')
                      ? 'bg-green-50 text-rise'
                      : sentiment.toLowerCase().includes('bear')
                        ? 'bg-red-50 text-fall'
                        : 'bg-slate-100 text-muted';

                    return (
                      <a
                        key={`${item.url}-${item.publishedAt}`}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex min-h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                      >
                        {item.bannerImage ? (
                          <img src={item.bannerImage} alt="" className="h-32 w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="grid h-32 place-items-center bg-[linear-gradient(135deg,#eff6ff,#f8fafc)] text-blue-600">
                            <Newspaper size={30} />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-4">
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-xs font-bold uppercase text-blue-600">{item.source || item.sourceDomain || 'Market News'}</span>
                            <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-black ${sentimentClass}`}>{sentiment}</span>
                          </div>
                          <h3 className="mt-3 line-clamp-3 text-base font-black leading-6 text-ink group-hover:text-blue-600">{item.title}</h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{item.summary}</p>
                          <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-xs font-bold text-muted">
                            <span>{formatNewsDate(item.publishedAt)}</span>
                            <span className="inline-flex items-center gap-1 text-blue-600">
                              Read <ExternalLink size={13} />
                            </span>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
            <div className="border-b border-line bg-[linear-gradient(135deg,#eff6ff,#ffffff_48%,#ecfdf5)] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <Bot size={21} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-ink">AI Market Brief</h2>
                    <p className="text-sm text-muted">Structured analysis from quote, trend, sector, and volume context.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={generateAiAnalysis}
                disabled={aiLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={17} /> {aiLoading ? 'Analyzing...' : aiAnalysis ? 'Regenerate' : 'Generate Analysis'}
              </button>
            </div>
            </div>

            <div className="p-5">
              {!aiAnalysis && !aiLoading && (
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    { icon: Zap, title: 'Momentum', text: 'AI reads price movement and trend direction.' },
                    { icon: ShieldAlert, title: 'Risk Scan', text: 'Highlights practical risks to monitor.' },
                    { icon: Target, title: 'Watch Next', text: 'Turns raw quote data into next-step signals.' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="rounded-lg border border-line bg-slate-50 p-4">
                      <Icon className="text-blue-600" size={22} />
                      <h3 className="mt-3 font-black text-ink">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                    </div>
                  ))}
                </div>
              )}
              {aiLoading && (
                <div className="space-y-3">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                </div>
              )}
              {aiAnalysis && parsedAnalysis && (
                <div>
                  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Model: {aiAnalysis.model}</span>
                      <span className={`rounded-md px-3 py-1 text-xs font-bold ${parsedAnalysis.sentiment === 'Bullish' ? 'bg-green-50 text-rise' : parsedAnalysis.sentiment === 'Bearish' ? 'bg-red-50 text-fall' : 'bg-slate-100 text-muted'}`}>
                        {parsedAnalysis.sentiment || 'Neutral'}
                      </span>
                      <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Educational only</span>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                      <Gauge size={14} /> Confidence: {parsedAnalysis.confidence || 'Medium'}
                    </span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                    <div className="rounded-lg border border-line bg-white p-5">
                      <p className="text-sm font-bold uppercase text-blue-600">Market Summary</p>
                      <p className="mt-3 text-lg font-black leading-7 text-ink">{parsedAnalysis.summary}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-white p-5">
                      <p className="text-sm font-bold uppercase text-blue-600">Momentum Read</p>
                      <p className="mt-3 leading-7 text-slate-700">{parsedAnalysis.momentum}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-line bg-red-50/40 p-5">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="text-fall" size={20} />
                        <h3 className="font-black text-ink">Risk Factors</h3>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(parsedAnalysis.risks || []).map((risk) => (
                          <span key={risk} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{risk}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border border-line bg-green-50/40 p-5">
                      <div className="flex items-center gap-2">
                        <Target className="text-rise" size={20} />
                        <h3 className="font-black text-ink">Watch Next</h3>
                      </div>
                      <div className="mt-4 grid gap-2">
                        {(parsedAnalysis.watchNext || []).map((signal) => (
                          <div key={signal} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{signal}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                    {parsedAnalysis.disclaimer}
                  </p>
                </div>
              )}
              {aiAnalysis && !parsedAnalysis && (
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-blue-700">Model: {aiAnalysis.model}</p>
                    <p className="rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Educational only</p>
                  </div>
                  <div className="space-y-3 rounded-lg bg-slate-50 p-4">
                    {analysisLines.map((line, index) => (
                      <p key={`${line}-${index}`} className="leading-7 text-slate-700">{line.replaceAll('#', '').replaceAll('*', '')}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { icon: Building2, title: 'Company', text: stock.name },
              { icon: ShieldCheck, title: 'Trend', text: stock.trend },
              { icon: Wallet, title: 'Latest trading day', text: stock.latestTradingDay === 'Database fallback' ? 'Last saved quote' : stock.latestTradingDay || 'Not available' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-lg border border-line bg-white p-5 shadow-sm">
                <Icon className="text-blue-600" size={22} />
                <p className="mt-4 text-sm font-bold uppercase text-muted">{title}</p>
                <p className="mt-1 font-black text-ink">{text}</p>
              </div>
            ))}
          </section>
        </>
      ) : (
        <div className="rounded-lg border border-line bg-white p-6 text-muted shadow-sm">Stock not found.</div>
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
