import { useState } from 'react';
import { Check, Loader2, Send, Users } from 'lucide-react';
import type { Destination, BookingInquiry } from '../lib/supabase';
import { supabase } from '../lib/supabase';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export function BookingForm({
  destinations,
  preselectedSlug,
}: {
  destinations: Destination[];
  preselectedSlug?: string;
}) {
  const [form, setForm] = useState<BookingInquiry>({
    name: '',
    email: '',
    phone: '',
    destination_slug: preselectedSlug ?? '',
    travel_date: '',
    travelers: 2,
    budget: '',
    message: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  function update<K extends keyof BookingInquiry>(
    key: K,
    value: BookingInquiry[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'submitting') return;
    setStatus('submitting');
    setError('');
    try {
      const payload = {
        ...form,
        travel_date: form.travel_date || null,
      };
      const { error: insertError } = await supabase
        .from('booking_inquiries')
        .insert(payload);
      if (insertError) throw insertError;
      setStatus('success');
      setForm({
        name: '',
        email: '',
        phone: '',
        destination_slug: '',
        travel_date: '',
        travelers: 2,
        budget: '',
        message: '',
      });
    } catch (err: any) {
      setStatus('error');
      setError(err?.message ?? 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
          <Check className="h-7 w-7" />
        </div>
        <h3 className="font-display text-xl font-bold text-white">
          Inquiry sent!
        </h3>
        <p className="mt-2 max-w-sm text-sm text-ink-400">
          One of our travel specialists will reach out within 24 hours to
          craft your perfect itinerary.
        </p>
        <button onClick={() => setStatus('idle')} className="btn-ghost mt-6">
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="input"
            placeholder="Jane Doe"
          />
        </Field>
        <Field label="Email" required>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="input"
            placeholder="jane@email.com"
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className="input"
            placeholder="+1 (555) 123-4567"
          />
        </Field>
        <Field label="Destination">
          <select
            value={form.destination_slug}
            onChange={(e) => update('destination_slug', e.target.value)}
            className="input"
          >
            <option value="">Select a destination</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}, {d.country}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Preferred travel date">
          <input
            type="date"
            value={form.travel_date}
            onChange={(e) => update('travel_date', e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Number of travelers">
          <div className="relative">
            <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="number"
              min="1"
              max="20"
              value={form.travelers}
              onChange={(e) =>
                update('travelers', parseInt(e.target.value) || 1)
              }
              className="input pl-9"
            />
          </div>
        </Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Budget per person">
          <select
            value={form.budget}
            onChange={(e) => update('budget', e.target.value)}
            className="input"
          >
            <option value="">Select a range</option>
            <option value="under-1500">Under $1,500</option>
            <option value="1500-2500">$1,500 – $2,500</option>
            <option value="2500-3500">$2,500 – $3,500</option>
            <option value="over-3500">$3,500+</option>
          </select>
        </Field>
        <Field label="Tell us about your dream trip" required>
          <input
            required
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className="input"
            placeholder="Honeymoon, family adventure, solo trek…"
          />
        </Field>
      </div>

      {status === 'error' && (
        <p className="mt-4 text-sm text-coral-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="btn-primary mt-6 w-full sm:w-auto"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> Request my trip
          </>
        )}
      </button>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #3a3f4f;
          background: rgba(19,22,31,0.6);
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          color: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .input::placeholder { color: #67718d; }
        .input:focus { border-color: #34d399; }
        .input option { background: #1f2330; }
        .input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
        {label}
        {required && <span className="text-coral-500"> *</span>}
      </span>
      {children}
    </label>
  );
}
