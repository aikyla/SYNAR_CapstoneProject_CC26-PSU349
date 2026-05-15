import { motion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Sun, Mail, Lock, User, ArrowRight, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { loginUser, registerUser, requestPasswordReset, resetPassword } from '../services/authService';

function PasswordField({ id, value, onChange, placeholder, className = '', minLength }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await loginUser(email, password);
      navigate('/app');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-orange-900/5 border border-white relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-6">
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Welcome Back</h2>
          <p className="text-slate-500 font-medium">Login to check your daily sun risk</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-sm font-bold text-orange-500 hover:text-orange-600">Forgot?</Link>
            </div>
            <PasswordField value={password} onChange={setPassword} placeholder="Password" className="py-4" />
          </div>

          {error && <p className="text-sm font-bold text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sun className="w-6 h-6" /></motion.div> : 'Login'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Don't have an account? <Link to="/register" className="text-orange-500 font-bold hover:underline">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Gagal mengirim link reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-orange-900/5 border border-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Reset Password</h2>
          <p className="text-slate-500 font-medium">Enter your email to receive a reset link</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleReset} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="text-sm font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input id="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium" />
              </div>
            </div>
            {error && <p className="text-sm font-bold text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sun className="w-6 h-6" /></motion.div> : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Check your email</h3>
            <p className="text-slate-500 text-sm mb-6">If the email is registered, a password reset link has been sent.</p>
            <Link to="/login" className="w-full inline-block py-4 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-lg hover:-translate-y-1 transition-all">Back to Login</Link>
          </motion.div>
        )}

        {!submitted && (
          <div className="mt-8 text-center">
            <Link to="/login" className="text-slate-500 font-bold hover:text-slate-800 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset token is missing. Please request a new reset link.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      window.setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-orange-900/5 border border-white">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-6 border border-orange-200">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Create New Password</h2>
          <p className="text-slate-500 font-medium">Choose a new password for your SYNAR account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-sm font-bold text-slate-700">New Password</label>
            <PasswordField id="new-password" value={password} onChange={setPassword} placeholder="Minimum 8 characters" minLength={8} className="py-4" />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className="text-sm font-bold text-slate-700">Confirm Password</label>
            <PasswordField id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat new password" minLength={8} className="py-4" />
          </div>

          {error && <p className="text-sm font-bold text-red-500">{error}</p>}
          {message && <p className="text-sm font-bold text-green-600">{message}</p>}

          <button type="submit" disabled={loading || !token} className="w-full py-4 mt-4 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-2xl font-black text-lg shadow-lg shadow-orange-500/30 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sun className="w-6 h-6" /></motion.div> : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-slate-500 font-bold hover:text-slate-800 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}

export function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser(name, email, password);
      navigate('/app');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-10 shadow-2xl shadow-orange-900/5 border border-white">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Create Account</h2>
          <p className="text-slate-500 font-medium">Join SYNAR for personalized sun safety</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="user" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-400 transition-all font-medium" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <PasswordField value={password} onChange={setPassword} placeholder="Password" className="py-3.5" />
          </div>

          {error && <p className="text-sm font-bold text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="w-full py-4 mt-6 bg-slate-800 text-white rounded-2xl font-black text-lg shadow-lg hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
            {loading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sun className="w-6 h-6" /></motion.div> : <><ArrowRight className="w-5 h-5" /> Get Started</>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-orange-500 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
