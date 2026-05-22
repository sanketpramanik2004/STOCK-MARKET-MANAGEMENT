import { TrendingUp } from 'lucide-react';

export default function Logo({ light = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/25">
        <TrendingUp size={22} />
      </div>
      <div>
        <p className={`text-lg font-bold leading-5 ${light ? 'text-white' : 'text-ink'}`}>StockPulse</p>
        <p className={`text-xs ${light ? 'text-blue-100' : 'text-muted'}`}>Market Management</p>
      </div>
    </div>
  );
}
