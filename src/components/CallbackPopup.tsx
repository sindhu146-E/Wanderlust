import { useEffect, useState } from 'react';
import {
  PhoneCall,
  X,
  Loader2,
  Check,
  AlertCircle,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { DESTINATIONS } from '../lib/travelData';
import {
  submitCallRequest,
  type CallRequestResult,
} from '../lib/callRequestService';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'not_configured';

export function CallbackPopup() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const nameValid = name.trim().length >= 2;
  const phoneValid = phone.replace(/\D/g, '').length >= 10;
  const formValid = nameValid && phoneValid && consent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!formValid || status === 'submitting') return;

    setStatus('submitting');
    setMessage('');

    const result: CallRequestResult = await submitCallRequest({
      name: name.trim(),
      phone_number: phone.trim(),
      destination_slug: destination || undefined,
      consent,
    });

    if (result.ok) {
      setStatus('success');
      setMessage('');
    } else if (result.reason === 'not_configured') {
      setStatus('not_configured');
      setMessage(result.message);
    } else {
      setStatus('error');
      setMessage(result.message);
    }
  }

  function reset() {
    setName('');
    setPhone('');
    setDestination('');
    setConsent(false);
    setStatus('idle');
    setMessage('');
    setTouched(false);
  }

  function closePopup() {
    setOpen(false);
    // reset shortly after so the close animation isn't disrupted
    setTimeout(reset, 200);
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="group fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-brand-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:bg-brand-400 hover:shadow-xl hover:shadow-brand-500/40 active:scale-95"
        aria-label="Get a call from AI Agent"
      >
        <PhoneCall className="h-5 w-5 animate-pulse" />
        <span className="hidden sm:inline">Get a Call from AI Agent</span>
        <span className="sm:hidden">Call Me</span>
      </button>

      {/* Overlay + popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/80 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-6"
          onClick={closePopup}
        >
          <div
            className="relative w-full max-w-md animate-scale-in overflow-hidden rounded-t-2xl border border-ink-800 bg-ink-900 shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900/95 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/15 text-brand-400">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">
                    Get a Call from AI Agent
                  </h3>
                  <p className="text-xs text-ink-400">
                    Our AI will call you to plan your trip
                  </p>
                </div>
              </div>
              <button
                onClick={closePopup}
                className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              {status === 'success' ? (
                <SuccessView onClose={closePopup} />
              ) : status === 'not_configured' ? (
                <NotConfiguredView message={message} onRetry={reset} />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Your Name <span className="text-coral-500">*</span>
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      className={inputClass(touched && !nameValid)}
                    />
                    {touched && !nameValid && (
                      <FieldError>Please enter your name.</FieldError>
                    )}
                  </div>

                  {/* Phone with country code */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Mobile Number (with country code){' '}
                      <span className="text-coral-500">*</span>
                    </label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      inputMode="tel"
                      className={inputClass(touched && !phoneValid)}
                    />
                    {touched && !phoneValid && (
                      <FieldError>
                        Enter a valid number including country code (e.g. +1).
                      </FieldError>
                    )}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-400">
                      Preferred Travel Destination
                    </label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full rounded-lg border border-ink-700 bg-ink-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:border-brand-500"
                    >
                      <option value="">No preference</option>
                      {DESTINATIONS.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name}, {d.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consent */}
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-ink-800 bg-ink-950/40 px-3.5 py-3">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
                    />
                    <span className="text-xs leading-relaxed text-ink-300">
                      I agree to receive an AI-generated phone call from
                      Wanderlust Travel to discuss my trip. I understand
                      standard call rates may apply.
                    </span>
                  </label>
                  {touched && !consent && (
                    <FieldError>Please check the box to confirm consent.</FieldError>
                  )}

                  {/* Error message */}
                  {status === 'error' && (
                    <div className="flex items-start gap-2 rounded-lg border border-coral-500/30 bg-coral-500/10 px-3.5 py-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-coral-400" />
                      <p className="text-xs leading-relaxed text-coral-300">
                        {message}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Requesting call…
                      </>
                    ) : (
                      <>
                        <PhoneCall className="h-4 w-4" />
                        Request a Call
                      </>
                    )}
                  </button>

                  <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-ink-500">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
                    Your number is only used for this call request.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Sub-views ---------- */

function SuccessView({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
        <Check className="h-7 w-7" />
      </div>
      <h4 className="font-display text-lg font-bold text-white">
        Call request received!
      </h4>
      <p className="mt-2 max-w-xs text-sm text-ink-400">
        Our AI agent will call you shortly to help plan your trip. Keep your
        phone nearby.
      </p>
      <button onClick={onClose} className="btn-ghost mt-6">
        Done
      </button>
    </div>
  );
}

function NotConfiguredView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand-500/15 text-sand-400">
        <Info className="h-7 w-7" />
      </div>
      <h4 className="font-display text-lg font-bold text-white">
        Calling service not yet available
      </h4>
      <p className="mt-2 max-w-xs text-sm text-ink-400">
        {message ||
          'The AI calling service is not yet configured. Please check back soon or use the booking form below.'}
      </p>
      <button onClick={onRetry} className="btn-ghost mt-6">
        Close
      </button>
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-coral-400">{children}</p>;
}

function inputClass(invalid: boolean) {
  return `w-full rounded-lg border bg-ink-950/60 px-3.5 py-2.5 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 ${
    invalid ? 'border-coral-500/60' : 'border-ink-700'
  }`;
}
