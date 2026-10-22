import { useEffect, useState } from 'react';
import API, { getApiErrorMessage } from '../services/api';

function formatPrice(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function BookingList({ title, bookings, emptyMessage }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-900">{title}</h2>
      {bookings.length === 0 ? (
        <p className="py-4 text-sm text-gray-500">{emptyMessage}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="pb-3 pr-4 font-semibold">Customer</th>
                <th className="pb-3 pr-4 font-semibold">Turf</th>
                <th className="pb-3 pr-4 font-semibold">Date / time</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-3 pr-4 font-medium text-gray-900">{booking.customer_username}</td>
                  <td className="py-3 pr-4 text-gray-600">{booking.turf_name}</td>
                  <td className="py-3 pr-4 text-gray-600">{booking.date} · {booking.start_time.slice(0, 5)}</td>
                  <td className="py-3 text-gray-600">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await API.get('dashboard/stats/');
        setDashboard(response.data);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, 'Unable to load dashboard statistics.'));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (isLoading) {
    return <main className="flex-1 py-20 text-center text-gray-600">Loading dashboard...</main>;
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Management</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Admin dashboard</h1>
        <p className="mt-2 text-gray-600">An overview of bookings and activity at your venue.</p>
      </div>

      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>
      ) : (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Today’s bookings', dashboard.metrics.todays_bookings_count],
              ['Today’s income', formatPrice(dashboard.metrics.todays_income)],
              ['Registered customers', dashboard.metrics.total_customers],
              ['Upcoming bookings', dashboard.metrics.upcoming_bookings_count],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
              </article>
            ))}
          </section>
          <div className="grid gap-5">
            <BookingList
              title="Today’s bookings"
              bookings={dashboard.todays_bookings}
              emptyMessage="There are no bookings for today."
            />
            <BookingList
              title="Upcoming bookings"
              bookings={dashboard.upcoming_bookings}
              emptyMessage="There are no upcoming bookings."
            />
          </div>
        </>
      )}
    </main>
  );
}
