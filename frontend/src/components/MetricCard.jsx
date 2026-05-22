import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function MetricCard({ label, value, change, trend = 'up', icon: Icon }) {
  const positive = trend === 'up' || String(change).startsWith('+');

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-lg border border-line bg-white p-5 shadow-sm transition-shadow hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
        </div>
        {Icon && (
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-blue-600">
            <Icon size={21} />
          </div>
        )}
      </div>
      <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${positive ? 'text-rise' : 'text-fall'}`}>
        {positive ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
        <span>{change}</span>
        <span className="font-medium text-muted">today</span>
      </div>
    </motion.div>
  );
}
