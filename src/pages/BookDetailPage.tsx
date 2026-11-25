import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { fetchPublicBook, fetchPublicBooks } from '../services/api';
import type { Book } from '../types/content';
import { SafeImage } from '../components/SafeImage';
import { FormattedProse } from '../components/FormattedProse';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { BookCard } from '../components/BookCard';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatLiteraryDate, sanitizeExternalUrl } from '../lib/contentUtils';

export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([fetchPublicBook(slug), fetchPublicBooks().catch(() => [])])
      .then(([found, all]) => {
        setBook(found);
        setOtherBooks(all.filter((b) => b.slug !== slug).slice(0, 3));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const jsonLd = useMemo(() => {
    if (!book) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: book.title,
      author: {
        '@type': 'Person',
        name: book.author || 'Vinit Singh Rajput',
      },
      inLanguage: book.language,
      genre: book.category,
      description: book.seoDescription || book.shortDescription,
      ...(book.publicationDate ? { datePublished: book.publicationDate } : {}),
    };
  }, [book]);

  useDocumentMeta({
    title: book
      ? book.seoTitle || `${book.title} — ${book.author}`
      : 'Book Details — Vinit Singh Rajput',
    description:
      book?.seoDescription ||
      book?.shortDescription ||
      'Book details from the literary library of Vinit Singh Rajput.',
    type: 'book',
    image: book?.coverImage,
    jsonLd,
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-16">
        <div className="h-96 rounded-2xl bg-[#EFE2CC]/65 animate-pulse" />
      </div>
    );
  }

  if (notFound || !book) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-[#17372F]">Book not found</h1>
        <p className="font-serif text-[#40352D]/75 mt-3">
          This volume may be unpublished or its address may have changed.
        </p>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Books
        </Link>
      </div>
    );
  }

  const externalLinks = [
    { label: 'Google Play Books', url: sanitizeExternalUrl(book.googlePlayUrl) },
    { label: 'Amazon', url: sanitizeExternalUrl(book.amazonUrl) },
    { label: 'Wattpad', url: sanitizeExternalUrl(book.wattpadUrl) },
    ...(book.otherLinks || []).map((l) => ({
      label: l.label,
      url: sanitizeExternalUrl(l.url),
    })),
  ].filter((l) => Boolean(l.url));

  return (
    <div className="paper-grain">
      <article className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 pb-20">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to The Bookshelf
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Framed Cover */}
          <div className="md:col-span-5">
            <div className="aspect-[3/4] max-w-sm mx-auto rounded-2xl overflow-hidden bg-[#EFE2CC] border border-[#B69A61]/40 shadow-lg">
              <SafeImage
                src={book.coverImage}
                alt={`Cover of ${book.title} by ${book.author}`}
                fallbackTitle={book.title}
                eager
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Details & Links */}
          <div className="md:col-span-7">
            <div className="font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>{book.category}</span>
              <span aria-hidden="true">·</span>
              <span>{book.language}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  book.status === 'upcoming'
                    ? 'text-[#B96F4E] font-medium'
                    : 'text-[#23483D] font-medium'
                }
              >
                {book.status === 'upcoming' ? 'Upcoming Release' : 'Published'}
              </span>
              {book.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="italic">Demo Placeholder</span>
                </>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-2 leading-[1.1]">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="font-serif italic text-lg text-[#40352D]/75 mt-2.5">
                {book.subtitle}
              </p>
            )}

            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 my-6 border-y border-[#40352D]/12 font-sans">
              <div>
                <dt className="text-[11px] text-[#40352D]/55">Author</dt>
                <dd className="text-sm font-medium text-[#17372F] mt-0.5">
                  <Link to="/about" className="hover:text-[#B96F4E] transition-colors">
                    {book.author}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] text-[#40352D]/55">Language</dt>
                <dd className="text-sm font-medium text-[#17372F] mt-0.5">
                  {book.language}
                </dd>
              </div>
              {book.publicationDate && (
                <div>
                  <dt className="text-[11px] text-[#40352D]/55">
                    {book.status === 'upcoming' ? 'Expected Release' : 'Published'}
                  </dt>
                  <dd className="text-sm font-medium text-[#17372F] mt-0.5">
                    {formatLiteraryDate(book.publicationDate)}
                  </dd>
                </div>
              )}
            </dl>

            <p className="font-serif text-[16.5px] leading-[1.8] text-[#40352D]/90">
              {book.shortDescription}
            </p>

            {externalLinks.length > 0 && (
              <div className="mt-7">
                <p className="font-sans text-xs font-medium text-[#40352D]/70 mb-3">
                  Read or Purchase
                </p>
                <div className="flex flex-wrap gap-3">
                  {externalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-sans text-sm font-medium transition-colors whitespace-nowrap ${
                        idx === 0
                          ? 'bg-[#23483D] text-[#F8F1E6] hover:bg-[#17372F]'
                          : 'border border-[#23483D]/35 text-[#17372F] hover:bg-[#EFE2CC]'
                      }`}
                    >
                      {link.label}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {book.fullDescription && (
          <div className="mt-14 pt-12 border-t border-[#40352D]/12 max-w-3xl">
            <h2 className="font-display text-3xl font-semibold text-[#17372F] mb-6">
              About This Book
            </h2>
            <FormattedProse content={book.fullDescription} dropCap />
          </div>
        )}

        {otherBooks.length > 0 && (
          <section className="mt-20">
            <BotanicalDivider className="mb-12" />
            <h2 className="font-display text-3xl font-semibold text-[#17372F] mb-8">
              More From the Bookshelf
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherBooks.map((item) => (
                <BookCard key={item.id} book={item} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
