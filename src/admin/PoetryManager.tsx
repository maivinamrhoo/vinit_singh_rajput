import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Star, ArrowLeft, Search } from 'lucide-react';
import {
  createAdminPoem,
  deleteAdminPoem,
  fetchAdminPoems,
  updateAdminPoem,
} from '../services/api';
import type { Poem, PoemLanguage, PoemStatus } from '../types/content';
import { ConfirmDialog } from './AdminComponents';
import { slugify } from '../lib/contentUtils';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
  onDataChanged: () => void;
}

const EMPTY_POEM: Partial<Poem> = {
  title: '',
  slug: '',
  subtitle: '',
  body: '',
  category: 'Lyric',
  language: 'English',
  featured: false,
  status: 'draft',
  isDemo: false,
};

export function PoetryManager({ getToken, notify, onDataChanged }: Props) {
  const [poems, setPoems] = useState<Poem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | PoemLanguage>('all');
  const [editing, setEditing] = useState<Partial<Poem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Poem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPoems = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setPoems(await fetchAdminPoems(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load poems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoems();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !(editing.title || '').trim() || !(editing.body || '').trim()) {
      notify('error', 'Poem title and verses are required.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      if (editing.id) {
        await updateAdminPoem(token, editing.id, editing);
        notify('success', `Updated "${editing.title}".`);
      } else {
        await createAdminPoem(token, editing);
        notify('success', `Saved "${editing.title}".`);
      }
      setEditing(null);
      await loadPoems();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not save poem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAdminPoem(token, deleteTarget.id);
      notify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadPoems();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not delete poem.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return poems.filter((p) => {
      const langOk = langFilter === 'all' || p.language === langFilter;
      const qOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q);
      return langOk && qOk;
    });
  }, [poems, search, langFilter]);

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Poetry
          </button>
          <h2 className="font-sans text-xl font-semibold text-stone-900">
            {editing.id ? 'Edit Poem' : 'Add New Poem'}
          </h2>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Poem Title *
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Subtitle (optional)
              </label>
              <input
                type="text"
                value={editing.subtitle || ''}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Language
              </label>
              <select
                value={editing.language || 'English'}
                onChange={(e) =>
                  setEditing({ ...editing, language: e.target.value as PoemLanguage })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="Hinglish">Hinglish</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Category / Theme
              </label>
              <input
                type="text"
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Stillness, Monsoon, Memory..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Status
              </label>
              <select
                value={editing.status || 'draft'}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as PoemStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="flex items-center gap-6 pt-5">
              <label className="inline-flex items-center gap-2 font-sans text-sm text-stone-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.featured)}
                  onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
                />
                Feature on Homepage
              </label>
              <label className="inline-flex items-center gap-2 font-sans text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(editing.isDemo)}
                  onChange={(e) => setEditing({ ...editing, isDemo: e.target.checked })}
                />
                Demo Placeholder
              </label>
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Poem Verses * (line breaks and empty stanza lines are preserved exactly)
            </label>
            <textarea
              required
              rows={12}
              value={editing.body || ''}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              placeholder="Write your verses here..."
              className="w-full px-4 py-3.5 rounded-xl border border-stone-300 font-serif text-base leading-[1.9] focus:outline-none focus:border-[#23483D]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
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
              {saving ? 'Saving...' : editing.id ? 'Save Poem' : 'Add Poem'}
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
          <h2 className="font-sans text-2xl font-semibold text-stone-900">Poetry</h2>
          <p className="font-sans text-sm text-stone-500 mt-0.5">
            Manage poems in English, Hindi, and Hinglish with exact stanza formatting.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_POEM })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Poem
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search poems..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm"
          />
        </div>
        <select
          aria-label="Filter poetry by language"
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value as 'all' | PoemLanguage)}
          className="px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white font-sans text-sm"
        >
          <option value="all">All languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Hinglish">Hinglish</option>
        </select>
      </div>

      {loading ? (
        <div className="h-48 rounded-2xl bg-stone-200/70 animate-pulse" />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="font-sans text-base font-medium text-stone-800">No poems found</p>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500">
                  <th className="py-3.5 px-4 font-medium">Title</th>
                  <th className="py-3.5 px-4 font-medium">Language</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((poem) => (
                  <tr key={poem.id} className="hover:bg-stone-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-900 flex items-center gap-1.5">
                        {poem.title}
                        {poem.featured && (
                          <Star className="w-3.5 h-3.5 text-[#B69A61] fill-[#B69A61]" />
                        )}
                      </div>
                      {poem.subtitle && (
                        <div className="text-xs text-stone-500">{poem.subtitle}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{poem.language}</td>
                    <td className="py-3.5 px-4 text-stone-600">{poem.category}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-medium capitalize ${
                          poem.status === 'published' ? 'text-[#23483D]' : 'text-stone-500'
                        }`}
                      >
                        {poem.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setEditing(poem)}
                        aria-label={`Edit "${poem.title}"`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 mr-1"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(poem)}
                        aria-label={`Delete "${poem.title}"`}
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
        title="Delete Poem?"
        message={`Permanently delete "${deleteTarget?.title}"?`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
