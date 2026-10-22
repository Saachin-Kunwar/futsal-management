import { useContext } from 'react';
import AuthContext from '../context/auth-context';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, LogOut, User, Calendar } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav aria-label="Main navigation" className="bg-emerald-950 text-white shadow-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold sm:text-xl">
          <Trophy aria-hidden="true" className="h-6 w-6 shrink-0 text-emerald-400" />
          <span>GoalPro Futsal</span>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm sm:gap-x-6">
          {user ? (
            <>
              <span className="flex items-center gap-1 text-emerald-200">
                <User aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{user.username}</span>
              </span>
              {['ADMIN', 'STAFF'].includes(user.role) && (
                <Link to="/admin" className="font-medium hover:text-emerald-300">Dashboard</Link>
              )}
              <Link to="/bookings" className="flex items-center gap-1 font-medium hover:text-emerald-300">
                <Calendar aria-hidden="true" className="h-4 w-4 shrink-0" /> My Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 rounded-lg bg-red-700 px-3 py-2 font-medium transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <LogOut aria-hidden="true" className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium hover:text-emerald-300">Sign in</Link>
              <Link to="/register" className="rounded-lg bg-emerald-600 px-4 py-2 font-medium transition hover:bg-emerald-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}