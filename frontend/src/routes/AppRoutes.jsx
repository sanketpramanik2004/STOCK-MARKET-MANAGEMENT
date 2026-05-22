import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardOverview from '../pages/dashboard/DashboardOverview';
import StocksPage from '../pages/dashboard/StocksPage';
import StockDetailPage from '../pages/dashboard/StockDetailPage';
import WatchlistPage from '../pages/dashboard/WatchlistPage';
import PortfolioPage from '../pages/dashboard/PortfolioPage';
import TransactionsPage from '../pages/dashboard/TransactionsPage';
import WalletPage from '../pages/dashboard/WalletPage';
import MarketAnalysisPage from '../pages/dashboard/MarketAnalysisPage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import AdminPage from '../pages/dashboard/AdminPage';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'stocks', element: <StocksPage /> },
      { path: 'stocks/:symbol', element: <StockDetailPage /> },
      { path: 'watchlist', element: <WatchlistPage /> },
      { path: 'portfolio', element: <PortfolioPage /> },
      { path: 'wallet', element: <WalletPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'analysis', element: <MarketAnalysisPage /> },
      { path: 'admin', element: <AdminPage section="overview" /> },
      { path: 'admin/stocks', element: <AdminPage section="stocks" /> },
      { path: 'admin/prices', element: <AdminPage section="prices" /> },
      { path: 'admin/users', element: <AdminPage section="users" /> },
      { path: 'admin/transactions', element: <AdminPage section="transactions" /> },
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
