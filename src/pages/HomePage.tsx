import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ExternalLink, BookOpen, Feather } from 'lucide-react';
import { fetchHome } from '../services/api';
import type { HomePayload } from '../types/content';
import { SafeImage } from '../components/SafeImage';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { BookCard } from '../components/BookCard';
import { ContactForm } from '../components/ContactForm';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import {
  estimateReadingTime,
  formatLiteraryDate,
  sanitizeExternalUrl,
} from '../lib/contentUtils';

export function HomePage() {
  const [data, setData] = useState<HomePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useDocumentMeta({
    title: 'Vinit Singh Rajput — Author, Writer & Poet',
    description:
      'Welcome to the literary world of Vinit Singh Rajput — books, reflections from the writing journal, poetry in English, Hindi, and Hinglish, and upcoming releases.',
  });

  useEffect(() => {
    fetchHome()
      .then((payload) => {
        setData(payload);
        setError(null);
      })
      .catch((err: any) => {
        setError(err?.message || 'Could not load homepage content.');
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    if (!data) return ['All'];
    const set = new Set<string>();
    data.books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [data]);

  const filteredBooks = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'All') return data.books;
    return data.books.filter((b) => b.category === selectedCategory);
  }, [data, selectedCategory]);

  const featuredExternalLink = useMemo(() => {
    const fb = data?.featuredBook;
    if (!fb) return null;
    const candidates = [
      { label: 'Read on Google Play Books', url: sanitizeExternalUrl(fb.googlePlayUrl) },
      { label: 'View on Amazon', url: sanitizeExternalUrl(fb.amazonUrl) },
      { label: 'Read on Wattpad', url: sanitizeExternalUrl(fb.wattpadUrl) },
      ...(fb.otherLinks || []).map((l) => ({
        label: l.label,
        url: sanitizeExternalUrl(l.url),
      })),
    ].filter((c) => Boolean(c.url));
    return candidates[0] || null;
  }, [data]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 space-y-12">
        <div className="h-[460px] rounded-2xl bg-[#EFE2CC]/70 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-[#EFE2CC]/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-[#17372F] mb-3">
          The library is momentarily quiet
        </h1>
        <p className="font-serif text-[#40352D]/75 mb-6">
          {error || 'Unable to reach the reading archive right now.'}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
        >
          Refresh page
        </button>
      </div>
    );
  }

  const { settings, featuredBook, upcomingBooks, journalPosts, poems } = data;

  return (
    <div className="paper-grain">
      {/* A. HERO SECTION — Illustrated Storybook Landscape */}
      <section className="relative overflow-hidden border-b border-[#40352D]/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Editorial Copy Column */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 flex flex-col justify-center py-2"
            >
              <p className="font-hand text-xl sm:text-2xl text-[#B96F4E] mb-3 [text-wrap:balance]">
                From the writing desk of {settings.authorName}
              </p>

              <h1 className="font-display text-[2.5rem] sm:text-[3.1rem] lg:text-[3.45rem] font-semibold leading-[1.08] tracking-[-0.01em] text-[#17372F]">
                {settings.heroHeading}
              </h1>

              <p className="font-serif text-[16px] sm:text-[17px] leading-[1.75] text-[#40352D]/85 mt-6 max-w-prose">
                {settings.heroDescription}
              </p>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3.5 mt-8">
                <Link
                  to="/books"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors whitespace-nowrap"
                >
                  Explore My Books
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/journal"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-[#23483D]/35 text-[#17372F] font-sans text-sm font-medium hover:bg-[#EFE2CC] transition-colors whitespace-nowrap"
                >
                  Enter the Journal
                </Link>
              </div>
            </motion.div>

            {/* Panoramic Watercolor Literary Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex"
            >
              <div className="relative w-full rounded-2xl overflow-hidden border border-[#B69A61]/35 bg-[#EFE2CC] shadow-md min-h-[260px] sm:min-h-[360px] lg:h-full">
                <SafeImage
                  src={settings.heroImage}
                  alt="Watercolor literary illustration of an open storybook on a vintage writing desk beside an arched window overlooking misty hills and distant castle spires"
                  fallbackTitle={settings.authorName}
                  eager
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* B. FEATURED BOOK SHOWCASE */}
      {featuredBook && (
        <section className="py-16 sm:py-20 bg-[#EFE2CC]/65 border-b border-[#40352D]/10">
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              <div className="lg:col-span-5 flex justify-center">
                <Link
                  to={`/books/${featuredBook.slug}`}
                  className="block w-full max-w-[320px] aspect-[3/4] rounded-xl overflow-hidden border border-[#B69A61]/40 shadow-lg bg-[#F8F1E6] transition-transform duration-300 hover:-translate-y-1"
                >
                  <SafeImage
                    src={featuredBook.coverImage}
                    alt={`Cover of ${featuredBook.title}`}
                    fallbackTitle={featuredBook.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              </div>

              <div className="lg:col-span-7">
                <p className="font-hand text-xl text-[#B96F4E] mb-1">
                  Featured Volume
                </p>
                <div className="font-sans text-xs text-[#40352D]/70 flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                  <span>{featuredBook.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{featuredBook.language}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-[#23483D]">
                    {featuredBook.status === 'upcoming' ? 'Upcoming Release' : 'Published'}
                  </span>
                  {featuredBook.isDemo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="italic text-[#40352D]/55">Demo Placeholder</span>
                    </>
                  )}
                </div>

                <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold text-[#17372F] leading-tight">
                  {featuredBook.title}
                </h2>

                {featuredBook.subtitle && (
                  <p className="font-serif italic text-lg text-[#40352D]/75 mt-2">
                    {featuredBook.subtitle}
                  </p>
                )}

                <p className="font-serif text-[16px] leading-[1.8] text-[#40352D]/85 mt-5 max-w-2xl">
                  {featuredBook.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-3.5 mt-8">
                  <Link
                    to={`/books/${featuredBook.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors whitespace-nowrap"
                  >
                    View Book
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {featuredExternalLink && (
                    <a
                      href={featuredExternalLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#23483D]/35 text-[#17372F] font-sans text-sm font-medium hover:bg-[#F8F1E6] transition-colors whitespace-nowrap"
                    >
                      {featuredExternalLink.label}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* C. THE BOOKSHELF */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="font-hand text-xl text-[#B96F4E]">Curated Catalogue</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#17372F] mt-1">
                The Bookshelf
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {categories.length > 1 && (
                <div
                  role="tablist"
                  aria-label="Filter books by category"
                  className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#EFE2CC]/80 border border-[#40352D]/10"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-md font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[#23483D] text-[#F8F1E6]'
                          : 'text-[#40352D]/80 hover:text-[#17372F]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              <Link
                to="/books"
                className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors whitespace-nowrap"
              >
                View all books
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="rounded-2xl border border-[#40352D]/12 bg-[#EFE2CC]/40 p-12 text-center">
              <BookOpen className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
              <p className="font-display text-2xl text-[#17372F]">
                The shelf is awaiting its next volume
              </p>
              <p className="font-serif text-sm text-[#40352D]/70 mt-2 max-w-md mx-auto">
                Books published from the author desk will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredBooks.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>

      <BotanicalDivider className="py-2" />

      {/* D. WORDS FROM MY JOURNAL */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-hand text-xl text-[#B96F4E]">Essays &amp; Notebook Pages</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#17372F] mt-1">
                Words From My Journal
              </h2>
            </div>
            <Link
              to="/journal"
              className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors whitespace-nowrap"
            >
              Read the full journal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {journalPosts.length === 0 ? (
            <div className="rounded-2xl border border-[#40352D]/12 bg-[#EFE2CC]/40 p-12 text-center">
              <p className="font-display text-2xl text-[#17372F]">
                No journal essays published yet
              </p>
              <p className="font-serif text-sm text-[#40352D]/70 mt-2">
                New essays and reflections from the writing desk will appear here soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {journalPosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex flex-col bg-[#F8F1E6] border border-[#40352D]/12 rounded-2xl overflow-hidden hover:border-[#B69A61]/60 transition-colors"
                >
                  <Link
                    to={`/journal/${post.slug}`}
                    className="block aspect-[4/3] overflow-hidden bg-[#EFE2CC]"
                  >
                    <SafeImage
                      src={post.coverImage}
                      alt={post.title}
                      fallbackTitle={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  </Link>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>{post.category}</span>
                      {post.publishedAt && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{formatLiteraryDate(post.publishedAt)}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{estimateReadingTime(post.content)} min read</span>
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#17372F] mt-2 leading-snug group-hover:text-[#B96F4E] transition-colors">
                      <Link to={`/journal/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="font-serif text-[14.5px] leading-relaxed text-[#40352D]/80 mt-3 line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 pt-4 border-t border-[#40352D]/10">
                      <Link
                        to={`/journal/${post.slug}`}
                        className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors whitespace-nowrap"
                      >
                        Read article
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* E. POETRY SECTION — Warm Parchment Sanctuary */}
      <section className="py-16 sm:py-24 bg-[#EFE2CC]/75 border-y border-[#B69A61]/30">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-hand text-2xl text-[#B96F4E]">
              Verses in English, Hindi &amp; Hinglish
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#17372F] mt-1">
              Selected Poetry
            </h2>
            <p className="font-serif text-[15.5px] text-[#40352D]/75 mt-3">
              Quiet stanzas written across languages, preserved with their original breath
              and cadence.
            </p>
          </div>

          {poems.length === 0 ? (
            <div className="rounded-2xl border border-[#40352D]/12 bg-[#F8F1E6] p-12 text-center max-w-xl mx-auto">
              <Feather className="w-7 h-7 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
              <p className="font-display text-2xl text-[#17372F]">
                Poems coming soon
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {poems.map((poem) => (
                <article
                  key={poem.id}
                  className="bg-[#F8F1E6] border border-[#B69A61]/35 rounded-2xl p-7 flex flex-col justify-between hover:border-[#23483D]/40 transition-colors"
                >
                  <div>
                    <div className="font-sans text-xs text-[#40352D]/65 flex items-center gap-2 mb-3">
                      <span className="text-[#B96F4E] font-medium">{poem.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{poem.category}</span>
                      {poem.isDemo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="italic">Demo</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-2xl font-semibold text-[#17372F] leading-snug">
                      <Link
                        to={`/poetry/${poem.slug}`}
                        className="hover:text-[#B96F4E] transition-colors"
                      >
                        {poem.title}
                      </Link>
                    </h3>

                    {poem.subtitle && (
                      <p className="font-serif italic text-xs text-[#40352D]/65 mt-1">
                        {poem.subtitle}
                      </p>
                    )}

                    <div className="mt-5 font-serif text-[15px] leading-[1.9] text-[#40352D]/85 whitespace-pre-line line-clamp-6">
                      {poem.body}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#40352D]/10">
                    <Link
                      to={`/poetry/${poem.slug}`}
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors"
                    >
                      Read full poem
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/poetry"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#23483D]/35 text-[#17372F] font-sans text-sm font-medium hover:bg-[#F8F1E6] transition-colors"
            >
              Explore All Poetry
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* F. ABOUT THE AUTHOR — Forest Green Editorial Contrast Block */}
      <section className="py-16 sm:py-24 bg-[#23483D] text-[#F8F1E6]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border border-[#EFE2CC]/25 shadow-xl bg-[#17372F]">
                <SafeImage
                  src={settings.authorPhoto}
                  alt={`Portrait of ${settings.authorName}`}
                  fallbackTitle={settings.authorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="font-hand text-2xl text-[#DDA7A0] mb-1">
                About the Author
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-semibold text-[#F8F1E6] leading-tight">
                {settings.authorName}
              </h2>
              <p className="font-sans text-xs tracking-wide text-[#EFE2CC]/70 mt-2">
                Author &amp; Writer · {settings.authorLocation}
              </p>

              <p className="font-serif text-[16px] leading-[1.85] text-[#EFE2CC]/90 mt-6">
                {settings.authorBio}
              </p>

              {settings.writingPhilosophy && (
                <blockquote className="mt-7 py-5 border-y border-[#EFE2CC]/20">
                  <p className="font-display text-2xl italic text-[#F8F1E6] leading-relaxed">
                    &ldquo;{settings.writingPhilosophy}&rdquo;
                  </p>
                </blockquote>
              )}

              <div className="mt-8">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#F8F1E6] text-[#17372F] font-sans text-sm font-medium hover:bg-[#EFE2CC] transition-colors whitespace-nowrap"
                >
                  Read More About Vinit
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G. UPCOMING RELEASES */}
      <section className="py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl mb-10">
            <p className="font-hand text-xl text-[#B96F4E]">In Progress &amp; Forthcoming</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#17372F] mt-1">
              Upcoming Releases
            </h2>
          </div>

          {upcomingBooks.length === 0 ? (
            <div className="rounded-2xl border border-[#B69A61]/35 bg-[#EFE2CC]/45 px-8 py-12 text-center max-w-2xl mx-auto">
              <BookOpen className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
              <h3 className="font-display text-2xl font-medium text-[#17372F]">
                Quietly drafting the next chapter
              </h3>
              <p className="font-serif text-[15px] text-[#40352D]/75 mt-2 leading-relaxed">
                There are no announced upcoming releases at this moment. Visit the{' '}
                <Link
                  to="/notes"
                  className="text-[#23483D] underline underline-offset-4 hover:text-[#B96F4E]"
                >
                  writing notes
                </Link>{' '}
                or{' '}
                <Link
                  to="/journal"
                  className="text-[#23483D] underline underline-offset-4 hover:text-[#B96F4E]"
                >
                  journal
                </Link>{' '}
                to follow new work as it takes shape.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingBooks.map((book) => (
                <article
                  key={book.id}
                  className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-[#EFE2CC]/55 border border-[#B69A61]/35"
                >
                  <Link
                    to={`/books/${book.slug}`}
                    className="w-full sm:w-36 aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-[#F8F1E6] border border-[#40352D]/12"
                  >
                    <SafeImage
                      src={book.coverImage}
                      alt={`Upcoming cover for ${book.title}`}
                      fallbackTitle={book.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="font-sans text-xs text-[#B96F4E] font-medium flex flex-wrap items-center gap-x-2">
                        <span>Upcoming</span>
                        {book.publicationDate && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#40352D]/70 font-normal">
                              Expected {formatLiteraryDate(book.publicationDate)}
                            </span>
                          </>
                        )}
                        {book.isDemo && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#40352D]/55 italic font-normal">
                              Demo Placeholder
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-[#17372F] mt-1.5">
                        <Link
                          to={`/books/${book.slug}`}
                          className="hover:text-[#B96F4E] transition-colors"
                        >
                          {book.title}
                        </Link>
                      </h3>
                      <p className="font-serif text-sm leading-relaxed text-[#40352D]/80 mt-2.5">
                        {book.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        to={`/books/${book.slug}`}
                        className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors"
                      >
                        Preview details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* H. CONTACT SECTION */}
      <section className="py-16 sm:py-20 bg-[#EFE2CC]/70 border-t border-[#40352D]/10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="font-hand text-2xl text-[#B96F4E]">Write a Letter</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#17372F] mt-1">
                Get in Touch
              </h2>
              <p className="font-serif text-[15.5px] leading-relaxed text-[#40352D]/80 mt-4">
                Whether you are a reader sharing a thought about a chapter, a literary
                journal editor, or reaching out regarding collaborations, your message is
                always welcome.
              </p>
              {settings.contactEmail && (
                <p className="font-sans text-sm text-[#23483D] mt-5">
                  Direct email:{' '}
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="underline decoration-[#B69A61] underline-offset-4 hover:text-[#B96F4E]"
                  >
                    {settings.contactEmail}
                  </a>
                </p>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#F8F1E6] border border-[#B69A61]/35 rounded-2xl p-6 sm:p-8 shadow-xs">
              <ContactForm compact />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
