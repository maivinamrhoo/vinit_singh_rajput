import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchPublicArticle, fetchPublicJournal } from '../services/api';
import type { JournalPost } from '../types/content';
import { SafeImage } from '../components/SafeImage';
import { FormattedProse } from '../components/FormattedProse';
import { BotanicalDivider } from '../components/BotanicalOrnament';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { estimateReadingTime, formatLiteraryDate } from '../lib/contentUtils';

export function JournalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<JournalPost | null>(null);
  const [related, setRelated] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    Promise.all([fetchPublicArticle(slug), fetchPublicJournal().catch(() => [])])
      .then(([found, all]) => {
        setPost(found);
        setRelated(all.filter((p) => p.slug !== slug).slice(0, 2));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const jsonLd = useMemo(() => {
    if (!post) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.seoDescription || post.excerpt,
      author: {
        '@type': 'Person',
        name: 'Vinit Singh Rajput',
      },
      ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    };
  }, [post]);

  useDocumentMeta({
    title: post ? post.seoTitle || `${post.title} — Journal` : 'Journal — Vinit Singh Rajput',
    description: post?.seoDescription || post?.excerpt || 'Literary journal entry.',
    type: 'article',
    image: post?.coverImage,
    jsonLd,
  });

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-16 space-y-6">
        <div className="h-10 w-2/3 bg-[#EFE2CC]/70 rounded-lg animate-pulse" />
        <div className="h-80 bg-[#EFE2CC]/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-24 text-center">
        <h1 className="font-display text-4xl text-[#17372F]">Article not found</h1>
        <p className="font-serif text-[#40352D]/75 mt-3">
          This journal entry is either unpublished or no longer available.
        </p>
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-lg bg-[#23483D] text-[#F8F1E6] font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <div className="paper-grain">
      <article className="max-w-3xl mx-auto px-5 sm:px-8 pt-10 pb-20">
        <Link
          to="/journal"
          className="inline-flex items-center gap-2 font-sans text-xs font-medium text-[#23483D] hover:text-[#B96F4E] transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Journal Articles
        </Link>

        <header className="text-center max-w-2xl mx-auto">
          <div className="font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span className="text-[#B96F4E] font-medium">{post.category}</span>
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
                <span className="italic">Demo Placeholder</span>
              </>
            )}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[#17372F] mt-3 leading-[1.12]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="font-serif italic text-lg text-[#40352D]/75 mt-4 leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        {post.coverImage && (
          <figure className="my-10 rounded-2xl overflow-hidden border border-[#B69A61]/35 bg-[#EFE2CC] shadow-sm">
            <SafeImage
              src={post.coverImage}
              alt={post.title}
              fallbackTitle={post.title}
              eager
              className="w-full max-h-[440px] object-cover"
            />
          </figure>
        )}

        <div className="max-w-[68ch] mx-auto">
          <FormattedProse content={post.content} dropCap />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#40352D]/12 font-sans text-xs text-[#40352D]/65 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Topics:</span>
              {post.tags.map((tag) => (
                <span key={tag} className="text-[#23483D]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author Colophon */}
          <div className="mt-12 p-6 sm:p-7 rounded-2xl bg-[#EFE2CC]/60 border border-[#B69A61]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-sans text-xs text-[#40352D]/60">Written by</p>
              <p className="font-display text-2xl font-semibold text-[#17372F]">
                Vinit Singh Rajput
              </p>
            </div>
            <div className="flex items-center gap-4 font-sans text-xs font-medium">
              <Link
                to="/about"
                className="text-[#23483D] underline underline-offset-4 hover:text-[#B96F4E]"
              >
                About the Author
              </Link>
              <Link
                to="/books"
                className="text-[#23483D] underline underline-offset-4 hover:text-[#B96F4E]"
              >
                Explore Books
              </Link>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <BotanicalDivider className="mb-10" />
            <h2 className="font-display text-3xl font-semibold text-[#17372F] mb-6">
              Continue Reading
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/journal/${item.slug}`}
                  className="p-6 rounded-2xl bg-[#F8F1E6] border border-[#40352D]/12 hover:border-[#B69A61]/60 transition-colors"
                >
                  <p className="font-sans text-xs text-[#40352D]/65">
                    {item.category}
                    {item.publishedAt ? ` · ${formatLiteraryDate(item.publishedAt)}` : ''}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[#17372F] mt-1.5">
                    {item.title}
                  </h3>
                  <p className="font-serif text-sm text-[#40352D]/75 mt-2 line-clamp-2">
                    {item.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  );
}
