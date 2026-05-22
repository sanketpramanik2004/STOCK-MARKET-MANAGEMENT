import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { candles } from '../../assets/marketData';

export default function MarketBarChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={candles} margin={{ left: 0, right: 8, top: 16, bottom: 0 }}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
        <Tooltip contentStyle={{ border: '1px solid #e4e7ec', borderRadius: 8 }} />
        <Bar dataKey="low" stackId="range" fill="transparent" />
        <Bar dataKey="high" stackId="range" fill="#dbeafe" radius={[8, 8, 0, 0]} />
        <Bar dataKey="close" fill="#2563eb" radius={[8, 8, 0, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
