import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API, { getApiErrorMessage } from '../services/api';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100';

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await API.post('accounts/register/', form);
      navigate('/login', {
        replace: true,
        state: { successMessage: 'Your account is ready. Sign in to continue.' },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-7 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">Join GoalPro</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Register to book and manage your futsal reservations.</p>
        </div>
        {error && (
          <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            First name
            <input name="first_name" autoComplete="given-name" value={form.first_name} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Last name
            <input name="last_name" autoComplete="family-name" value={form.last_name} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Username
            <input name="username" autoComplete="username" required value={form.username} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700 sm:col-span-2">
            Email
            <input name="email" type="email" autoComplete="email" required value={form.email} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Phone number
            <input name="phone_number" type="tel" autoComplete="tel" value={form.phone_number} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Password
            <input name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={updateField} className={`${inputClass} mt-1`} />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-emerald-700 px-4 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="font-semibold text-emerald-700 hover:underline">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
