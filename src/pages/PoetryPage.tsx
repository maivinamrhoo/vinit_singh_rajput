import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Feather } from 'lucide-react';
import { fetchPublicPoems } from '../services/api';
import type { Poem, PoemLanguage } from '../types/content';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const LANGUAGES: Array<'All' | PoemLanguage> = ['All', 'English', 'Hindi', 'Hinglish'];

export function PoetryPage() {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'All' | PoemLanguage>('All');
  const [category, setCategory] = useState('All');

  useDocumentMeta({
    title: 'Poetry — Vinit Singh Rajput',
    description:
      'Read original poems in English, Hindi, and Hinglish by Vinit Singh Rajput.',
  });

  useEffect(() => {
    fetchPublicPoems()
      .then(setPoems)
      .catch((err: any) => setError(err?.message || 'Could not load poetry.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    poems.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [poems]);

  const filtered = useMemo(() => {
    return poems.filter((p) => {
      const langOk = language === 'All' || p.language === language;
      const catOk = category === 'All' || p.category === category;
      return langOk && catOk;
    });
  }, [poems, language, category]);

  return (
    <div className="paper-grain min-h-[70vh]">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-10 text-center">
        <p className="font-hand text-2xl text-[#B96F4E]">
          Verses in English, Hindi &amp; Hinglish
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
          Poetry Archive
        </h1>
        <p className="font-serif text-[16px] text-[#40352D]/80 max-w-2xl mx-auto mt-4 leading-relaxed">
          Lines written for unhurried evenings, preserved with their natural line breaks and
          linguistic cadence.
        </p>
        <BotanicalDivider className="mt-8" />
      </section>

      <section className="max-w-5xl mx-auto px-5 sm:px-8 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#40352D]/12">
          <div
            role="tablist"
            aria-label="Filter poetry by language"
            className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#EFE2CC]/80 border border-[#40352D]/10 self-start"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                type="button"
                role="tab"
                aria-selected={language === lang}
                onClick={() => setLanguage(lang)}
                className={`px-3.5 py-1.5 rounded-md font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                  language === lang
                    ? 'bg-[#23483D] text-[#F8F1E6]'
                    : 'text-[#40352D]/80 hover:text-[#17372F]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                    category === cat
                      ? 'bg-[#B96F4E] text-[#F8F1E6]'
                      : 'text-[#40352D]/75 hover:bg-[#EFE2CC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-[#EFE2CC]/60 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="py-12 text-center font-sans text-sm text-[#B96F4E]">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#B69A61]/35 bg-[#EFE2CC]/45 p-14 text-center max-w-xl mx-auto">
            <Feather className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
            <h2 className="font-display text-2xl text-[#17372F]">No poems found</h2>
            <p className="font-serif text-sm text-[#40352D]/75 mt-2">
              Try selecting another language or theme above.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((poem) => (
              <article
                key={poem.id}
                className="bg-[#EFE2CC]/55 border border-[#B69A61]/35 rounded-2xl p-8 flex flex-col justify-between hover:border-[#23483D]/40 transition-colors"
              >
                <div>
                  <div className="font-sans text-xs text-[#40352D]/65 flex items-center gap-2 mb-3">
                    <span className="text-[#B96F4E] font-medium">{poem.language}</span>
                    <span aria-hidden="true">·</span>
                    <span>{poem.category}</span>
                    {poem.isDemo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic">Demo Placeholder</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-display text-3xl font-semibold text-[#17372F] leading-snug">
                    <Link
                      to={`/poetry/${poem.slug}`}
                      className="hover:text-[#B96F4E] transition-colors"
                    >
                      {poem.title}
                    </Link>
                  </h2>

                  {poem.subtitle && (
                    <p className="font-serif italic text-sm text-[#40352D]/70 mt-1">
                      {poem.subtitle}
                    </p>
                  )}

                  <div className="mt-5 font-serif text-[15.5px] leading-[1.95] text-[#40352D]/90 whitespace-pre-line line-clamp-6">
                    {poem.body}
                  </div>
                </div>

                <div className="mt-7 pt-4 border-t border-[#40352D]/12">
                  <Link
                    to={`/poetry/${poem.slug}`}
                    className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors"
                  >
                    Read in full
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
