import React, { useEffect, useMemo, useState } from 'react';
import { StickyNote } from 'lucide-react';
import { fetchPublicNotes } from '../services/api';
import type { Note } from '../types/content';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { formatLiteraryDate } from '../lib/contentUtils';

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('All');

  useDocumentMeta({
    title: 'Notes — Vinit Singh Rajput',
    description:
      'Short desk notes, writing thoughts, reading updates, and announcements from Vinit Singh Rajput.',
  });

  useEffect(() => {
    fetchPublicNotes()
      .then(setNotes)
      .catch((err: any) => setError(err?.message || 'Could not load notes.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return ['All', ...Array.from(set)];
  }, [notes]);

  const filtered = useMemo(() => {
    if (category === 'All') return notes;
    return notes.filter((n) => n.category === category);
  }, [notes, category]);

  return (
    <div className="paper-grain min-h-[70vh]">
      <section className="max-w-4xl mx-auto px-5 sm:px-8 pt-14 pb-10 text-center">
        <p className="font-hand text-2xl text-[#B96F4E]">Marginalia &amp; Brief Updates</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
          Notes From the Desk
        </h1>
        <p className="font-serif text-[16px] text-[#40352D]/80 max-w-xl mx-auto mt-4 leading-relaxed">
          Shorter thoughts, manuscript milestones, and quiet announcements gathered between
          chapters.
        </p>
        <BotanicalDivider className="mt-8" />
      </section>

      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-[#23483D] text-[#F8F1E6]'
                    : 'bg-[#EFE2CC]/75 text-[#40352D]/80 hover:text-[#17372F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="space-y-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 rounded-2xl bg-[#EFE2CC]/60 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="py-12 text-center font-sans text-sm text-[#B96F4E]">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#40352D]/12 bg-[#EFE2CC]/40 p-14 text-center">
            <StickyNote className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
            <h2 className="font-display text-2xl text-[#17372F]">No notes posted yet</h2>
            <p className="font-serif text-sm text-[#40352D]/75 mt-2">
              Check back soon for fresh desk updates and reflections.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-6">
            {filtered.map((note) => (
              <article
                key={note.id}
                className="bg-[#EFE2CC]/55 border border-[#B69A61]/35 rounded-2xl p-7 sm:p-8"
              >
                <div className="font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center gap-2">
                  <span className="text-[#B96F4E] font-medium">{note.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatLiteraryDate(note.createdAt)}</span>
                  {note.isDemo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="italic">Demo Placeholder</span>
                    </>
                  )}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#17372F] mt-2">
                  {note.title}
                </h2>
                <p className="font-serif text-[16px] leading-[1.85] text-[#40352D]/85 mt-3 whitespace-pre-line">
                  {note.body}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
