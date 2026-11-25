import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { fetchPublicPoem, fetchPublicPoems } from '../services/api';
import type { Poem } from '../types/content';
import { BotanicalDivider, InkNibFlourish } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function PoemDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [allPoems, setAllPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([fetchPublicPoem(slug), fetchPublicPoems().catch(() => [])])
      .then(([found, list]) => {
        setPoem(found);
        setAllPoems(list);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const jsonLd = useMemo(() => {
    if (!poem) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: poem.title,
      inLanguage: poem.language,
      genre: 'Poetry',
      author: {
        '@type': 'Person',
        name: 'Vinit Singh Rajput',
      },
    };
  }, [poem]);

  useDocumentMeta({
    title: poem ? `${poem.title} — Poetry | Vinit Singh Rajput` : 'Poetry — Vinit Singh Rajput',
    description: poem
      ? `${poem.title} (${poem.language} poem) by Vinit Singh Rajput.`
      : 'Original poetry by Vinit Singh Rajput.',
    type: 'article',
    jsonLd,
  });

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20">
        <div className="h-96 rounded-2xl bg-[#EFE2CC]/70 animate-pulse" />
      </div>
    );
  }

  if (notFound || !poem) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-[#17372F]">Poem not found</h1>
        <Link
          to="/poetry"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Poetry
        </Link>
      </div>
    );
  }

  const currentIdx = allPoems.findIndex((p) => p.slug === poem.slug);
  const nextPoem =
    currentIdx >= 0 && allPoems.length > 1
      ? allPoems[(currentIdx + 1) % allPoems.length]
      : null;

  return (
    <div className="paper-grain py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <Link
          to="/poetry"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Poetry
        </Link>

        <article className="bg-[#EFE2CC]/65 border border-[#B69A61]/40 rounded-2xl px-7 sm:px-14 py-12 sm:py-16 shadow-xs">
          <div className="text-center">
            <div className="font-sans text-xs text-[#40352D]/65 flex items-center justify-center gap-2">
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

            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-3 leading-tight">
              {poem.title}
            </h1>

            {poem.subtitle && (
              <p className="font-serif italic text-base text-[#40352D]/70 mt-2">
                {poem.subtitle}
              </p>
            )}
          </div>

          <BotanicalDivider className="my-8" />

          <div
            lang={poem.language === 'Hindi' ? 'hi' : 'en'}
            className="font-serif text-[17.5px] sm:text-[18.5px] leading-[2.05] text-[#40352D] whitespace-pre-line max-w-[48ch] mx-auto"
          >
            {poem.body}
          </div>

          <div className="mt-12 pt-6 border-t border-[#40352D]/12 flex flex-col items-center text-center">
            <InkNibFlourish className="text-[#B69A61] mb-2" />
            <p className="font-hand text-2xl text-[#23483D]">Vinit Singh Rajput</p>
          </div>
        </article>

        {nextPoem && (
          <div className="mt-10 flex items-center justify-between gap-4 px-2">
            <Link
              to="/poetry"
              className="font-sans text-xs text-[#40352D]/70 hover:text-[#17372F]"
            >
              Browse all verses
            </Link>
            <Link
              to={`/poetry/${nextPoem.slug}`}
              className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors"
            >
              Next: {nextPoem.title}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
