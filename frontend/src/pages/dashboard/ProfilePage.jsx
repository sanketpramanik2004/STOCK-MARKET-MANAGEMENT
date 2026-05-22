import { Bell, ChartCandlestick, CreditCard, Database, LogOut, Mail, ReceiptText, RefreshCw, ShieldCheck, UserRound, Users, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { authService } from '../../services/authService';
import { sessionService } from '../../services/sessionService';

const formatMoney = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: sessionService.getName(),
    email: sessionService.getEmail(),
    walletBalance: sessionService.getWalletBalance(),
    role: sessionService.getRole(),
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const initials = useMemo(() => {
    return String(profile.name || 'User')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }, [profile.name]);

  const token = sessionService.getToken();
  const isAdmin = profile.role === 'ADMIN' || sessionService.isAdmin();

  const loadProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await authService.me();
      const nextProfile = {
        name: response.data.name,
        email: response.data.email,
        walletBalance: response.data.walletBalance,
        role: response.data.role,
      };
      sessionService.setUser(nextProfile);
      setProfile(nextProfile);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load profile. Please login again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    sessionService.clear();
    navigate('/login');
  };

  return (
    <>
      <PageHeader
        title={isAdmin ? 'Admin Profile' : 'Profile'}
        subtitle={isAdmin ? 'Manage administrator identity, access, and platform control permissions.' : 'Manage your investor identity, wallet, and account session.'}
        action={
          <div className="flex gap-2">
            <button onClick={loadProfile} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-bold text-ink">
              <RefreshCw size={17} /> {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white">
              <LogOut size={17} /> Logout
            </button>
          </div>
        }
      />

      {message && <p className="mb-5 rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-lg border border-line bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-lg bg-blue-600 text-3xl font-black text-white shadow-lg shadow-blue-600/20">
            {initials || 'U'}
          </div>
          <h2 className="mt-5 text-2xl font-black text-ink">{profile.name}</h2>
          <p className="text-muted">{profile.email}</p>
          {isAdmin ? (
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-bold uppercase text-blue-700">Access Level</p>
              <p className="mt-1 text-3xl font-black text-blue-700">ADMIN</p>
              <p className="mt-2 text-sm font-semibold text-muted">Platform operations account</p>
            </div>
          ) : (
            <div className="mt-6 rounded-lg bg-green-50 p-4">
              <p className="text-xs font-bold uppercase text-green-700">Wallet Balance</p>
              <p className="mt-1 text-3xl font-black text-rise">{formatMoney(profile.walletBalance)}</p>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-line bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Account Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { icon: UserRound, label: 'Full name', value: profile.name },
              { icon: Mail, label: 'Email', value: profile.email },
              { icon: ShieldCheck, label: 'Session', value: token ? 'JWT active' : 'Not logged in' },
              { icon: ShieldCheck, label: 'Role', value: profile.role || 'USER' },
              ...(isAdmin
                ? [
                    { icon: Database, label: 'Scope', value: 'Stocks, users, orders' },
                    { icon: ReceiptText, label: 'Audit', value: 'Transaction visibility' },
                  ]
                : [{ icon: Wallet, label: 'Wallet', value: formatMoney(profile.walletBalance) }]),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <Icon className="text-blue-600" size={20} />
                <p className="mt-3 text-xs font-bold uppercase text-muted">{label}</p>
                <p className="mt-1 break-words font-bold text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {(isAdmin
          ? [
              { icon: Database, title: 'Stock Control', text: 'Add, edit, delete, and seed stock records for demo and platform maintenance.' },
              { icon: Users, title: 'User Oversight', text: 'View registered users and read wallet balances for audit and support workflows.' },
              { icon: ChartCandlestick, title: 'Market Maintenance', text: 'Update saved market prices manually without exposing investor workflows.' },
              { icon: ReceiptText, title: 'Transaction Audit', text: 'Review buy and sell activity across all users from the admin panel.' },
            ]
          : [
              { icon: ShieldCheck, title: 'Security', text: 'JWT authentication is active for trading, portfolio, watchlist, and profile APIs.' },
              { icon: Bell, title: 'Notifications', text: 'Price alerts and transaction notifications can be added next.' },
              { icon: CreditCard, title: 'Wallet', text: 'Buying reduces wallet balance; selling shares credits funds back.' },
            ]).map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <Icon className="text-blue-600" size={24} />
            <h3 className="mt-4 font-black text-ink">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
