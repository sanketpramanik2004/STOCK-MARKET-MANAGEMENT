import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, LineChart, LockKeyhole, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';
import Logo from '../components/Logo';
import MetricCard from '../components/MetricCard';
import SectionTitle from '../components/SectionTitle';
import PortfolioLineChart from '../components/charts/PortfolioLineChart';
import { marketStats, testimonials } from '../assets/marketData';

const features = [
  { icon: LineChart, title: 'Live Market Intelligence', text: 'Track indices, watchlists, top movers, and price action from one focused workspace.' },
  { icon: WalletCards, title: 'Portfolio Command Center', text: 'Understand holdings, allocation, gains, and risk through clear visual summaries.' },
  { icon: ShieldCheck, title: 'Secure By Design', text: 'Prepared for authenticated Spring Boot APIs, protected routes, and production workflows.' },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Logo light />
          <div className="hidden items-center gap-8 text-sm font-semibold text-blue-100 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#testimonials" className="hover:text-white">Testimonials</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-bold text-white hover:bg-white/10">Login</Link>
            <Link to="/register" className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-lg shadow-blue-950/20">Get Started</Link>
          </div>
        </nav>
      </header>

      <section className="market-grid relative overflow-hidden bg-slate-950 pt-28 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(22,163,74,0.26),transparent_24%),linear-gradient(135deg,#020617,#0f172a_48%,#123b85)]" />
        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-sm font-semibold text-blue-100">
              <Sparkles size={16} /> Professional trading platform UI
            </span>
            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
              Stock Market Management System
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              A polished fintech dashboard for tracking stocks, portfolios, transactions, and market analysis with a modern investor-grade experience.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard" className="rounded-lg bg-blue-600 px-6 py-3 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500">
                Open Dashboard
              </Link>
              <Link to="/login" className="rounded-lg border border-white/20 px-6 py-3 text-center text-sm font-bold text-white transition hover:bg-white/10">
                Login
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {marketStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="rounded-lg border border-white/12 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs text-slate-300">{stat.label}</p>
                  <p className="mt-2 text-lg font-bold">{stat.value}</p>
                  <p className={stat.trend === 'up' ? 'text-sm font-bold text-green-300' : 'text-sm font-bold text-red-300'}>{stat.change}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="glass chart-glow rounded-lg p-4 text-ink shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-muted">Portfolio performance</p>
                <p className="text-2xl font-black">₹8,42,000</p>
              </div>
              <span className="rounded-md bg-green-50 px-3 py-1 text-sm font-bold text-rise">+14.6%</span>
            </div>
            <PortfolioLineChart compact />
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Features" title="Built like a serious fintech product" description="Every screen is designed for scanning, comparing, and acting quickly across the full investment workflow." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <motion.div key={title} whileHover={{ y: -6 }} className="rounded-lg border border-line bg-white p-6 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-blue-600"><Icon size={24} /></div>
              <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="about" className="bg-soft px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-600">About</p>
            <h2 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">Manage the full investing journey from one workspace.</h2>
            <p className="mt-5 leading-8 text-muted">StockPulse combines watchlists, portfolio analytics, transaction history, and market charts into a cohesive React frontend that is ready to connect with your Spring Boot backend.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {['Responsive dashboard', 'Reusable components', 'API-ready services', 'Animated interactions'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-bold text-ink"><CheckCircle2 className="text-rise" size={18} /> {item}</div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Assets tracked" value="128" change="+18%" icon={BarChart3} />
            <MetricCard label="Win rate" value="67%" change="+4.2%" icon={LineChart} />
            <MetricCard label="Risk score" value="Low" change="+Stable" icon={ShieldCheck} />
            <MetricCard label="Security" value="Ready" change="+BCrypt" icon={LockKeyhole} />
          </div>
        </div>
      </section>

      <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Testimonials" title="Designed to feel credible from the first click" description="A clean, modern interface that works for project demos, product prototypes, and real feature expansion." />
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-lg border border-line bg-white p-6 shadow-sm">
              <p className="leading-7 text-muted">"{item.quote}"</p>
              <p className="mt-5 font-bold text-ink">{item.name}</p>
              <p className="text-sm text-muted">{item.role}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-slate-950 px-4 py-8 text-blue-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <Logo light />
          <p className="text-sm">© 2026 StockPulse. Built for modern market management.</p>
        </div>
      </footer>
    </div>
  );
}
