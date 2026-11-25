import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { fetchPublicSettings } from '../services/api';
import type { SiteSettings } from '../types/content';
import { SafeImage } from '../components/SafeImage';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useDocumentMeta({
    title: 'About Vinit Singh Rajput — Author & Writer',
    description:
      'Meet Vinit Singh Rajput — author and writer from India. Read his biography, writing philosophy, and literary approach.',
  });

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-16">
        <div className="h-96 rounded-2xl bg-[#EFE2CC]/60 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="paper-grain">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-14 pb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="font-hand text-2xl text-[#B96F4E]">Author Portrait &amp; Story</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
            {settings?.authorName || 'Vinit Singh Rajput'}
          </h1>
          <p className="font-sans text-xs tracking-wide text-[#40352D]/65 mt-2">
            Author &amp; Writer · {settings?.authorLocation || 'India'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          <div className="lg:col-span-5">
            <div className="aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-[#B69A61]/40 shadow-md bg-[#EFE2CC]">
              <SafeImage
                src={settings?.authorPhoto}
                alt={`Author portrait of ${settings?.authorName || 'Vinit Singh Rajput'}`}
                fallbackTitle={settings?.authorName || 'Vinit Singh Rajput'}
                eager
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="font-display text-3xl font-semibold text-[#17372F] mb-4">
                Biography
              </h2>
              <p className="font-serif text-[16.5px] leading-[1.88] text-[#40352D]/90 whitespace-pre-line">
                {settings?.authorBio ||
                  'Vinit Singh Rajput is an Indian author and writer working across stories, reflective essays, and poetry.'}
              </p>
            </div>

            {settings?.writingPhilosophy && (
              <div className="py-7 px-7 rounded-2xl bg-[#EFE2CC]/65 border border-[#B69A61]/35">
                <p className="font-hand text-xl text-[#B96F4E] mb-2">
                  Writing Philosophy
                </p>
                <blockquote className="font-display text-2xl sm:text-[26px] italic leading-relaxed text-[#17372F]">
                  &ldquo;{settings.writingPhilosophy}&rdquo;
                </blockquote>
              </div>
            )}

            {settings?.literaryApproach && (
              <div>
                <h2 className="font-display text-3xl font-semibold text-[#17372F] mb-3">
                  Literary Approach &amp; Themes
                </h2>
                <p className="font-serif text-[16px] leading-[1.85] text-[#40352D]/85 whitespace-pre-line">
                  {settings.literaryApproach}
                </p>
              </div>
            )}

            <BotanicalDivider className="py-2" />

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors whitespace-nowrap"
              >
                Explore Books
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#23483D]/35 text-[#17372F] font-sans text-sm font-medium hover:bg-[#EFE2CC] transition-colors whitespace-nowrap"
              >
                Read the Journal
              </Link>
              <Link
                to="/contact"
                className="font-sans text-sm font-medium text-[#23483D] underline underline-offset-4 hover:text-[#B96F4E] px-2"
              >
                Write a letter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
