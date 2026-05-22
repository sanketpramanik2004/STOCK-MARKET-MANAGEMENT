import { Activity, BarChart3, Globe2, Radar } from 'lucide-react';
import { useEffect, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import MarketBarChart from '../../components/charts/MarketBarChart';
import PortfolioLineChart from '../../components/charts/PortfolioLineChart';
import { marketService } from '../../services/marketService';

export default function MarketAnalysisPage() {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    marketService.getAnalysis().then((response) => setAnalysis(response.data)).catch(() => {});
  }, []);

  const totalStocks = analysis?.totalStocks || 0;
  const gainers = analysis?.gainers || 0;
  const breadth = totalStocks ? `${Math.round((gainers / totalStocks) * 100)}% bullish` : '64% bullish';
  const mood = analysis?.marketMood || 'BULLISH';

  return (
    <>
      <PageHeader title="Market Analysis" subtitle="Interactive market visuals, sentiment widgets, and candlestick-style range analysis." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Market Breadth" value={breadth} change={`${gainers} gainers`} icon={Activity} />
        <MetricCard label="Volatility" value="12.8 VIX" change="-1.4%" trend="down" icon={Radar} />
        <MetricCard label="Market Mood" value={mood} change="+Live" icon={Globe2} />
        <MetricCard label="Tracked Stocks" value={totalStocks || 6} change={`${analysis?.losers ?? 2} losers`} icon={BarChart3} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Index Trend</h2>
          <PortfolioLineChart />
        </section>
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Candlestick-Style Range</h2>
          <MarketBarChart />
        </section>
      </div>
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {(analysis?.movers?.length ? analysis.movers.slice(0, 3).map((stock) => `${stock.stockSymbol} ${Number(stock.changePercentage) >= 0 ? 'leading momentum' : 'under pressure'}`) : ['IT and auto leading momentum', 'Banking consolidating near support', 'Energy shows steady accumulation']).map((text) => (
          <div key={text} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <p className="text-sm font-bold uppercase text-blue-600">Market Signal</p>
            <p className="mt-3 text-lg font-bold text-ink">{text}</p>
            <p className="mt-2 text-sm leading-6 text-muted">Realtime-ready widget styling for future API or websocket feeds.</p>
          </div>
        ))}
      </section>
    </>
  );
}
