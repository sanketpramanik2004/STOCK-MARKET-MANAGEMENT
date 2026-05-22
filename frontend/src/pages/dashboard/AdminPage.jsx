import { Activity, BadgeIndianRupee, Database, Edit3, Plus, RefreshCw, Save, ShieldCheck, Trash2, Users, X, ReceiptText, ChartCandlestick } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import PageHeader from '../../components/PageHeader';
import { adminService } from '../../services/adminService';
import { sessionService } from '../../services/sessionService';

const emptyForm = {
  stockSymbol: '',
  companyName: '',
  currentPrice: '',
  previousClose: '',
  marketTrend: 'UP',
  sector: '',
  volume: '',
};

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function toPayload(form) {
  return {
    stockSymbol: form.stockSymbol,
    companyName: form.companyName,
    currentPrice: Number(form.currentPrice),
    previousClose: form.previousClose ? Number(form.previousClose) : Number(form.currentPrice),
    marketTrend: form.marketTrend,
    sector: form.sector,
    volume: form.volume ? Number(form.volume) : 0,
  };
}

const sectionTitles = {
  overview: ['Admin Overview', 'Monitor users, stocks, transactions, and market maintenance from one place.'],
  stocks: ['Stock Manager', 'Add, edit, delete, and seed stocks for the trading platform.'],
  prices: ['Price Updates', 'Update stock prices manually for demos and controlled market scenarios.'],
  users: ['User Management', 'Review registered users and wallet balances.'],
  transactions: ['Transaction Audit', 'Review buy and sell activity across all users.'],
};

export default function AdminPage({ section = 'overview' }) {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [priceUpdates, setPriceUpdates] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = sessionService.isAdmin();
  const showOverview = section === 'overview';
  const showStockManager = section === 'stocks';
  const showPriceUpdates = section === 'prices';
  const stockTableMode = section === 'prices' ? 'prices' : 'manager';
  const showUsers = section === 'users';
  const showTransactions = section === 'transactions';
  const [pageTitle, pageSubtitle] = sectionTitles[section] || sectionTitles.overview;

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const [stocksResponse, usersResponse, transactionsResponse] = await Promise.all([
        adminService.getStocks(),
        adminService.getUsers(),
        adminService.getTransactions(),
      ]);
      setStocks(stocksResponse.data);
      setUsers(usersResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load admin data. Login with admin account.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const stats = useMemo(() => ({
    users: users.length,
    stocks: stocks.length,
    transactions: transactions.length,
    admins: users.filter((user) => user.role === 'ADMIN').length,
    walletBalance: users.reduce((total, user) => total + Number(user.walletBalance || 0), 0),
    sectors: new Set(stocks.map((stock) => stock.sector).filter(Boolean)).size,
    buyOrders: transactions.filter((transaction) => transaction.transactionType === 'BUY').length,
    sellOrders: transactions.filter((transaction) => transaction.transactionType === 'SELL').length,
  }), [users, stocks, transactions]);

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (stock) => {
    setEditingId(stock.id);
    setForm({
      stockSymbol: stock.stockSymbol || '',
      companyName: stock.companyName || '',
      currentPrice: stock.currentPrice || '',
      previousClose: stock.previousClose || '',
      marketTrend: stock.marketTrend || 'UP',
      sector: stock.sector || '',
      volume: stock.volume || '',
    });
  };

  const saveStock = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      if (editingId) {
        await adminService.updateStock(editingId, toPayload(form));
        setMessage('Stock updated successfully.');
      } else {
        await adminService.addStock(toPayload(form));
        setMessage('Stock added successfully.');
      }
      resetForm();
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save stock.');
    }
  };

  const updatePrice = async (stock) => {
    const nextPrice = Number(priceUpdates[stock.id]);
    if (!nextPrice) {
      setMessage('Enter a valid price first.');
      return;
    }

    try {
      await adminService.updateStockPrice(stock.id, nextPrice);
      setPriceUpdates({ ...priceUpdates, [stock.id]: '' });
      setMessage(`${stock.stockSymbol} price updated.`);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update price.');
    }
  };

  const deleteStock = async (stock) => {
    try {
      await adminService.deleteStock(stock.id);
      setMessage(`${stock.stockSymbol} deleted.`);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to delete stock.');
    }
  };

  const seedThirtyStocks = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await adminService.seedThirtyStocks();
      setMessage(response.data);
      await loadAdminData();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to seed admin stocks.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Admin Panel" subtitle="Admin access is required for this section." />
        <section className="rounded-lg border border-line bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto text-blue-600" size={42} />
          <h2 className="mt-4 text-2xl font-black text-ink">Login as admin</h2>
          <p className="mt-2 text-muted">Use the demo admin account to manage stocks, users, transactions, and manual prices.</p>
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-ink">admin@stockpulse.com / admin123</p>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
        action={
          <div className="flex flex-wrap gap-2">
            {section === 'stocks' && <button onClick={seedThirtyStocks} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              <Database size={17} /> Add 30 Stocks
            </button>}
            <button onClick={loadAdminData} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">
              <RefreshCw size={17} /> {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        }
      />

      {message && <p className="mb-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">{message}</p>}

      {showOverview && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard label="Total Users" value={stats.users} change="+Managed" icon={Users} />
            <MetricCard label="Wallet Exposure" value={formatMoney(stats.walletBalance)} change="+Tracked" icon={BadgeIndianRupee} />
            <MetricCard label="Listed Stocks" value={stats.stocks} change={`${stats.sectors} sectors`} icon={ChartCandlestick} />
            <MetricCard label="Order Activity" value={stats.transactions} change={`${stats.buyOrders} buy / ${stats.sellOrders} sell`} icon={ReceiptText} />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-ink">Operations Snapshot</h2>
                  <p className="mt-1 text-sm text-muted">Quick health view for admin demo and platform control.</p>
                </div>
                <span className="rounded-md bg-green-50 px-3 py-1 text-xs font-black text-rise">System online</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Stock coverage', value: `${stats.stocks} instruments`, icon: Database },
                  { label: 'User wallet access', value: formatMoney(stats.walletBalance), icon: BadgeIndianRupee },
                  { label: 'Admin accounts', value: stats.admins, icon: ShieldCheck },
                  { label: 'Trade audit records', value: stats.transactions, icon: Activity },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-4">
                    <Icon className="text-blue-600" size={20} />
                    <p className="mt-3 text-xs font-bold uppercase text-muted">{label}</p>
                    <p className="mt-1 text-lg font-black text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-ink">Recent Transactions</h2>
              <div className="mt-4 grid gap-3">
                {transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3">
                    <div>
                      <p className="font-black text-ink">{transaction.stockSymbol}</p>
                      <p className="text-xs text-muted">{transaction.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className={transaction.transactionType === 'BUY' ? 'font-black text-rise' : 'font-black text-fall'}>{transaction.transactionType}</p>
                      <p className="text-xs font-bold text-muted">{formatMoney(transaction.totalAmount)}</p>
                    </div>
                  </div>
                ))}
                {!transactions.length && <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-muted">No transactions yet.</p>}
              </div>
            </section>
          </div>
        </>
      )}

      {showStockManager && <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-ink">{editingId ? 'Edit Stock' : 'Add Stock'}</h2>
            <p className="text-sm text-muted">Create or update stock records used by trading screens.</p>
          </div>
          {editingId && (
            <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink">
              <X size={16} /> Cancel
            </button>
          )}
        </div>
        <form onSubmit={saveStock} className="grid gap-3 md:grid-cols-4">
          {[
            ['stockSymbol', 'Symbol'],
            ['companyName', 'Company'],
            ['currentPrice', 'Current Price'],
            ['previousClose', 'Previous Close'],
            ['sector', 'Sector'],
            ['volume', 'Volume'],
          ].map(([field, label]) => (
            <input
              key={field}
              type={field.includes('Price') || field === 'volume' ? 'number' : 'text'}
              value={form[field]}
              onChange={(event) => updateField(field, event.target.value)}
              placeholder={label}
              className="rounded-lg border border-line px-3 py-3 text-sm font-semibold outline-none focus:border-blue-500"
              required={['stockSymbol', 'companyName', 'currentPrice'].includes(field)}
            />
          ))}
          <select value={form.marketTrend} onChange={(event) => updateField('marketTrend', event.target.value)} className="rounded-lg border border-line px-3 py-3 text-sm font-semibold outline-none">
            <option value="UP">UP</option>
            <option value="DOWN">DOWN</option>
            <option value="FLAT">FLAT</option>
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-black text-white">
            {editingId ? <Save size={17} /> : <Plus size={17} />} {editingId ? 'Save Changes' : 'Add Stock'}
          </button>
        </form>
      </section>}

      {(showStockManager || showPriceUpdates) && <section className="mt-6 rounded-lg border border-line bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black text-ink">{section === 'prices' ? 'Manual Price Updates' : 'Stock Records'}</h2>
        <p className="mt-1 text-sm text-muted">
          {section === 'prices'
            ? 'Change only the current price. Previous close and trend update automatically.'
            : 'Edit or delete stocks from the trading universe.'}
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-line">
          <table className={`w-full text-left text-sm ${stockTableMode === 'prices' ? 'min-w-[760px]' : 'min-w-[860px]'}`}>
            <thead className="bg-slate-50 text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Previous</th>
                <th className="px-4 py-3">Trend</th>
                <th className="px-4 py-3">Sector</th>
                {stockTableMode === 'prices' && <th className="px-4 py-3">Manual Price</th>}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {stocks.map((stock) => (
                <tr key={stock.id}>
                  <td className="px-4 py-4">
                    <p className="font-black text-ink">{stock.stockSymbol}</p>
                    <p className="text-xs text-muted">{stock.companyName}</p>
                  </td>
                  <td className="px-4 py-4 font-bold">{formatMoney(stock.currentPrice)}</td>
                  <td className="px-4 py-4">{formatMoney(stock.previousClose)}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs font-black ${stock.marketTrend === 'DOWN' ? 'bg-red-50 text-fall' : 'bg-green-50 text-rise'}`}>{stock.marketTrend}</span>
                  </td>
                  <td className="px-4 py-4">{stock.sector}</td>
                  {stockTableMode === 'prices' && <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceUpdates[stock.id] || ''}
                        onChange={(event) => setPriceUpdates({ ...priceUpdates, [stock.id]: event.target.value })}
                        placeholder="New price"
                        className="w-28 rounded-lg border border-line px-3 py-2 text-sm outline-none"
                      />
                      <button onClick={() => updatePrice(stock)} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Update</button>
                    </div>
                  </td>}
                  <td className="px-4 py-4">
                    {stockTableMode === 'prices' ? (
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">Price only</span>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(stock)} className="rounded-lg border border-line p-2 text-blue-600"><Edit3 size={16} /></button>
                        <button onClick={() => deleteStock(stock)} className="rounded-lg border border-line p-2 text-fall"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}

      <div className={`mt-6 grid gap-6 ${showUsers && showTransactions ? 'xl:grid-cols-2' : ''}`}>
        {showUsers && <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">All Users</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase text-blue-700">Total Wallet Balance</p>
              <p className="mt-2 text-2xl font-black text-ink">{formatMoney(stats.walletBalance)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-muted">Investor Accounts</p>
              <p className="mt-2 text-2xl font-black text-ink">{users.filter((user) => user.role !== 'ADMIN').length}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-muted">Admin Accounts</p>
              <p className="mt-2 text-2xl font-black text-ink">{stats.admins}</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-4 py-3">Name</th><th>Email</th><th>Role</th><th>Wallet</th></tr></thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-4 font-bold text-ink">{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-black text-blue-700">{user.role}</span></td>
                    <td>{formatMoney(user.walletBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>}

        {showTransactions && <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-ink">All Transactions</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-4 py-3">User</th><th>Stock</th><th>Type</th><th>Qty</th><th>Amount</th></tr></thead>
              <tbody className="divide-y divide-line">
                {transactions.slice(0, 12).map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-4 py-4">{transaction.userEmail}</td>
                    <td className="font-bold text-ink">{transaction.stockSymbol}</td>
                    <td className={transaction.transactionType === 'BUY' ? 'font-black text-rise' : 'font-black text-fall'}>{transaction.transactionType}</td>
                    <td>{transaction.quantity}</td>
                    <td>{formatMoney(transaction.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>}
      </div>
    </>
  );
}
