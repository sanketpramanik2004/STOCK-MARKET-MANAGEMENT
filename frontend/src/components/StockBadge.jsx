import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function StockBadge({ value }) {
  const positive = Number(value) >= 0;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${positive ? 'bg-green-50 text-rise' : 'bg-red-50 text-fall'}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {positive ? '+' : ''}{value}%
    </span>
  );
}
