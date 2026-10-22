import { useCallback, useEffect, useState } from 'react';
import API, { getApiErrorMessage } from '../services/api';

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

async function fetchBookingData() {
  const [bookingResponse, turfResponse] = await Promise.all([
    API.get('bookings/reservations/'),
    API.get('bookings/turfs/'),
  ]);
  return { bookings: bookingResponse.data, turfs: turfResponse.data };
}

function today() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [turfs, setTurfs] = useState([]);
  const [form, setForm] = useState({ turf: '', date: today(), start_time: '', duration_hours: '1' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const { bookings, turfs: availableTurfs } = await fetchBookingData();
      setBookings(bookings);
      setTurfs(availableTurfs);
      setForm((current) => ({
        ...current,
        turf: current.turf || String(availableTurfs[0]?.id || ''),
      }));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load bookings. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadInitialData() {
      try {
        const { bookings: initialBookings, turfs: availableTurfs } = await fetchBookingData();
        if (!isCurrent) return;
        setBookings(initialBookings);
        setTurfs(availableTurfs);
        setForm((current) => ({
          ...current,
          turf: current.turf || String(availableTurfs[0]?.id || ''),
        }));
      } catch (requestError) {
        if (isCurrent) {
          setError(getApiErrorMessage(requestError, 'Unable to load bookings. Please try again.'));
        }
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    }

    loadInitialData();
    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await API.post('bookings/reservations/', {
        ...form,
        turf: Number(form.turf),
        duration_hours: Number(form.duration_hours),
      });
      setForm((current) => ({ ...current, start_time: '' }));
      setIsLoading(true);
      await loadData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create the booking. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cancelBooking(bookingId) {
    setError('');
    setCancellingId(bookingId);
    try {
      await API.post(`bookings/reservations/${bookingId}/cancel/`);
      setIsLoading(true);
      await loadData();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to cancel the booking. Please try again.'));
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Reservations</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">My bookings</h1>
        <p className="mt-2 text-gray-600">Reserve a turf and keep track of your upcoming games.</p>
      </div>

      {error && (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="mb-10 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-xl font-bold text-gray-900">Book a turf</h2>
        {turfs.length === 0 && !isLoading ? (
          <p className="mt-3 text-gray-600">No turfs are available to book right now. Please check back later.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-gray-700">
              Turf
              <select
                required
                value={form.turf}
                onChange={(event) => setForm((current) => ({ ...current, turf: event.target.value }))}
                className={inputClass}
              >
                {turfs.map((turf) => <option key={turf.id} value={turf.id}>{turf.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">
              Date
              <input
                type="date"
                min={today()}
                required
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Start time
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(event) => setForm((current) => ({ ...current, start_time: event.target.value }))}
                className={inputClass}
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Duration
              <select
                value={form.duration_hours}
                onChange={(event) => setForm((current) => ({ ...current, duration_hours: event.target.value }))}
                className={inputClass}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || turfs.length === 0}
              className="rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 lg:col-span-4"
            >
              {isSubmitting ? 'Booking...' : 'Reserve turf'}
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">Reservation history</h2>
        {isLoading ? (
          <p className="py-8 text-center text-gray-600">Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            You have no bookings yet. Choose a turf above to get started.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{booking.turf_name || 'Futsal turf'}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {booking.date} · {booking.start_time.slice(0, 5)}–{booking.end_time.slice(0, 5)}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {booking.status}
                  </span>
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{formatPrice(booking.total_price)}</p>
                    <p className="mt-1 text-gray-500">Payment: {booking.payment_status || 'UNPAID'}</p>
                  </div>
                  {['PENDING', 'CONFIRMED'].includes(booking.status) && (
                    <button
                      type="button"
                      disabled={cancellingId === booking.id}
                      onClick={() => cancelBooking(booking.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      {cancellingId === booking.id ? 'Cancelling...' : 'Cancel booking'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
