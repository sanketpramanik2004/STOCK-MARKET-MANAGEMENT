import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function buildSeries(price, change) {
  const currentPrice = Number(price || 0);
  const changeValue = Number(change || 0);
  const seed = currentPrice || 100;
  const points = ['09:15', '10:00', '11:00', '12:00', '13:00', '14:00', '15:30'];

  return points.map((time, index) => {
    const wave = Math.sin(index * 1.1) * seed * 0.008;
    const drift = ((index - 3) / 8) * changeValue * seed * 0.01;
    return {
      time,
      price: Math.max(seed + wave + drift, 1).toFixed(2),
    };
  });
}

export default function StockPriceChart({ price, change }) {
  const data = buildSeries(price, change);
  const positive = Number(change) >= 0;
  const stroke = positive ? '#16a34a' : '#dc2626';
  const gradientId = positive ? 'stockRiseGradient' : 'stockFallGradient';

  return (
    <ResponsiveContainer width="100%" height={330}>
      <AreaChart data={data} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#667085', fontSize: 12 }} domain={['dataMin - 20', 'dataMax + 20']} />
        <Tooltip
          contentStyle={{ border: '1px solid #e4e7ec', borderRadius: 8, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)' }}
          formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Price']}
        />
        <Area type="monotone" dataKey="price" stroke={stroke} strokeWidth={3} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
