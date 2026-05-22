import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(process.env.REACT_APP_GOOGLE_CLIENT_ID || '');
  const googleButtonRef = useRef(null);
  const navigate = useNavigate();

  const completeLogin = (data) => {
    sessionService.setUser(data);
    navigate(data.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authService.login(form);
      if (String(response.data.message).toLowerCase().includes('successful')) {
        completeLogin(response.data);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to login. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadGoogleConfig = async () => {
      if (googleClientId) {
        return;
      }

      try {
        const response = await authService.googleConfig();
        setGoogleClientId(response.data.clientId || '');
      } catch (error) {
        setGoogleClientId('');
      }
    };

    loadGoogleConfig();
  }, []);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          setLoading(true);
          setMessage('');

          try {
            const loginResponse = await authService.googleLogin(response.credential);
            completeLogin(loginResponse.data);
          } catch (error) {
            setMessage(error.response?.data?.message || 'Google login failed.');
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'rectangular',
        text: 'continue_with',
        width: 384,
      });
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);
  }, [googleClientId]);

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="market-grid hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div>
          <h1 className="max-w-xl text-5xl font-black leading-tight">Trade smarter with a dashboard that respects your focus.</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-100">Monitor markets, manage portfolios, and review trading activity through one refined interface.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
          <p className="text-sm text-blue-100">Today's portfolio movement</p>
          <p className="mt-2 text-3xl font-black text-green-300">+₹28,420</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="lg:hidden"><Logo /></div>
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600">
              <ArrowLeft size={17} />
              Home
            </Link>
          </div>
          <h2 className="text-3xl font-black text-ink">Welcome back</h2>
          <p className="mt-2 text-muted">Login to continue to your trading workspace.</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit} autoComplete="off">
            <label className="block">
              <span className="text-sm font-bold text-ink">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
                <Mail size={19} className="text-muted" />
                <input className="w-full outline-none" type="email" name="stockpulse-login-email" autoComplete="off" placeholder="you@example.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-ink">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
                <Lock size={19} className="text-muted" />
                <input className="w-full outline-none" type={showPassword ? 'text' : 'password'} name="stockpulse-login-passcode" autoComplete="new-password" placeholder="Enter password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-muted" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 font-medium text-muted"><input type="checkbox" className="h-4 w-4 accent-blue-600" /> Remember me</label>
              <a className="font-bold text-blue-600" href="#">Forgot password?</a>
            </div>
            {message && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-fall">{message}</p>}
            <button disabled={loading} className="block w-full rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-bold uppercase text-muted">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex justify-center" />
          ) : (
            <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              Add Google Client ID to enable Google login.
            </p>
          )}
          <p className="mt-6 text-center text-sm text-muted">New to StockPulse? <Link className="font-bold text-blue-600" to="/register">Create account</Link></p>
        </div>
      </div>
    </div>
  );
}
