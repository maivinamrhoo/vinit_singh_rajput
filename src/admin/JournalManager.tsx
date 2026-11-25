import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  Search,
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  List,
  Quote,
  Link2,
} from 'lucide-react';
import {
  createAdminJournal,
  deleteAdminJournal,
  fetchAdminJournal,
  updateAdminJournal,
} from '../services/api';
import type { JournalPost, JournalStatus } from '../types/content';
import { ConfirmDialog, ImageUploadField } from './AdminComponents';
import { FormattedProse } from '../components/FormattedProse';
import { SafeImage } from '../components/SafeImage';
import { slugify } from '../lib/contentUtils';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
  onDataChanged: () => void;
}

const EMPTY_POST: Partial<JournalPost> = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: 'Reflections',
  tags: [],
  status: 'draft',
  publishedAt: new Date().toISOString().slice(0, 10),
  scheduledFor: '',
  seoTitle: '',
  seoDescription: '',
  isDemo: false,
};

export function JournalManager({ getToken, notify, onDataChanged }: Props) {
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JournalStatus>('all');
  const [editing, setEditing] = useState<Partial<JournalPost> | null>(null);
  const [tagsText, setTagsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JournalPost | null>(null);
  const [deleting, setDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setPosts(await fetchAdminJournal(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load journal posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const startEdit = (post: Partial<JournalPost>) => {
    setEditing(post);
    setTagsText((post.tags || []).join(', '));
    setPreviewOpen(false);
  };

  const insertFormat = (prefix: string, suffix = '', placeholder = 'text') => {
    const el = textareaRef.current;
    if (!editing) return;
    const value = editing.content || '';
    if (!el) {
      setEditing({ ...editing, content: `${value}${prefix}${placeholder}${suffix}` });
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const next = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    setEditing({ ...editing, content: next });
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !(editing.title || '').trim()) {
      notify('error', 'Article title is required.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const payload: Partial<JournalPost> = {
        ...editing,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };
      if (editing.id) {
        await updateAdminJournal(token, editing.id, payload);
        notify('success', `Updated "${editing.title}".`);
      } else {
        await createAdminJournal(token, payload);
        notify('success', `Created "${editing.title}".`);
      }
      setEditing(null);
      await loadPosts();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not save article.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAdminJournal(token, deleteTarget.id);
      notify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadPosts();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not delete article.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      const statusOk = statusFilter === 'all' || p.status === statusFilter;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return statusOk && qOk;
    });
  }, [posts, search, statusFilter]);

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Journal
            </button>
            <h2 className="font-sans text-xl font-semibold text-stone-900">
              {editing.id ? 'Edit Article' : 'New Journal Article'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setPreviewOpen((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <Eye className="w-4 h-4" />
            {previewOpen ? 'Hide Preview' : 'Preview Article'}
          </button>
        </div>

        {previewOpen && (
          <div className="rounded-2xl border border-[#B69A61]/50 bg-[#F8F1E6] p-6 sm:p-10 max-w-3xl">
            <p className="font-sans text-xs text-[#B96F4E] mb-3">Article Preview</p>
            <h3 className="font-display text-4xl font-semibold text-[#17372F]">
              {editing.title || 'Untitled Article'}
            </h3>
            {editing.excerpt && (
              <p className="font-serif italic text-base text-[#40352D]/75 mt-2">
                {editing.excerpt}
              </p>
            )}
            {editing.coverImage && (
              <div className="my-6 rounded-xl overflow-hidden max-h-72 bg-[#EFE2CC]">
                <SafeImage
                  src={editing.coverImage}
                  alt={editing.title || 'Article cover'}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="mt-6">
              <FormattedProse content={editing.content || ''} dropCap />
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
                Article Title *
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
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                URL Slug
              </label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm focus:outline-none focus:border-[#23483D]"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Writing Craft, Literature, Reflections..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="notebooks, writing-life, poetry"
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Publication Status
              </label>
              <select
                value={editing.status || 'draft'}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as JournalStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                {editing.status === 'scheduled' ? 'Schedule Publication Date' : 'Publication Date'}
              </label>
              <input
                type={editing.status === 'scheduled' ? 'datetime-local' : 'date'}
                value={
                  editing.status === 'scheduled'
                    ? editing.scheduledFor || ''
                    : editing.publishedAt || ''
                }
                onChange={(e) =>
                  setEditing(
                    editing.status === 'scheduled'
                      ? { ...editing, scheduledFor: e.target.value }
                      : { ...editing, publishedAt: e.target.value }
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>
          </div>

          <ImageUploadField
            label="Article Cover Image"
            value={editing.coverImage || ''}
            onChange={(url) => setEditing({ ...editing, coverImage: url })}
            getToken={getToken}
            onError={(msg) => notify('error', msg)}
            aspectClass="aspect-[4/3] w-40"
          />

          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Short Excerpt
            </label>
            <textarea
              rows={2}
              value={editing.excerpt || ''}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
            />
          </div>

          {/* Comfortable Literary Editor with Formatting Toolbar */}
          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Article Content
            </label>
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 px-3 py-2 bg-stone-50 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => insertFormat('\n## ', '\n', 'Section Heading')}
                  title="Heading"
                  aria-label="Insert heading"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('**', '**', 'bold phrase')}
                  title="Bold"
                  aria-label="Bold text"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('*', '*', 'italic phrase')}
                  title="Italic"
                  aria-label="Italic text"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('\n> ', '\n', 'A memorable passage...')}
                  title="Blockquote"
                  aria-label="Insert blockquote"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('\n- ', '', 'List item')}
                  title="Bullet list"
                  aria-label="Insert bullet list"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertFormat('[', '](https://example.com)', 'link text')}
                  title="Insert link"
                  aria-label="Insert link"
                  className="p-2 rounded hover:bg-stone-200/70 text-stone-700"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
              <textarea
                ref={textareaRef}
                rows={12}
                value={editing.content || ''}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder="Write your essay here..."
                className="w-full p-4 font-serif text-[15.5px] leading-relaxed text-stone-800 focus:outline-none resize-y"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <label className="inline-flex items-center gap-2 font-sans text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.isDemo)}
                onChange={(e) => setEditing({ ...editing, isDemo: e.target.checked })}
              />
              Mark as Demo Placeholder
            </label>
            <div className="flex items-center gap-3">
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
                className="px-6 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] disabled:opacity-60"
              >
                {saving ? 'Saving...' : editing.id ? 'Save Article' : 'Create Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-stone-900">Journal</h2>
          <p className="font-sans text-sm text-stone-500 mt-0.5">
            Write essays, reflections, and literary articles with draft and scheduling support.
          </p>
        </div>
        <button
          type="button"
          onClick={() => startEdit({ ...EMPTY_POST })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Write New Article
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles by title, category, or tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm"
          />
        </div>
        <select
          aria-label="Filter journal by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | JournalStatus)}
          className="px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {loading ? (
        <div className="h-52 rounded-2xl bg-stone-200/70 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="font-sans text-base font-medium text-stone-800">No articles found</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
                  <th className="py-3.5 px-4 font-medium">Title</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium">Date</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((post) => (
                  <tr key={post.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900">{post.title}</div>
                      <div className="text-xs text-stone-500 line-clamp-1">
                        {post.excerpt}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{post.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-medium capitalize ${
                          post.status === 'published'
                            ? 'text-[#23483D]'
                            : post.status === 'scheduled'
                            ? 'text-[#B96F4E]'
                            : 'text-stone-500'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 tabular-nums text-xs text-stone-600">
                      {post.publishedAt || post.scheduledFor || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(post)}
                        aria-label={`Edit "${post.title}"`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 mr-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(post)}
                        aria-label={`Delete "${post.title}"`}
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
        title="Delete Journal Article?"
        message={`Permanently delete "${deleteTarget?.title}"?`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
