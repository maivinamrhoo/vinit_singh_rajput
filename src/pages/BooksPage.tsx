import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { fetchPublicBooks } from '../services/api';
import type { Book } from '../types/content';
import { BookCard } from '../components/BookCard';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'upcoming'>('all');

  useDocumentMeta({
    title: 'Books — Vinit Singh Rajput',
    description:
      'Explore published and upcoming books by Vinit Singh Rajput, complete with synopses, categories, and official reading links.',
  });

  useEffect(() => {
    fetchPublicBooks()
      .then(setBooks)
      .catch((err: any) => setError(err?.message || 'Could not load books.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const catOk = category === 'All' || b.category === category;
      const statusOk = statusFilter === 'all' || b.status === statusFilter;
      return catOk && statusOk;
    });
  }, [books, category, statusFilter]);

  return (
    <div className="paper-grain min-h-[70vh]">
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-10 text-center">
        <p className="font-hand text-2xl text-[#B96F4E]">The Complete Library</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
          Books &amp; Manuscripts
        </h1>
        <p className="font-serif text-[16px] text-[#40352D]/80 max-w-2xl mx-auto mt-4 leading-relaxed">
          Published volumes and forthcoming works from the desk of Vinit Singh Rajput.
        </p>
        <BotanicalDivider className="mt-8" />
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#40352D]/12">
          <div
            role="tablist"
            aria-label="Filter by book category"
            className="flex flex-wrap items-center gap-1.5"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#23483D] text-[#F8F1E6]'
                    : 'bg-[#EFE2CC]/75 text-[#40352D]/80 hover:text-[#17372F] hover:bg-[#EFE2CC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            role="tablist"
            aria-label="Filter by publication status"
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#EFE2CC]/80 border border-[#40352D]/10 self-start sm:self-auto"
          >
            {(
              [
                ['all', 'All'],
                ['published', 'Published'],
                ['upcoming', 'Upcoming'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                role="tab"
                aria-selected={statusFilter === val}
                onClick={() => setStatusFilter(val)}
                className={`px-3 py-1.5 rounded-md font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                  statusFilter === val
                    ? 'bg-[#F8F1E6] text-[#17372F] shadow-xs'
                    : 'text-[#40352D]/75 hover:text-[#17372F]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-xl bg-[#EFE2CC]/60 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="py-12 text-center font-sans text-sm text-[#B96F4E]">{error}</div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#40352D]/12 bg-[#EFE2CC]/40 p-14 text-center max-w-xl mx-auto">
            <BookOpen className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
            <h2 className="font-display text-2xl text-[#17372F]">No books match this filter</h2>
            <p className="font-serif text-sm text-[#40352D]/75 mt-2">
              Try viewing all categories or check back soon for new announcements.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('All');
                setStatusFilter('all');
              }}
              className="mt-5 px-4 py-2 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-xs font-medium hover:bg-[#17372F] transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filtered.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
