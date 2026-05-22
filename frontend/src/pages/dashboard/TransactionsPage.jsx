import { ArrowDownLeft, ArrowUpRight, CalendarClock, ChevronLeft, ChevronRight, Download, Filter, Hash, IndianRupee, Package, ReceiptText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import { transactions as fallbackTransactions } from '../../assets/marketData';
import { transactionService } from '../../services/transactionService';

const statusClass = {
  Completed: 'bg-green-50 text-rise',
  Pending: 'bg-amber-50 text-amber-700',
  Failed: 'bg-red-50 text-fall',
};

const formatMoney = (value) => {
  if (typeof value === 'string') {
    return value;
  }

  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const titleCase = (value) => {
  if (!value) {
    return '';
  }

  const normalized = String(value).toLowerCase();
  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

const parseAmount = (amount) => Number(String(amount || 0).replace(/[₹,\s]/g, '')) || 0;

function normalizeTransaction(txn) {
  const type = titleCase(txn.transactionType ?? txn.type);
  const rawAmount = txn.totalAmount ?? txn.amount;
  const totalAmount = typeof rawAmount === 'string' ? parseAmount(rawAmount) : Number(rawAmount || 0);
  const quantity = Number(txn.quantity ?? txn.qty ?? 0);
  const price = txn.price ?? (quantity > 0 && totalAmount > 0 ? totalAmount / quantity : 0);
  const stockSymbol = txn.stockSymbol ?? txn.stock;

  return {
    id: typeof txn.id === 'number' ? `TXN-${txn.id}` : txn.id,
    stock: stockSymbol,
    companyName: txn.companyName ?? stockSymbol,
    type,
    qty: quantity,
    price,
    totalAmount,
    amountLabel: formatMoney(rawAmount),
    status: titleCase(txn.status) || 'Completed',
    date: txn.transactionDate ? new Date(txn.transactionDate).toLocaleString('en-IN') : txn.date,
    timestamp: txn.transactionDate ?? txn.date,
    walletImpact: type === 'Buy' ? -totalAmount : totalAmount,
  };
}

function DetailItem({ icon: Icon, label, value, accent = false }) {
  return (
    <div className="rounded-lg border border-line bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted">
        <Icon size={15} className={accent ? 'text-blue-600' : ''} />
        {label}
      </div>
      <p className="mt-2 break-words text-lg font-black text-ink">{value}</p>
    </div>
  );
}

function TransactionDetailModal({ transaction, onClose }) {
  if (!transaction) {
    return null;
  }

  const isBuy = transaction.type === 'Buy';
  const impactClass = transaction.walletImpact < 0 ? 'text-fall bg-red-50' : 'text-rise bg-green-50';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(135deg,#eff6ff,#ffffff_50%,#ecfdf5)] p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-black ${isBuy ? 'bg-green-50 text-rise' : 'bg-red-50 text-fall'}`}>
                {isBuy ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                {transaction.type} Order
              </span>
              <span className={`rounded-md px-3 py-1 text-xs font-bold ${statusClass[transaction.status] || 'bg-slate-100 text-muted'}`}>
                {transaction.status}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-ink">{transaction.stock}</h2>
            <p className="mt-1 text-sm font-semibold text-muted">{transaction.companyName}</p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-line bg-white p-2 text-muted transition hover:text-ink" aria-label="Close transaction details">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <DetailItem icon={Hash} label="Transaction ID" value={transaction.id} accent />
            <DetailItem icon={Package} label="Quantity" value={transaction.qty} />
            <DetailItem icon={IndianRupee} label="Price" value={formatMoney(transaction.price)} />
            <DetailItem icon={ReceiptText} label="Total Amount" value={formatMoney(transaction.totalAmount)} accent />
            <DetailItem icon={CalendarClock} label="Timestamp" value={transaction.date} />
            <div className={`rounded-lg border border-line p-4 ${impactClass}`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase">
                {transaction.walletImpact < 0 ? <ArrowUpRight size={15} /> : <ArrowDownLeft size={15} />}
                Wallet Impact
              </div>
              <p className="mt-2 text-lg font-black">
                {transaction.walletImpact < 0 ? '-' : '+'}{formatMoney(Math.abs(transaction.walletImpact))}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-muted">
            {isBuy
              ? 'This buy order reduced wallet balance and added shares to portfolio holdings.'
              : 'This sell order increased wallet balance and reduced shares from portfolio holdings.'}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await transactionService.getMine();
        setRows(response.data);
      } catch (error) {
        setRows(fallbackTransactions);
        setMessage('Backend not reachable, showing demo transactions.');
      }
    };

    loadTransactions();
  }, []);

  const transactions = rows.map(normalizeTransaction).filter((txn) => filter === 'All' || txn.type === filter);

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Filter and review order history with clean status badges and pagination controls."
        action={<button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white"><Download size={17} /> Export</button>}
      />
      {message && <p className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{message}</p>}
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {['All', 'Buy', 'Sell'].map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`rounded-lg px-4 py-2 text-sm font-bold ${filter === item ? 'bg-blue-600 text-white' : 'bg-slate-100 text-muted'}`}>{item}</button>
            ))}
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-bold text-ink"><Filter size={17} /> More filters</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-muted">
              <tr>
                <th className="rounded-l-lg px-4 py-3">Transaction ID</th>
                <th>Stock</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="rounded-r-lg">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTransaction(txn)}
                  className="cursor-pointer border-b border-line transition hover:bg-blue-50/60 last:border-0"
                >
                  <td className="px-4 py-4 font-bold text-ink">{txn.id}</td>
                  <td>{txn.stock}</td>
                  <td className={txn.type === 'Buy' ? 'font-bold text-rise' : 'font-bold text-fall'}>{txn.type}</td>
                  <td>{txn.qty}</td>
                  <td>{txn.amountLabel}</td>
                  <td>{txn.date}</td>
                  <td><span className={`rounded-md px-2 py-1 text-xs font-bold ${statusClass[txn.status]}`}>{txn.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted">Showing 1-5 of 42 transactions</p>
          <div className="flex gap-2">
            <button className="rounded-lg border border-line p-2 text-muted"><ChevronLeft size={18} /></button>
            <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white">1</button>
            <button className="rounded-lg border border-line p-2 text-muted"><ChevronRight size={18} /></button>
          </div>
        </div>
      </section>
      <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
    </>
  );
}
