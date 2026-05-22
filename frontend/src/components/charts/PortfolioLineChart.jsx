import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { performanceData } from '../../assets/marketData';

export default function PortfolioLineChart({ compact = false }) {
  return (
    <ResponsiveContainer width="100%" height={compact ? 240 : 320}>
      <AreaChart data={performanceData} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.32} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip
          contentStyle={{ border: '1px solid #e4e7ec', borderRadius: 8, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)' }}
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']}
        />
        <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} fill="url(#portfolioGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
