import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useState } from 'react';
import Logo from '../components/Logo';
import { authService } from '../services/authService';
import { sessionService } from '../services/sessionService';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      if (String(response.data.message).toLowerCase().includes('successfully')) {
        sessionService.setUser(response.data);
        navigate('/dashboard');
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to register. Please check backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#eff6ff,#ffffff_45%,#ecfdf5)] px-4 py-8">
      <div className="mx-auto mb-8 flex max-w-6xl items-center justify-between gap-4">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600">
          <ArrowLeft size={17} />
          Home
        </Link>
      </div>
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-white bg-white shadow-soft lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white sm:p-10">
          <h1 className="text-4xl font-black leading-tight">Investor workspace</h1>
          <p className="mt-4 leading-8 text-blue-100">Start with a polished dashboard experience and connect real market APIs when your backend is ready.</p>
          <div className="mt-8 space-y-4">
            {['Portfolio analytics', 'Transaction tracking', 'Market trend charts', 'Secure account flow'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm font-bold text-blue-50"><CheckCircle2 size={18} className="text-green-300" /> {item}</div>
            ))}
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <h2 className="text-3xl font-black text-ink">Register</h2>
          <p className="mt-2 text-muted">Join our investor workspace to get started.</p>
          <form className="mt-8 grid gap-5" onSubmit={handleSubmit} autoComplete="off">
            {[
              { label: 'Full name', field: 'name', icon: User, type: 'text', placeholder: 'Your name', autoComplete: 'off' },
              { label: 'Email', field: 'email', icon: Mail, type: 'email', placeholder: 'you@gmail.com', autoComplete: 'off' },
            ].map(({ label, field, icon: Icon, type, placeholder, autoComplete }) => (
              <label key={label} className="block">
                <span className="text-sm font-bold text-ink">{label}</span>
                <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
                  <Icon size={19} className="text-muted" />
                  <input className="w-full outline-none" type={type} name={`stockpulse-register-${field}`} autoComplete={autoComplete} placeholder={placeholder} value={form[field]} onChange={(event) => updateField(field, event.target.value)} required />
                </div>
              </label>
            ))}
            <label className="block">
              <span className="text-sm font-bold text-ink">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
                <Lock size={19} className="text-muted" />
                <input className="w-full outline-none" type={showPassword ? 'text' : 'password'} name="stockpulse-register-passcode" autoComplete="new-password" placeholder="Create password" value={form.password} onChange={(event) => updateField('password', event.target.value)} minLength={6} required />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-muted" aria-label="Toggle password visibility">
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              <p className="mt-2 text-xs font-medium text-rise">Strong password format supported.</p>
            </label>
            <label className="block">
              <span className="text-sm font-bold text-ink">Confirm password</span>
              <div className="mt-2 flex items-center gap-3 rounded-lg border border-line px-4 py-3 focus-within:border-blue-500">
                <Lock size={19} className="text-muted" />
                <input className="w-full outline-none" type="password" name="stockpulse-register-confirm-passcode" autoComplete="new-password" placeholder="Repeat password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} required />
              </div>
            </label>
            {message && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-fall">{message}</p>}
            <button disabled={loading} className="rounded-lg bg-blue-600 px-5 py-3 text-center font-bold text-white shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link className="font-bold text-blue-600" to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
