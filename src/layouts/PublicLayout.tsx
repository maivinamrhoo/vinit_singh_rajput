import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUp, Menu, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SearchModal } from '../components/SearchModal';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { fetchPublicSettings } from '../services/api';
import type { SiteSettings } from '../types/content';
import { sanitizeExternalUrl } from '../lib/contentUtils';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/books', label: 'Books' },
  { to: '/journal', label: 'Journal' },
  { to: '/poetry', label: 'Poetry' },
  { to: '/about', label: 'About' },
  { to: '/notes', label: 'Notes' },
  { to: '/contact', label: 'Contact' },
];

const SOCIAL_LABELS: Array<{ key: keyof SiteSettings['socialLinks']; label: string }> = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'twitter', label: 'X / Twitter' },
  { key: 'goodreads', label: 'Goodreads' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'linkedin', label: 'LinkedIn' },
];

export function PublicLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => {
        // Fallback footer defaults remain active
      });
  }, []);

  const activeSocials = SOCIAL_LABELS.map((item) => ({
    ...item,
    url: sanitizeExternalUrl(settings?.socialLinks?.[item.key] || ''),
  })).filter((item) => Boolean(item.url));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F1E6] text-[#40352D]">
      {/* Sticky Editorial Header — Clean 3-zone top bar */}
      <header className="sticky top-0 z-40 bg-[#F8F1E6]/92 backdrop-blur-md border-b border-[#40352D]/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 sm:h-[74px] flex items-center justify-between gap-8">
          <Link
            to="/"
            className="font-display text-xl sm:text-2xl font-semibold tracking-[0.06em] text-[#17372F] whitespace-nowrap shrink-0 hover:text-[#23483D] transition-colors"
          >
            VINIT SINGH RAJPUT
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `font-sans text-[13.5px] tracking-wide whitespace-nowrap shrink-0 pb-0.5 transition-colors border-b ${
                    isActive
                      ? 'text-[#17372F] font-medium border-[#B96F4E]'
                      : 'text-[#40352D]/80 border-transparent hover:text-[#17372F] hover:border-[#B69A61]/60'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Open search"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full text-[#23483D] hover:bg-[#EFE2CC] transition-colors focus-visible:outline-2 focus-visible:outline-[#23483D]"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={1.8} />
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-[#23483D] hover:bg-[#EFE2CC] transition-colors focus-visible:outline-2 focus-visible:outline-[#23483D]"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              aria-label="Mobile navigation"
              className="lg:hidden border-t border-[#40352D]/10 bg-[#F8F1E6] px-6 py-5"
            >
              <ul className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `block py-2.5 px-3 rounded-lg font-display text-xl transition-colors ${
                          isActive
                            ? 'bg-[#EFE2CC] text-[#17372F] font-semibold'
                            : 'text-[#40352D] hover:bg-[#EFE2CC]/60'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Illustrated Literary Footer */}
      <footer className="bg-[#17372F] text-[#F8F1E6] mt-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-12">
          <BotanicalDivider tone="ivory" className="mb-12 opacity-60" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#F8F1E6]/15">
            <div className="md:col-span-5">
              <Link
                to="/"
                className="font-display text-2xl sm:text-3xl font-semibold tracking-[0.06em] text-[#F8F1E6]"
              >
                VINIT SINGH RAJPUT
              </Link>
              <p className="font-hand text-xl text-[#DDA7A0] mt-1">
                Author &amp; Writer · {settings?.authorLocation || 'India'}
              </p>
              <p className="font-serif text-sm leading-relaxed text-[#EFE2CC]/80 mt-4 max-w-sm">
                {settings?.footerDescription ||
                  'An independent literary sanctuary for stories, essays, poetry, and notebook reflections by Vinit Singh Rajput.'}
              </p>
            </div>

            <div className="md:col-span-4">
              <h2 className="font-display text-xl font-medium text-[#EFE2CC] mb-4">
                Reading Rooms
              </h2>
              <ul className="grid grid-cols-2 gap-y-2.5 gap-x-4 font-sans text-sm text-[#EFE2CC]/80">
                {NAV_ITEMS.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="hover:text-[#DDA7A0] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 flex flex-col justify-between gap-6">
              {activeSocials.length > 0 ? (
                <div>
                  <h2 className="font-display text-xl font-medium text-[#EFE2CC] mb-4">
                    Elsewhere
                  </h2>
                  <ul className="space-y-2 font-sans text-sm text-[#EFE2CC]/80">
                    {activeSocials.map((s) => (
                      <li key={s.key}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[#DDA7A0] transition-colors underline decoration-[#B69A61]/40 underline-offset-4"
                        >
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <h2 className="font-display text-xl font-medium text-[#EFE2CC] mb-3">
                    Correspondence
                  </h2>
                  <p className="font-serif text-sm text-[#EFE2CC]/75 leading-relaxed">
                    Readers, editors, and fellow writers are always welcome to reach out
                    through the{' '}
                    <Link
                      to="/contact"
                      className="text-[#DDA7A0] underline underline-offset-4 hover:text-[#F8F1E6]"
                    >
                      contact page
                    </Link>
                    .
                  </p>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#EFE2CC]/25 text-xs font-sans text-[#EFE2CC] hover:bg-[#23483D] transition-colors whitespace-nowrap"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  Back to top
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#EFE2CC]/60">
            <p>
              &copy; {new Date().getFullYear()} {settings?.authorName || 'Vinit Singh Rajput'}. All
              rights reserved.
            </p>
            <p className="font-serif italic text-[#EFE2CC]/65">
              Stories, essays &amp; verse from India.
            </p>
          </div>
        </div>
      </footer>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
