import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { fetchPublicJournal } from '../services/api';
import type { JournalPost } from '../types/content';
import { SafeImage } from '../components/SafeImage';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { estimateReadingTime, formatLiteraryDate } from '../lib/contentUtils';

export function JournalPage() {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useDocumentMeta({
    title: 'Journal — Vinit Singh Rajput',
    description:
      'Essays, reflections on writing craft, literature, and notebook pages from Vinit Singh Rajput.',
  });

  useEffect(() => {
    fetchPublicJournal()
      .then(setPosts)
      .catch((err: any) => setError(err?.message || 'Could not load journal articles.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [posts]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return Array.from(set);
  }, [posts]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const catOk = selectedCategory === 'All' || p.category === selectedCategory;
      const tagOk = !selectedTag || (p.tags || []).includes(selectedTag);
      return catOk && tagOk;
    });
  }, [posts, selectedCategory, selectedTag]);

  return (
    <div className="paper-grain min-h-[70vh]">
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-10 text-center">
        <p className="font-hand text-2xl text-[#B96F4E]">Words From My Journal</p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-1">
          The Writing Journal
        </h1>
        <p className="font-serif text-[16px] text-[#40352D]/80 max-w-2xl mx-auto mt-4 leading-relaxed">
          Long-form reflections on stories, craft, language, and the quiet hours spent with
          notebooks.
        </p>
        <BotanicalDivider className="mt-8" />
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        {/* Category & Tag Filters */}
        <div className="flex flex-col gap-4 mb-10 pb-6 border-b border-[#40352D]/12">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#23483D] text-[#F8F1E6]'
                    : 'bg-[#EFE2CC]/75 text-[#40352D]/80 hover:text-[#17372F]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
              <span className="text-[#40352D]/55 mr-1">Topics:</span>
              {selectedTag && (
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className="underline text-[#B96F4E] hover:text-[#17372F] mr-2"
                >
                  Clear topic
                </button>
              )}
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    selectedTag === tag
                      ? 'bg-[#B96F4E] text-[#F8F1E6]'
                      : 'text-[#40352D]/75 hover:bg-[#EFE2CC]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-[#EFE2CC]/60 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="py-12 text-center font-sans text-sm text-[#B96F4E]">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-[#40352D]/12 bg-[#EFE2CC]/40 p-14 text-center max-w-xl mx-auto">
            <FileText className="w-8 h-8 text-[#B69A61] mx-auto mb-3" strokeWidth={1.4} />
            <h2 className="font-display text-2xl text-[#17372F]">No matching articles</h2>
            <p className="font-serif text-sm text-[#40352D]/75 mt-2">
              Try clearing your filters or return soon for new journal pages.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((post) => (
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
                    {post.isDemo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="italic">Demo</span>
                      </>
                    )}
                  </div>

                  <h2 className="font-display text-2xl font-semibold text-[#17372F] mt-2 leading-snug group-hover:text-[#B96F4E] transition-colors">
                    <Link to={`/journal/${post.slug}`}>{post.title}</Link>
                  </h2>

                  <p className="font-serif text-[14.5px] leading-relaxed text-[#40352D]/80 mt-3 line-clamp-3 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="mt-5 pt-4 border-t border-[#40352D]/10">
                    <Link
                      to={`/journal/${post.slug}`}
                      className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors"
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
      </section>
    </div>
  );
}
