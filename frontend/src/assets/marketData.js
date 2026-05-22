export const marketStats = [
  { label: 'NIFTY 50', value: '22,847.60', change: '+1.24%', trend: 'up' },
  { label: 'SENSEX', value: '74,982.12', change: '+0.82%', trend: 'up' },
  { label: 'BANK NIFTY', value: '48,126.35', change: '-0.31%', trend: 'down' },
  { label: 'Portfolio', value: '₹8.42L', change: '+14.6%', trend: 'up' },
];

export const stocks = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3800, change: 2.42, volume: '2.1M', sector: 'IT' },
  { symbol: 'INFY', name: 'Infosys', price: 1450, change: -1.12, volume: '4.8M', sector: 'IT' },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2900, change: 1.86, volume: '6.4M', sector: 'Energy' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1684, change: 0.74, volume: '8.7M', sector: 'Banking' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 968, change: 3.28, volume: '9.2M', sector: 'Auto' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', price: 2914, change: -0.66, volume: '1.3M', sector: 'Consumer' },
];

export const performanceData = [
  { month: 'Jan', value: 520000, nifty: 480000 },
  { month: 'Feb', value: 548000, nifty: 499000 },
  { month: 'Mar', value: 531000, nifty: 512000 },
  { month: 'Apr', value: 602000, nifty: 538000 },
  { month: 'May', value: 646000, nifty: 556000 },
  { month: 'Jun', value: 681000, nifty: 573000 },
  { month: 'Jul', value: 734000, nifty: 592000 },
  { month: 'Aug', value: 762000, nifty: 604000 },
  { month: 'Sep', value: 808000, nifty: 628000 },
  { month: 'Oct', value: 842000, nifty: 641000 },
];

export const allocationData = [
  { name: 'Technology', value: 34, fill: '#2563eb' },
  { name: 'Banking', value: 26, fill: '#16a34a' },
  { name: 'Energy', value: 18, fill: '#f59e0b' },
  { name: 'Auto', value: 12, fill: '#7c3aed' },
  { name: 'Consumer', value: 10, fill: '#ef4444' },
];

export const transactions = [
  { id: 'TXN-9042', stock: 'TCS', type: 'Buy', qty: 12, amount: '₹45,600', status: 'Completed', date: '22 May 2026' },
  { id: 'TXN-9038', stock: 'INFY', type: 'Sell', qty: 20, amount: '₹29,000', status: 'Completed', date: '21 May 2026' },
  { id: 'TXN-9035', stock: 'RELIANCE', type: 'Buy', qty: 8, amount: '₹23,200', status: 'Pending', date: '20 May 2026' },
  { id: 'TXN-9027', stock: 'HDFCBANK', type: 'Buy', qty: 16, amount: '₹26,944', status: 'Completed', date: '18 May 2026' },
  { id: 'TXN-9019', stock: 'ASIANPAINT', type: 'Sell', qty: 5, amount: '₹14,570', status: 'Failed', date: '17 May 2026' },
];

export const candles = [
  { day: 'Mon', open: 210, close: 246, high: 258, low: 198 },
  { day: 'Tue', open: 246, close: 232, high: 252, low: 221 },
  { day: 'Wed', open: 232, close: 274, high: 286, low: 229 },
  { day: 'Thu', open: 274, close: 268, high: 292, low: 258 },
  { day: 'Fri', open: 268, close: 315, high: 324, low: 263 },
];

export const testimonials = [
  {
    quote: 'The dashboard makes portfolio reviews feel effortless. Everything important is visible without clutter.',
    name: 'Aarav Sharma',
    role: 'Active investor',
  },
  {
    quote: 'Clean analytics, fast watchlists, and a UI that feels like a professional trading desk.',
    name: 'Meera Nair',
    role: 'Finance student',
  },
  {
    quote: 'The experience is polished enough for demos and practical enough for everyday stock tracking.',
    name: 'Rohan Mehta',
    role: 'Product analyst',
  },
];
