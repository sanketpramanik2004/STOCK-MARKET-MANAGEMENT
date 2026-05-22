import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  BriefcaseBusiness,
  ChartCandlestick,
  ChartNoAxesCombined,
  Database,
  ShieldCheck,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Search,
  Settings,
  User,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { sessionService } from '../services/sessionService';

const userNavItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Stocks', path: '/dashboard/stocks', icon: ChartCandlestick },
  { label: 'Watchlist', path: '/dashboard/watchlist', icon: Heart },
  { label: 'Portfolio', path: '/dashboard/portfolio', icon: BriefcaseBusiness },
  { label: 'Wallet', path: '/dashboard/wallet', icon: WalletCards },
  { label: 'Transactions', path: '/dashboard/transactions', icon: ReceiptText },
  { label: 'Market Analysis', path: '/dashboard/analysis', icon: ChartNoAxesCombined },
  { label: 'Profile', path: '/dashboard/profile', icon: User },
];

const adminNavItems = [
  { label: 'Admin Overview', path: '/dashboard/admin', icon: LayoutDashboard, end: true },
  { label: 'Stock Manager', path: '/dashboard/admin/stocks', icon: Database },
  { label: 'Price Updates', path: '/dashboard/admin/prices', icon: ChartCandlestick },
  { label: 'Users', path: '/dashboard/admin/users', icon: Users },
  { label: 'Transactions', path: '/dashboard/admin/transactions', icon: ReceiptText },
  { label: 'Admin Profile', path: '/dashboard/profile', icon: ShieldCheck },
];

function Sidebar({ open, onClose, onLogout }) {
  const isAdmin = sessionService.isAdmin();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-white px-4 py-5 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Logo />
          <button className="rounded-lg p-2 text-muted lg:hidden" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="space-y-1">
          {navItems.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                  isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 font-bold text-blue-700">SK</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-ink">{sessionService.getName()}</p>
              <p className="truncate text-xs text-muted">{isAdmin ? 'Administrator' : 'Premium Investor'}</p>
            </div>
            <button onClick={onLogout} className="ml-auto rounded-lg p-2 text-muted hover:bg-white hover:text-fall" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = sessionService.isAdmin();

  const handleLogout = () => {
    sessionService.clear();
    navigate('/login');
  };

  useEffect(() => {
    if (isAdmin && location.pathname === '/dashboard') {
      navigate('/dashboard/admin', { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-soft lg:flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-line bg-white/88 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-line p-2 text-ink lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={20} />
            </button>
            <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-line bg-slate-50 px-3 py-2 md:flex">
              <Search size={18} className="text-muted" />
              <input className="w-full bg-transparent text-sm outline-none" placeholder={isAdmin ? 'Search users, stocks, transactions' : 'Search stocks, sectors, transactions'} />
            </div>
            <button className="ml-auto rounded-lg border border-line p-2 text-muted hover:text-ink" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button className="rounded-lg border border-line p-2 text-muted hover:text-ink" aria-label="Settings">
              <Settings size={20} />
            </button>
            <div className="hidden items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 sm:flex">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-sm font-bold text-white">S</div>
              <span className="text-sm font-bold text-ink">{sessionService.getName().split(' ')[0]}</span>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-line p-2 text-muted hover:text-fall" aria-label="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
