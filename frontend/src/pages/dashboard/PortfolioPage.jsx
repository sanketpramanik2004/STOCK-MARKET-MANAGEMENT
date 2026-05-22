import { BadgeIndianRupee, Bot, Gauge, PieChart, RefreshCw, ShieldAlert, Sparkles, Target, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import TradeModal from '../../components/TradeModal';
import AllocationPieChart from '../../components/charts/AllocationPieChart';
import PortfolioLineChart from '../../components/charts/PortfolioLineChart';
import { allocationData, stocks as fallbackStocks } from '../../assets/marketData';
import { portfolioService } from '../../services/portfolioService';
import { sessionService } from '../../services/sessionService';
import { tradingService } from '../../services/tradingService';
import { authService } from '../../services/authService';
import { aiAnalysisService } from '../../services/aiAnalysisService';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function parseAiJson(text) {
  if (!text) {
    return null;
  }

  const cleaned = String(text)
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (nestedError) {
        return null;
      }
    }

    return null;
  }
}

function modalStockFromHolding(holding) {
  return {
    symbol: holding.stockSymbol,
    name: holding.companyName,
    price: Number(holding.currentPrice || holding.averagePrice || 0),
  };
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [message, setMessage] = useState('');
  const [tradeModal, setTradeModal] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(sessionService.getWalletBalance());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const loadPortfolio = async () => {
    try {
      const response = await portfolioService.getMine();
      setPortfolio(response.data);
    } catch (error) {
      setMessage('Login/register and complete a buy order to build your portfolio.');
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
    loadPortfolio();
    refreshWallet();
  }, []);

  const holdings = portfolio?.holdings ?? [];
  const realizedPositions = portfolio?.realizedPositions ?? [];
  const displayAllocation = useMemo(() => {
    if (!portfolio?.sectorAllocation?.length) {
      return allocationData;
    }

    const colors = ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#ef4444'];
    return portfolio.sectorAllocation.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length],
    }));
  }, [portfolio]);

  const placeSellOrder = async (quantity) => {
    if (!tradeModal) {
      return;
    }

    setOrderLoading(true);
    try {
      const response = await tradingService.sell({
        stockSymbol: tradeModal.stock.symbol,
        quantity,
      });
      setMessage(response.data);
      setTradeModal(null);
      await loadPortfolio();
      await refreshWallet();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Sell order failed.');
    } finally {
      setOrderLoading(false);
    }
  };

  const generateAiAnalysis = async () => {
    setAiLoading(true);
    setMessage('');

    try {
      const response = await aiAnalysisService.analyzePortfolio();
      setAiAnalysis(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to generate portfolio AI analysis.');
    } finally {
      setAiLoading(false);
    }
  };

  const parsedAnalysis = useMemo(() => {
    return parseAiJson(aiAnalysis?.analysis);
  }, [aiAnalysis]);

  const rawAnalysis = aiAnalysis?.analysis && !parsedAnalysis ? String(aiAnalysis.analysis) : '';

  return (
    <>
      <PageHeader
        title="Portfolio"
        subtitle="Review holdings, allocation, profit and loss, and long-term performance."
        action={
          <button onClick={() => { loadPortfolio(); refreshWallet(); }} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            <RefreshCw size={17} /> Refresh
          </button>
        }
      />
      {message && <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</p>}
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Current Value" value={formatMoney(portfolio?.currentValue)} change={`${Number(portfolio?.profitLossPercentage || 0).toFixed(2)}%`} icon={Wallet} />
        <MetricCard label="Unrealized P/L" value={formatMoney(portfolio?.unrealizedProfitLoss)} change={`${Number(portfolio?.unrealizedProfitLossPercentage || 0).toFixed(2)}% open`} icon={TrendingUp} trend={Number(portfolio?.unrealizedProfitLoss || 0) >= 0 ? 'up' : 'down'} />
        <MetricCard label="Realized P/L" value={formatMoney(portfolio?.realizedProfitLoss)} change={`${Number(portfolio?.realizedProfitLossPercentage || 0).toFixed(2)}% sold`} icon={BadgeIndianRupee} trend={Number(portfolio?.realizedProfitLoss || 0) >= 0 ? 'up' : 'down'} />
        <MetricCard label="Total Return" value={formatMoney(portfolio?.totalReturn)} change={`${Number(portfolio?.totalReturnPercentage || 0).toFixed(2)}%`} icon={Zap} trend={Number(portfolio?.totalReturn || 0) >= 0 ? 'up' : 'down'} />
        <MetricCard label="Diversification" value={`${displayAllocation.length} sectors`} change={`${portfolio?.holdingCount || holdings.length} holdings`} icon={PieChart} />
        <MetricCard label="Wallet Balance" value={formatMoney(walletBalance)} change="+Available" icon={BadgeIndianRupee} />
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-muted">Capital Invested</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatMoney(portfolio?.investedValue)}</p>
          <p className="mt-2 text-sm leading-6 text-muted">Cost basis of currently held shares.</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-muted">Realized Sale Value</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatMoney(portfolio?.realizedSaleValue)}</p>
          <p className="mt-2 text-sm leading-6 text-muted">Cash generated from completed sell orders.</p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <p className="text-sm font-bold uppercase text-muted">Realized Cost Basis</p>
          <p className="mt-2 text-2xl font-black text-ink">{formatMoney(portfolio?.realizedCostBasis)}</p>
          <p className="mt-2 text-sm leading-6 text-muted">FIFO buy cost matched against sold shares.</p>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Allocation</h2>
          <AllocationPieChart data={displayAllocation} />
          <div className="grid gap-2">
            {displayAllocation.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-semibold text-ink"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} /> {item.name}</span>
                <span className="text-muted">{item.value}%</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Performance Graph</h2>
          <PortfolioLineChart />
        </section>
      </div>
      <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-ink">Holdings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(holdings.length ? holdings : fallbackStocks.slice(0, 3)).map((stock, index) => (
            <div key={stock.stockSymbol ?? stock.symbol} className="rounded-lg bg-slate-50 p-4">
              <p className="font-black text-ink">{stock.stockSymbol ?? stock.symbol}</p>
              <p className="mt-1 text-sm text-muted">{stock.companyName ?? stock.name}</p>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-muted">Qty</span>
                <span className="font-bold">{stock.quantity ?? (index + 2) * 4}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">Value</span>
                <span className="font-bold">{formatMoney(stock.currentValue ?? (stock.price * (index + 2) * 4))}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted">P/L</span>
                <span className={`font-bold ${Number(stock.profitLoss ?? stock.change) >= 0 ? 'text-rise' : 'text-fall'}`}>{stock.profitLoss !== undefined ? formatMoney(stock.profitLoss) : `${stock.change}%`}</span>
              </div>
              {stock.stockSymbol && (
                <button
                  onClick={() => setTradeModal({ stock: modalStockFromHolding(stock), type: 'SELL' })}
                  className="mt-4 w-full rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-fall transition hover:bg-red-100"
                >
                  Sell Shares
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-ink">Realized Profit/Loss</h2>
            <p className="mt-1 text-sm text-muted">Sold-share performance calculated using FIFO cost basis.</p>
          </div>
          <span className={`rounded-md px-3 py-1 text-sm font-black ${Number(portfolio?.realizedProfitLoss || 0) >= 0 ? 'bg-green-50 text-rise' : 'bg-red-50 text-fall'}`}>
            {formatMoney(portfolio?.realizedProfitLoss)}
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Qty Sold</th>
                <th className="px-4 py-3">Avg Buy</th>
                <th className="px-4 py-3">Avg Sell</th>
                <th className="px-4 py-3">Sale Value</th>
                <th className="px-4 py-3">Realized P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {realizedPositions.length ? realizedPositions.map((position) => (
                <tr key={position.stockSymbol} className="bg-white">
                  <td className="px-4 py-3">
                    <p className="font-black text-ink">{position.stockSymbol}</p>
                    <p className="text-xs text-muted">{position.companyName}</p>
                  </td>
                  <td className="px-4 py-3 font-bold text-ink">{position.quantitySold}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(position.averageBuyPrice)}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(position.averageSellPrice)}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(position.saleValue)}</td>
                  <td className={`px-4 py-3 font-black ${Number(position.profitLoss || 0) >= 0 ? 'text-rise' : 'text-fall'}`}>
                    {formatMoney(position.profitLoss)} <span className="text-xs">({Number(position.profitLossPercentage || 0).toFixed(2)}%)</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-6 text-center font-semibold text-muted" colSpan="6">No sell orders yet. Realized P/L appears after you sell shares.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line bg-[linear-gradient(135deg,#eff6ff,#ffffff_48%,#ecfdf5)] p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Bot size={21} />
              </div>
              <div>
                <h2 className="text-xl font-black text-ink">AI Portfolio Analysis</h2>
                <p className="text-sm text-muted">Analyze diversification, risk, overexposure, and suggested watch areas.</p>
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
                { icon: PieChart, title: 'Diversification', text: 'Detect concentration across sectors and holdings.' },
                { icon: ShieldAlert, title: 'Risk Level', text: 'Summarize portfolio risk from current exposure.' },
                { icon: Target, title: 'Next Steps', text: 'Generate watch areas and practical follow-ups.' },
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
          {rawAnalysis && (
            <div className="rounded-lg border border-line bg-slate-50 p-5">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Model: {aiAnalysis.model}</span>
                <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Educational only</span>
              </div>
              <h3 className="font-black text-ink">AI Portfolio Analysis</h3>
              <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm">
                {rawAnalysis}
              </pre>
            </div>
          )}
          {parsedAnalysis && (
            <div>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-md bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Model: {aiAnalysis.model}</span>
                  <span className={`rounded-md px-3 py-1 text-xs font-bold ${parsedAnalysis.riskLevel === 'High' ? 'bg-red-50 text-fall' : parsedAnalysis.riskLevel === 'Low' ? 'bg-green-50 text-rise' : 'bg-amber-50 text-amber-700'}`}>
                    Risk: {parsedAnalysis.riskLevel || 'Medium'}
                  </span>
                  <span className="rounded-md bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">Educational only</span>
                </div>
                <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
                  <Gauge size={14} /> Portfolio read
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-lg border border-line bg-white p-5">
                  <p className="text-sm font-bold uppercase text-blue-600">Summary</p>
                  <p className="mt-3 text-lg font-black leading-7 text-ink">{parsedAnalysis.summary}</p>
                </div>
                <div className="rounded-lg border border-line bg-white p-5">
                  <p className="text-sm font-bold uppercase text-blue-600">Return Read</p>
                  <p className="mt-3 leading-7 text-slate-700">{parsedAnalysis.returnRead || parsedAnalysis.diversification}</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-line bg-white p-5">
                <p className="text-sm font-bold uppercase text-blue-600">Diversification</p>
                <p className="mt-3 leading-7 text-slate-700">{parsedAnalysis.diversification}</p>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-line bg-red-50/40 p-5">
                  <h3 className="font-black text-ink">Overexposure</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(parsedAnalysis.overexposure || []).map((item) => (
                      <span key={item} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{item}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-green-50/40 p-5">
                  <h3 className="font-black text-ink">Strengths</h3>
                  <div className="mt-4 grid gap-2">
                    {(parsedAnalysis.strengths || []).map((item) => (
                      <div key={item} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{item}</div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-line bg-white p-5">
                  <h3 className="font-black text-ink">Watch Areas</h3>
                  <div className="mt-4 grid gap-2">
                    {(parsedAnalysis.watchAreas || []).map((item) => (
                      <div key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{item}</div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-white p-5">
                  <h3 className="font-black text-ink">Suggested Next Steps</h3>
                  <div className="mt-4 grid gap-2">
                    {(parsedAnalysis.nextSteps || []).map((item) => (
                      <div key={item} className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{item}</div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                {parsedAnalysis.disclaimer}
              </p>
            </div>
          )}
        </div>
      </section>
      <TradeModal
        stock={tradeModal?.stock}
        type={tradeModal?.type}
        walletBalance={walletBalance}
        loading={orderLoading}
        onClose={() => setTradeModal(null)}
        onConfirm={placeSellOrder}
      />
    </>
  );
}
