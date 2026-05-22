import { ArrowDownLeft, ArrowUpRight, BadgeIndianRupee, CreditCard, History, Landmark, RefreshCw, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import { sessionService } from '../../services/sessionService';
import { walletService } from '../../services/walletService';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const typeLabels = {
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  BUY_DEBIT: 'Buy Debit',
  SELL_CREDIT: 'Sell Credit',
};

const typeStyles = {
  DEPOSIT: 'bg-green-50 text-rise',
  WITHDRAW: 'bg-red-50 text-fall',
  BUY_DEBIT: 'bg-red-50 text-fall',
  SELL_CREDIT: 'bg-green-50 text-rise',
};

function QuickAmountButton({ value, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-bold text-ink transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      {formatMoney(value)}
    </button>
  );
}

export default function WalletPage() {
  const [wallet, setWallet] = useState({ balance: sessionService.getWalletBalance(), transactions: [] });
  const [mode, setMode] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadWallet = async () => {
    try {
      const response = await walletService.get();
      setWallet(response.data);
      sessionService.setWalletBalance(response.data.balance);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load wallet.');
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const totals = useMemo(() => {
    return (wallet.transactions || []).reduce(
      (summary, transaction) => {
        const amountValue = Number(transaction.amount || 0);
        if (amountValue > 0) {
          summary.credits += amountValue;
        } else {
          summary.debits += Math.abs(amountValue);
        }
        return summary;
      },
      { credits: 0, debits: 0 }
    );
  }, [wallet.transactions]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        amount: Number(amount),
        description: description || (mode === 'deposit' ? 'Wallet deposit' : 'Wallet withdrawal'),
      };
      const response = mode === 'deposit' ? await walletService.deposit(payload) : await walletService.withdraw(payload);
      setWallet(response.data);
      sessionService.setWalletBalance(response.data.balance);
      setAmount('');
      setDescription('');
      setMessage(mode === 'deposit' ? 'Money deposited successfully.' : 'Money withdrawn successfully.');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Wallet action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Wallet"
        subtitle="Manage balance, add or withdraw funds, and review all wallet credit and debit records."
        action={
          <button onClick={loadWallet} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
            <RefreshCw size={17} /> Refresh
          </button>
        }
      />

      {message && <p className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{message}</p>}

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Wallet Balance" value={formatMoney(wallet.balance)} change="Available cash" icon={WalletCards} />
        <MetricCard label="Total Credits" value={formatMoney(totals.credits)} change="Deposits and sells" icon={ArrowDownLeft} trend="up" />
        <MetricCard label="Total Debits" value={formatMoney(totals.debits)} change="Withdrawals and buys" icon={ArrowUpRight} trend="down" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.35fr]">
        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <BadgeIndianRupee size={21} />
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">Move Money</h2>
              <p className="text-sm text-muted">Deposit or withdraw funds from your trading wallet.</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
            {[
              { key: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
              { key: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-black transition ${
                  mode === key ? 'bg-white text-blue-700 shadow-sm' : 'text-muted'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-ink" htmlFor="walletAmount">Amount</label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-slate-50 px-3 py-3">
                <BadgeIndianRupee size={18} className="text-muted" />
                <input
                  id="walletAmount"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  placeholder="Enter amount"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[1000, 5000, 10000].map((value) => (
                <QuickAmountButton key={value} value={value} onClick={setAmount} />
              ))}
            </div>

            <div>
              <label className="text-sm font-bold text-ink" htmlFor="walletDescription">Note</label>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-line bg-slate-50 px-3 py-3">
                <CreditCard size={18} className="text-muted" />
                <input
                  id="walletDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                  placeholder="Optional description"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg px-4 py-3 text-sm font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-70 ${
                mode === 'deposit' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-slate-900 shadow-slate-900/15'
              }`}
            >
              {loading ? 'Processing...' : mode === 'deposit' ? 'Deposit Money' : 'Withdraw Money'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-black text-ink">Wallet Transaction History</h2>
              <p className="text-sm text-muted">Deposits, withdrawals, and buy/sell wallet impacts.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
              <History size={14} /> {(wallet.transactions || []).length} records
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Balance After</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {(wallet.transactions || []).length ? wallet.transactions.map((transaction) => {
                  const amountValue = Number(transaction.amount || 0);
                  return (
                    <tr key={transaction.id} className="bg-white transition hover:bg-blue-50/50">
                      <td className="px-4 py-4">
                        <span className={`rounded-md px-2 py-1 text-xs font-black ${typeStyles[transaction.transactionType] || 'bg-slate-100 text-muted'}`}>
                          {typeLabels[transaction.transactionType] || transaction.transactionType}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold text-ink">{transaction.description}</td>
                      <td className="px-4 py-4 text-muted">
                        <span className="inline-flex items-center gap-2">
                          <Landmark size={15} />
                          {transaction.referenceSymbol || transaction.referenceType || 'Wallet'}
                        </span>
                      </td>
                      <td className={`px-4 py-4 font-black ${amountValue >= 0 ? 'text-rise' : 'text-fall'}`}>
                        {amountValue >= 0 ? '+' : '-'}{formatMoney(Math.abs(amountValue))}
                      </td>
                      <td className="px-4 py-4 font-bold text-ink">{formatMoney(transaction.balanceAfter)}</td>
                      <td className="px-4 py-4 text-muted">{new Date(transaction.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td className="px-4 py-8 text-center font-semibold text-muted" colSpan="6">
                      No wallet records yet. Deposit money or place a trade to start the ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}
