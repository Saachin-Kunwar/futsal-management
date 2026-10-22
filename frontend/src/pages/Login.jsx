import { useState, useContext } from 'react';
import AuthContext from '../context/auth-context';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (user) {
    return <Navigate to={user.role === 'ADMIN' || user.role === 'STAFF' ? '/admin' : '/bookings'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await login(username, password);
      if (res.success) {
        const destination = location.state?.from?.pathname;
        if (destination && destination !== '/login' && destination !== '/register') {
          navigate(destination, { replace: true });
        } else if (res.role === 'ADMIN' || res.role === 'STAFF') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/bookings', { replace: true });
        }
      } else {
        setError(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Welcome back</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Sign in to GoalPro</h1>
        </div>
        {location.state?.successMessage && (
          <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            {location.state.successMessage}
          </p>
        )}
        {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-700 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account? <Link to="/register" className="font-semibold text-emerald-700 hover:underline">Register here</Link>
        </p>
      </section>
    </main>
  );
}