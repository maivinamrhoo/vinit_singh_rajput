import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, BookOpen, Feather, FileText, StickyNote } from 'lucide-react';
import { searchSite } from '../services/api';
import type { SearchResults } from '../types/content';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 60);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setError(null);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await searchSite(trimmed);
        if (!controller.signal.aborted) {
          setResults(res);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(err?.message || 'Could not complete search.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [query, open]);

  if (!open) return null;

  const totalCount = results
    ? results.books.length +
      results.journalPosts.length +
      results.poems.length +
      results.notes.length
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#17372F]/55 backdrop-blur-xs px-4 pt-16 sm:pt-24 pb-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Search the literary archive"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-[#F8F1E6] border border-[#B69A61]/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#40352D]/10">
          <Search className="w-5 h-5 text-[#23483D] shrink-0" />
          <label htmlFor="site-search-input" className="sr-only">
            Search books, journal, poetry, and notes
          </label>
          <input
            id="site-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, journal essays, poetry, or desk notes..."
            className="w-full bg-transparent text-[#40352D] placeholder:text-[#40352D]/45 font-sans text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults(null);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 text-xs font-sans text-[#40352D]/70 hover:text-[#17372F] transition-colors whitespace-nowrap shrink-0"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 rounded-lg text-[#40352D]/70 hover:text-[#17372F] hover:bg-[#EFE2CC] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-5">
          {!query.trim() && (
            <div className="py-8 text-center">
              <p className="font-display text-2xl text-[#17372F] mb-2">
                Search the Library
              </p>
              <p className="font-sans text-sm text-[#40352D]/65 max-w-md mx-auto">
                Type a title, theme, phrase, or language (English, Hindi, Hinglish) to
                discover books, journal articles, poems, and writing notes.
              </p>
            </div>
          )}

          {loading && (
            <div className="py-8 text-center font-sans text-sm text-[#40352D]/65">
              Searching the pages...
            </div>
          )}

          {error && (
            <div className="py-6 text-center font-sans text-sm text-[#B96F4E]">
              {error}
            </div>
          )}

          {!loading && results && totalCount === 0 && (
            <div className="py-10 text-center">
              <p className="font-display text-2xl text-[#17372F] mb-2">
                No matching pages found
              </p>
              <p className="font-sans text-sm text-[#40352D]/65 mb-4">
                Nothing matched &ldquo;{results.query}&rdquo;. Try another keyword or browse
                by section.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-4 py-2 text-xs font-sans font-medium text-[#F8F1E6] bg-[#23483D] rounded-lg hover:bg-[#17372F] transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && results && totalCount > 0 && (
            <div className="space-y-6">
              {results.books.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] mb-2.5">
                    <BookOpen className="w-4 h-4 text-[#B69A61]" />
                    Books ({results.books.length})
                  </h3>
                  <ul className="divide-y divide-[#40352D]/10">
                    {results.books.map((book) => (
                      <li key={book.id}>
                        <Link
                          to={`/books/${book.slug}`}
                          onClick={onClose}
                          className="block py-3 hover:bg-[#EFE2CC]/60 px-3 -mx-3 rounded-lg transition-colors"
                        >
                          <div className="font-display text-xl font-medium text-[#17372F]">
                            {book.title}
                          </div>
                          <div className="font-sans text-xs text-[#40352D]/65 mt-0.5">
                            {book.category} · {book.language} ·{' '}
                            {book.status === 'upcoming' ? 'Upcoming' : 'Published'}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.journalPosts.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] mb-2.5">
                    <FileText className="w-4 h-4 text-[#B69A61]" />
                    Journal ({results.journalPosts.length})
                  </h3>
                  <ul className="divide-y divide-[#40352D]/10">
                    {results.journalPosts.map((post) => (
                      <li key={post.id}>
                        <Link
                          to={`/journal/${post.slug}`}
                          onClick={onClose}
                          className="block py-3 hover:bg-[#EFE2CC]/60 px-3 -mx-3 rounded-lg transition-colors"
                        >
                          <div className="font-display text-xl font-medium text-[#17372F]">
                            {post.title}
                          </div>
                          <div className="font-sans text-xs text-[#40352D]/65 mt-0.5 line-clamp-1">
                            {post.category} · {post.excerpt}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.poems.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] mb-2.5">
                    <Feather className="w-4 h-4 text-[#B69A61]" />
                    Poetry ({results.poems.length})
                  </h3>
                  <ul className="divide-y divide-[#40352D]/10">
                    {results.poems.map((poem) => (
                      <li key={poem.id}>
                        <Link
                          to={`/poetry/${poem.slug}`}
                          onClick={onClose}
                          className="block py-3 hover:bg-[#EFE2CC]/60 px-3 -mx-3 rounded-lg transition-colors"
                        >
                          <div className="font-display text-xl font-medium text-[#17372F]">
                            {poem.title}
                          </div>
                          <div className="font-sans text-xs text-[#40352D]/65 mt-0.5">
                            {poem.language} · {poem.category}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {results.notes.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] mb-2.5">
                    <StickyNote className="w-4 h-4 text-[#B69A61]" />
                    Notes ({results.notes.length})
                  </h3>
                  <ul className="divide-y divide-[#40352D]/10">
                    {results.notes.map((note) => (
                      <li key={note.id}>
                        <Link
                          to="/notes"
                          onClick={onClose}
                          className="block py-3 hover:bg-[#EFE2CC]/60 px-3 -mx-3 rounded-lg transition-colors"
                        >
                          <div className="font-display text-xl font-medium text-[#17372F]">
                            {note.title}
                          </div>
                          <div className="font-sans text-xs text-[#40352D]/65 mt-0.5 line-clamp-1">
                            {note.category} · {note.body}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
