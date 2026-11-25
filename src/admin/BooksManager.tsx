import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Star,
  Search,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  createAdminBook,
  deleteAdminBook,
  fetchAdminBooks,
  updateAdminBook,
} from '../services/api';
import type { Book, BookStatus, ExternalLink } from '../types/content';
import { ConfirmDialog, ImageUploadField } from './AdminComponents';
import { SafeImage } from '../components/SafeImage';
import { FormattedProse } from '../components/FormattedProse';
import { slugify, validateBookInput } from '../lib/contentUtils';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
  onDataChanged: () => void;
}

const EMPTY_BOOK: Partial<Book> = {
  title: '',
  slug: '',
  subtitle: '',
  coverImage: '',
  shortDescription: '',
  fullDescription: '',
  author: 'Vinit Singh Rajput',
  category: 'Literary Fiction',
  language: 'English',
  publicationDate: '',
  status: 'draft',
  featured: false,
  displayOrder: 0,
  googlePlayUrl: '',
  amazonUrl: '',
  wattpadUrl: '',
  otherLinks: [],
  seoTitle: '',
  seoDescription: '',
  isDemo: false,
};

export function BooksManager({ getToken, notify, onDataChanged }: Props) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BookStatus>('all');
  const [editing, setEditing] = useState<Partial<Book> | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadBooks = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setBooks(await fetchAdminBooks(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load books.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      const statusOk = statusFilter === 'all' || b.status === statusFilter;
      const qOk =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [books, search, statusFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const validation = validateBookInput(editing);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      notify('error', 'Please fix the highlighted book fields.');
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try {
      const token = await getToken();
      if (editing.id) {
        await updateAdminBook(token, editing.id, editing);
        notify('success', `"${editing.title}" updated and synced.`);
      } else {
        await createAdminBook(token, editing);
        notify('success', `"${editing.title}" created.`);
      }
      setEditing(null);
      setPreviewOpen(false);
      await loadBooks();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Failed to save book.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAdminBook(token, deleteTarget.id);
      notify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadBooks();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not delete book.');
    } finally {
      setDeleting(false);
    }
  };

  const updateOtherLink = (index: number, patch: Partial<ExternalLink>) => {
    if (!editing) return;
    const next = [...(editing.otherLinks || [])];
    next[index] = { ...next[index], ...patch };
    setEditing({ ...editing, otherLinks: next });
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setPreviewOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Books
            </button>
            <h2 className="font-sans text-xl font-semibold text-stone-900">
              {editing.id ? 'Edit Book' : 'Add New Book'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Eye className="w-4 h-4" />
            {previewOpen ? 'Hide Preview' : 'Preview Book'}
          </button>
        </div>

        {previewOpen && (
          <div className="rounded-2xl border border-[#B69A61]/50 bg-[#F8F1E6] p-6 sm:p-8">
            <p className="font-sans text-xs font-medium text-[#B96F4E] mb-4">
              Live Public Preview
            </p>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-4 aspect-[3/4] rounded-xl overflow-hidden bg-[#EFE2CC] border border-[#B69A61]/30">
                <SafeImage
                  src={editing.coverImage}
                  alt={editing.title || 'Book cover preview'}
                  fallbackTitle={editing.title || 'Untitled Book'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="md:col-span-8">
                <p className="font-sans text-xs text-[#40352D]/65">
                  {editing.category || 'Category'} · {editing.language || 'English'} ·{' '}
                  {editing.status}
                </p>
                <h3 className="font-display text-4xl font-semibold text-[#17372F] mt-1">
                  {editing.title || 'Untitled Book'}
                </h3>
                {editing.subtitle && (
                  <p className="font-serif italic text-base text-[#40352D]/75 mt-1">
                    {editing.subtitle}
                  </p>
                )}
                <p className="font-serif text-sm text-[#40352D]/85 mt-4 leading-relaxed">
                  {editing.shortDescription}
                </p>
                {editing.fullDescription && (
                  <div className="mt-5 pt-5 border-t border-[#40352D]/10">
                    <FormattedProse content={editing.fullDescription} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSave}
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) => {
                  const title = e.target.value;
                  setEditing({
                    ...editing,
                    title,
                    slug: editing.id ? editing.slug : slugify(title),
                  });
                }}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
              {fieldErrors.title && (
                <p className="mt-1 font-sans text-xs text-[#B96F4E]">{fieldErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="auto-generated-from-title"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Subtitle
              </label>
              <input
                type="text"
                value={editing.subtitle || ''}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Author
              </label>
              <input
                type="text"
                value={editing.author || ''}
                onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Genre / Category
              </label>
              <input
                type="text"
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Literary Fiction, Poetry, Short Stories..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Language
              </label>
              <select
                value={editing.language || 'English'}
                onChange={(e) => setEditing({ ...editing, language: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white focus:outline-none focus:border-[#23483D]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Publication Status
              </label>
              <select
                value={editing.status || 'draft'}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as BookStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white focus:outline-none focus:border-[#23483D]"
              >
                <option value="draft">Draft (Hidden from public)</option>
                <option value="upcoming">Upcoming Release</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Publication / Expected Date
              </label>
              <input
                type="date"
                value={editing.publicationDate || ''}
                onChange={(e) =>
                  setEditing({ ...editing, publicationDate: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Display Order (lower appears first)
              </label>
              <input
                type="number"
                value={editing.displayOrder ?? 0}
                onChange={(e) =>
                  setEditing({ ...editing, displayOrder: Number(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="inline-flex items-center gap-2 font-sans text-sm text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                  className="rounded border-stone-300 text-[#23483D]"
                />
                Feature on Homepage
              </label>

              <label className="inline-flex items-center gap-2 font-sans text-sm text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.isDemo)}
                  onChange={(e) => setEditing({ ...editing, isDemo: e.target.checked })}
                  className="rounded border-stone-300"
                />
                Mark as Demo Placeholder
              </label>
            </div>
          </div>

          <ImageUploadField
            label="Book Cover Image"
            value={editing.coverImage || ''}
            onChange={(url) => setEditing({ ...editing, coverImage: url })}
            getToken={getToken}
            onError={(msg) => notify('error', msg)}
          />

          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Short Description (shown on bookshelf &amp; hero cards)
            </label>
            <textarea
              rows={3}
              value={editing.shortDescription || ''}
              onChange={(e) =>
                setEditing({ ...editing, shortDescription: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
            />
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Full Description (supports paragraphs, ## headings, &gt; quotes, and - lists)
            </label>
            <textarea
              rows={6}
              value={editing.fullDescription || ''}
              onChange={(e) =>
                setEditing({ ...editing, fullDescription: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
            />
          </div>

          {/* Reading & Purchase Links */}
          <div className="pt-4 border-t border-stone-200 space-y-4">
            <h3 className="font-sans text-sm font-semibold text-stone-900">
              Reading &amp; Purchase Links (only shown when a valid URL is entered)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                  Google Play Books URL
                </label>
                <input
                  type="url"
                  value={editing.googlePlayUrl || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, googlePlayUrl: e.target.value })
                  }
                  placeholder="https://play.google.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs focus:outline-none focus:border-[#23483D]"
                />
                {fieldErrors.googlePlayUrl && (
                  <p className="mt-1 text-xs text-[#B96F4E]">{fieldErrors.googlePlayUrl}</p>
                )}
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                  Amazon URL
                </label>
                <input
                  type="url"
                  value={editing.amazonUrl || ''}
                  onChange={(e) => setEditing({ ...editing, amazonUrl: e.target.value })}
                  placeholder="https://www.amazon.in/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs focus:outline-none focus:border-[#23483D]"
                />
                {fieldErrors.amazonUrl && (
                  <p className="mt-1 text-xs text-[#B96F4E]">{fieldErrors.amazonUrl}</p>
                )}
              </div>
              <div>
                <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                  Wattpad URL
                </label>
                <input
                  type="url"
                  value={editing.wattpadUrl || ''}
                  onChange={(e) => setEditing({ ...editing, wattpadUrl: e.target.value })}
                  placeholder="https://www.wattpad.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs focus:outline-none focus:border-[#23483D]"
                />
                {fieldErrors.wattpadUrl && (
                  <p className="mt-1 text-xs text-[#B96F4E]">{fieldErrors.wattpadUrl}</p>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs font-medium text-stone-700">
                  Additional External Links
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      ...editing,
                      otherLinks: [...(editing.otherLinks || []), { label: '', url: '' }],
                    })
                  }
                  className="inline-flex items-center gap-1 font-sans text-xs font-medium text-[#23483D] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add link
                </button>
              </div>
              {(editing.otherLinks || []).map((link, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateOtherLink(idx, { label: e.target.value })}
                    placeholder="Store or Platform Name"
                    className="sm:col-span-4 px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateOtherLink(idx, { url: e.target.value })}
                    placeholder="https://..."
                    className="sm:col-span-7 px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs"
                  />
                  <button
                    type="button"
                    aria-label="Remove link"
                    onClick={() => {
                      const next = (editing.otherLinks || []).filter((_, i) => i !== idx);
                      setEditing({ ...editing, otherLinks: next });
                    }}
                    className="sm:col-span-1 p-2 text-stone-500 hover:text-[#9E3D26]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="pt-4 border-t border-stone-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                SEO Title (optional)
              </label>
              <input
                type="text"
                value={editing.seoTitle || ''}
                onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs"
              />
            </div>
            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                SEO Description (optional)
              </label>
              <input
                type="text"
                value={editing.seoDescription || ''}
                onChange={(e) =>
                  setEditing({ ...editing, seoDescription: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-4 py-2.5 rounded-lg border border-stone-300 font-sans text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving...' : editing.id ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-stone-900">Books</h2>
          <p className="font-sans text-sm text-stone-500 mt-0.5">
            Add, organize, feature, or save draft books. Published changes appear on the
            site immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_BOOK, displayOrder: books.length + 1 })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] transition-colors whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search books by title, genre, or language..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm focus:outline-none focus:border-[#23483D]"
          />
        </div>
        <select
          aria-label="Filter books by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | BookStatus)}
          className="px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="upcoming">Upcoming</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="h-56 rounded-2xl bg-stone-200/70 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="font-sans text-base font-medium text-stone-800">No books found</p>
          <p className="font-sans text-sm text-stone-500 mt-1">
            Add your first book or clear your search filter.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
                  <th className="py-3.5 px-4 font-medium">Book</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Order</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((book) => (
                  <tr key={book.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-14 rounded overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                          <SafeImage
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-stone-900 flex items-center gap-1.5">
                            {book.title}
                            {book.featured && (
                              <Star
                                className="w-3.5 h-3.5 text-[#B69A61] fill-[#B69A61]"
                                aria-label="Featured book"
                              />
                            )}
                          </div>
                          <div className="text-xs text-stone-500">
                            {book.language}
                            {book.isDemo ? ' · Demo Placeholder' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{book.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-medium capitalize ${
                          book.status === 'published'
                            ? 'text-[#23483D]'
                            : book.status === 'upcoming'
                            ? 'text-[#B96F4E]'
                            : 'text-stone-500'
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-stone-600">
                      {book.displayOrder}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(book)}
                        aria-label={`Edit "${book.title}"`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 mr-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(book)}
                        aria-label={`Delete "${book.title}"`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#9E3D26] hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Book?"
        message={`Are you sure you want to permanently remove "${deleteTarget?.title}"? This action cannot be undone.`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
