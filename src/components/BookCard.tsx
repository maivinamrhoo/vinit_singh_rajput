import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SafeImage } from './SafeImage';
import type { Book } from '../types/content';
import { formatLiteraryDate } from '../lib/contentUtils';

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="group flex flex-col">
      <Link
        to={`/books/${book.slug}`}
        className="block relative aspect-[3/4] rounded-xl overflow-hidden bg-[#EFE2CC] border border-[#40352D]/12 shadow-sm transition-transform duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-md"
      >
        <SafeImage
          src={book.coverImage}
          alt={`Cover of ${book.title} by ${book.author}`}
          fallbackTitle={book.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>

      <div className="pt-4 flex-1 flex flex-col">
        <div className="font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>{book.category}</span>
          <span aria-hidden="true">·</span>
          <span
            className={
              book.status === 'upcoming'
                ? 'text-[#B96F4E] font-medium'
                : 'text-[#23483D]'
            }
          >
            {book.status === 'upcoming' ? 'Upcoming Release' : 'Published'}
          </span>
          {book.isDemo && (
            <>
              <span aria-hidden="true">·</span>
              <span className="italic text-[#40352D]/55">Demo Placeholder</span>
            </>
          )}
        </div>

        <h3 className="font-display text-2xl font-semibold text-[#17372F] mt-1.5 leading-snug group-hover:text-[#B96F4E] transition-colors">
          <Link to={`/books/${book.slug}`}>{book.title}</Link>
        </h3>

        {book.subtitle && (
          <p className="font-serif italic text-sm text-[#40352D]/70 mt-1 line-clamp-1">
            {book.subtitle}
          </p>
        )}

        <p className="font-serif text-[14.5px] leading-relaxed text-[#40352D]/80 mt-2.5 line-clamp-3 flex-1">
          {book.shortDescription}
        </p>

        <div className="mt-4 pt-3 border-t border-[#40352D]/10 flex items-center justify-between gap-2">
          <Link
            to={`/books/${book.slug}`}
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors whitespace-nowrap"
          >
            View Book
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          {book.publicationDate && (
            <span className="font-sans text-xs text-[#40352D]/55">
              {formatLiteraryDate(book.publicationDate)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
