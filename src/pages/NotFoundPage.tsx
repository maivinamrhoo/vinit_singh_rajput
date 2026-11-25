import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function NotFoundPage() {
  useDocumentMeta({
    title: 'Page Not Found — Vinit Singh Rajput',
    description: 'The requested page could not be found in the literary archive.',
  });

  return (
    <div className="paper-grain min-h-[70vh] flex items-center justify-center px-5 py-20">
      <div className="max-w-xl text-center bg-[#EFE2CC]/60 border border-[#B69A61]/40 rounded-2xl px-8 py-14">
        <BookOpen className="w-10 h-10 text-[#B69A61] mx-auto mb-4" strokeWidth={1.3} />
        <p className="font-hand text-2xl text-[#B96F4E]">Page 404</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
          This page has wandered off the shelf
        </h1>
        <p className="font-serif text-[15.5px] leading-relaxed text-[#40352D]/80 mt-4">
          The story, poem, or note you were looking for may have moved or has not been
          written yet.
        </p>
        <BotanicalDivider className="my-7" />
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#23483D]/35 text-[#17372F] font-sans text-sm font-medium hover:bg-[#F8F1E6] transition-colors"
          >
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}
