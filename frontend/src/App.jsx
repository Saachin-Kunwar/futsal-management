import { useContext } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AuthContext from './context/auth-context';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import Bookings from './pages/Bookings';
import Login from './pages/Login';
import Register from './pages/Register';

function RequireAuth({ children, roles }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/bookings" replace />;
  }

  return children;
}

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-8 md:py-24">
      <div>
        <p className="mb-4 font-semibold uppercase tracking-[0.2em] text-emerald-700">Play your game</p>
        <h1 className="max-w-xl font-bold leading-tight text-gray-950 text-4xl sm:text-5xl lg:text-6xl">
          Your next great futsal match starts here.
        </h1>
        <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
          Find a time, reserve your turf, and keep every booking in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={user ? '/bookings' : '/register'}
            className="rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
          >
            {user ? 'View my bookings' : 'Get started'}
          </Link>
          {!user && (
            <Link
              to="/login"
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-800 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-8 text-white shadow-xl md:p-12">
        <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full bg-emerald-700/50 blur-2xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">GoalPro Futsal</p>
          <div className="my-10 flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-emerald-700 to-emerald-950">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-emerald-200/80 text-4xl font-bold text-emerald-100">
              GP
            </div>
          </div>
          <p className="text-xl font-semibold">A better way to get on the pitch.</p>
          <p className="mt-2 text-emerald-100/80">Check availability and manage your reservations with ease.</p>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-20 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 text-gray-600">The page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 font-semibold text-emerald-700 hover:text-emerald-800">
        Return home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/bookings"
              element={
                <RequireAuth>
                  <Bookings />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAuth roles={['ADMIN', 'STAFF']}>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
