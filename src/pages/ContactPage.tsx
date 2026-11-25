import React, { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { ContactForm } from '../components/ContactForm';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { fetchPublicSettings } from '../services/api';
import type { SiteSettings } from '../types/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { sanitizeExternalUrl } from '../lib/contentUtils';

export function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useDocumentMeta({
    title: 'Contact — Vinit Singh Rajput',
    description:
      'Send a message to Vinit Singh Rajput for reader correspondence, literary inquiries, or publishing requests.',
  });

  useEffect(() => {
    fetchPublicSettings().then(setSettings).catch(() => {});
  }, []);

  const socials = [
    { label: 'Instagram', url: sanitizeExternalUrl(settings?.socialLinks?.instagram || '') },
    { label: 'X / Twitter', url: sanitizeExternalUrl(settings?.socialLinks?.twitter || '') },
    { label: 'Goodreads', url: sanitizeExternalUrl(settings?.socialLinks?.goodreads || '') },
    { label: 'YouTube', url: sanitizeExternalUrl(settings?.socialLinks?.youtube || '') },
    { label: 'Facebook', url: sanitizeExternalUrl(settings?.socialLinks?.facebook || '') },
    { label: 'LinkedIn', url: sanitizeExternalUrl(settings?.socialLinks?.linkedin || '') },
  ].filter((s) => Boolean(s.url));

  return (
    <div className="paper-grain min-h-[75vh]">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-hand text-2xl text-[#B96F4E]">Correspondence</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
            Write to the Author
          </h1>
          <p className="font-serif text-[16px] text-[#40352D]/80 mt-4 leading-relaxed">
            For reader notes, literary collaborations, or publishing inquiries, leave a
            letter below. Every message goes directly to the private author inbox.
          </p>
          <BotanicalDivider className="mt-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-6">
            <div className="p-7 rounded-2xl bg-[#EFE2CC]/65 border border-[#B69A61]/35">
              <Mail className="w-6 h-6 text-[#23483D] mb-3" strokeWidth={1.5} />
              <h2 className="font-display text-2xl font-semibold text-[#17372F]">
                From the Desk
              </h2>
              <p className="font-serif text-sm leading-relaxed text-[#40352D]/80 mt-2">
                {settings?.authorName || 'Vinit Singh Rajput'} ·{' '}
                {settings?.authorLocation || 'India'}
              </p>

              {settings?.contactEmail && (
                <div className="mt-5 pt-4 border-t border-[#40352D]/12">
                  <p className="font-sans text-xs text-[#40352D]/60">Email</p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="font-sans text-sm font-medium text-[#23483D] hover:text-[#B96F4E] underline underline-offset-4 break-all"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}

              {socials.length > 0 && (
                <div className="mt-5 pt-4 border-t border-[#40352D]/12">
                  <p className="font-sans text-xs text-[#40352D]/60 mb-2">
                    Social Channels
                  </p>
                  <ul className="space-y-1.5 font-sans text-sm">
                    {socials.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#23483D] hover:text-[#B96F4E] underline underline-offset-4"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#EFE2CC]/45 border border-[#B69A61]/35 rounded-2xl p-6 sm:p-9">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
