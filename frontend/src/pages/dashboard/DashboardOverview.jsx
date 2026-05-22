import { Activity, BadgeIndianRupee, BriefcaseBusiness, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import StockBadge from '../../components/StockBadge';
import PortfolioLineChart from '../../components/charts/PortfolioLineChart';
import { stocks as fallbackStocks, transactions as fallbackTransactions } from '../../assets/marketData';
import { portfolioService } from '../../services/portfolioService';
import { stockService } from '../../services/stockService';
import { transactionService } from '../../services/transactionService';
import { sessionService } from '../../services/sessionService';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

function normalizeStock(stock) {
  const current = Number(stock.currentPrice ?? stock.price ?? 0);
  const previous = Number(stock.previousClose ?? current);
  const change = previous > 0 ? Number((((current - previous) / previous) * 100).toFixed(2)) : Number(stock.change ?? 0);

  return {
    symbol: stock.stockSymbol ?? stock.symbol,
    name: stock.companyName ?? stock.name,
    price: current,
    change,
    sector: stock.sector ?? 'Market',
  };
}

export default function DashboardOverview() {
  const [portfolio, setPortfolio] = useState(null);
  const [stockRows, setStockRows] = useState(fallbackStocks);
  const [transactionRows, setTransactionRows] = useState(fallbackTransactions);

  useEffect(() => {
    const email = sessionService.getEmail();

    portfolioService.getByEmail(email).then((response) => setPortfolio(response.data)).catch(() => {});
    stockService.getAll().then((response) => {
      if (response.data.length) {
        setStockRows(response.data);
      }
    }).catch(() => {});
    transactionService.getByEmail(email).then((response) => setTransactionRows(response.data)).catch(() => {});
  }, []);

  const stocks = useMemo(() => stockRows.map(normalizeStock), [stockRows]);
  const transactions = transactionRows.map((txn) => ({
    id: txn.id,
    stock: txn.stockSymbol ?? txn.stock,
    type: txn.transactionType ? `${txn.transactionType.charAt(0)}${txn.transactionType.slice(1).toLowerCase()}` : txn.type,
    qty: txn.quantity ?? txn.qty,
    amount: txn.totalAmount ? `₹${Number(txn.totalAmount).toLocaleString('en-IN')}` : txn.amount,
    status: txn.status ? `${txn.status.charAt(0)}${txn.status.slice(1).toLowerCase()}` : txn.status,
  }));

  return (
    <>
      <PageHeader title="Overview Dashboard" subtitle="Track portfolio value, market momentum, watchlists, and recent activity from one command center." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Portfolio" value={formatMoney(portfolio?.currentValue)} change={`${Number(portfolio?.profitLossPercentage || 0).toFixed(2)}%`} icon={BriefcaseBusiness} />
        <MetricCard label="Total P/L" value={formatMoney(portfolio?.profitLoss)} change={`${Number(portfolio?.profitLossPercentage || 0).toFixed(2)}%`} trend={Number(portfolio?.profitLoss || 0) >= 0 ? 'up' : 'down'} icon={TrendingUp} />
        <MetricCard label="Invested Value" value={formatMoney(portfolio?.investedValue)} change="+Tracked" icon={BadgeIndianRupee} />
        <MetricCard label="Active Positions" value={portfolio?.holdings?.length ?? 0} change="+Live" icon={Activity} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_0.9fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Performance</h2>
              <p className="text-sm text-muted">Portfolio value vs monthly movement</p>
            </div>
            <span className="rounded-md bg-green-50 px-3 py-1 text-sm font-bold text-rise">Outperforming</span>
          </div>
          <PortfolioLineChart />
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Watchlist</h2>
          <div className="mt-4 space-y-3">
            {stocks.slice(0, 5).map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between rounded-lg border border-line p-3">
                <div>
                  <p className="font-bold text-ink">{stock.symbol}</p>
                  <p className="text-xs text-muted">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₹{stock.price.toLocaleString('en-IN')}</p>
                  <StockBadge value={stock.change} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Recent Transactions</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th className="py-3">Stock</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 4).map((txn) => (
                  <tr key={txn.id} className="border-b border-line last:border-0">
                    <td className="py-3 font-bold text-ink">{txn.stock}</td>
                    <td className={txn.type === 'Buy' ? 'font-bold text-rise' : 'font-bold text-fall'}>{txn.type}</td>
                    <td>{txn.qty}</td>
                    <td>{txn.amount}</td>
                    <td><span className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-rise">{txn.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Top Gainers & Losers</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="rounded-lg bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-ink">{stock.symbol}</p>
                  <StockBadge value={stock.change} />
                </div>
                <p className="mt-1 text-sm text-muted">{stock.sector}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
