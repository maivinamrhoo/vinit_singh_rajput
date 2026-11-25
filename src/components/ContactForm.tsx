import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { submitContactMessage } from '../services/api';
import { validateContactInput } from '../lib/contentUtils';

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    const validation = validateContactInput({ name, email, subject, message });
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await submitContactMessage({ name, email, subject, message });
      setSuccessMsg(res.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      if (err?.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setServerError(err?.message || 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="bg-[#F8F1E6] border border-[#23483D]/20 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-[#23483D] mx-auto mb-3" strokeWidth={1.5} />
        <h3 className="font-display text-2xl font-semibold text-[#17372F] mb-2">
          Letter Received
        </h3>
        <p className="font-serif text-[15px] text-[#40352D]/85 mb-6 max-w-md mx-auto">
          {successMsg}
        </p>
        <button
          type="button"
          onClick={() => setSuccessMsg(null)}
          className="px-5 py-2.5 text-sm font-sans font-medium text-[#23483D] border border-[#23483D]/30 rounded-lg hover:bg-[#EFE2CC] transition-colors"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className={compact ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-5'}>
        <div>
          <label
            htmlFor="contact-name"
            className="block font-sans text-xs font-medium text-[#40352D]/80 mb-1.5"
          >
            Your Name
          </label>
          <input
            id="contact-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2.5 rounded-lg bg-[#F8F1E6] border border-[#40352D]/20 text-[#40352D] font-sans text-sm focus:outline-none focus:border-[#23483D] transition-colors"
          />
          {fieldErrors.name && (
            <p className="mt-1 font-sans text-xs text-[#B96F4E]">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block font-sans text-xs font-medium text-[#40352D]/80 mb-1.5"
          >
            Email Address
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-lg bg-[#F8F1E6] border border-[#40352D]/20 text-[#40352D] font-sans text-sm focus:outline-none focus:border-[#23483D] transition-colors"
          />
          {fieldErrors.email && (
            <p className="mt-1 font-sans text-xs text-[#B96F4E]">{fieldErrors.email}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block font-sans text-xs font-medium text-[#40352D]/80 mb-1.5"
        >
          Subject (optional)
        </label>
        <input
          id="contact-subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Reader note, publishing inquiry, or collaboration"
          className="w-full px-4 py-2.5 rounded-lg bg-[#F8F1E6] border border-[#40352D]/20 text-[#40352D] font-sans text-sm focus:outline-none focus:border-[#23483D] transition-colors"
        />
        {fieldErrors.subject && (
          <p className="mt-1 font-sans text-xs text-[#B96F4E]">{fieldErrors.subject}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block font-sans text-xs font-medium text-[#40352D]/80 mb-1.5"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          required
          rows={compact ? 4 : 5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your note here..."
          className="w-full px-4 py-3 rounded-lg bg-[#F8F1E6] border border-[#40352D]/20 text-[#40352D] font-sans text-sm focus:outline-none focus:border-[#23483D] transition-colors resize-y"
        />
        {fieldErrors.message && (
          <p className="mt-1 font-sans text-xs text-[#B96F4E]">{fieldErrors.message}</p>
        )}
      </div>

      {serverError && (
        <p className="font-sans text-sm text-[#B96F4E]" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] disabled:opacity-60 transition-colors whitespace-nowrap"
      >
        <Send className="w-4 h-4" />
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
