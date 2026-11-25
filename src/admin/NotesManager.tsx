import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import {
  createAdminNote,
  deleteAdminNote,
  fetchAdminNotes,
  updateAdminNote,
} from '../services/api';
import type { Note, NoteStatus } from '../types/content';
import { ConfirmDialog } from './AdminComponents';
import { formatLiteraryDate } from '../lib/contentUtils';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
  onDataChanged: () => void;
}

const EMPTY_NOTE: Partial<Note> = {
  title: '',
  body: '',
  category: 'Writing Desk',
  status: 'published',
  isDemo: false,
};

export function NotesManager({ getToken, notify, onDataChanged }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Note> | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setNotes(await fetchAdminNotes(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !(editing.title || '').trim() || !(editing.body || '').trim()) {
      notify('error', 'Title and note text are required.');
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      if (editing.id) {
        await updateAdminNote(token, editing.id, editing);
        notify('success', 'Note updated.');
      } else {
        await createAdminNote(token, editing);
        notify('success', 'Note added.');
      }
      setEditing(null);
      await loadNotes();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not save note.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAdminNote(token, deleteTarget.id);
      notify('success', `Deleted "${deleteTarget.title}".`);
      setDeleteTarget(null);
      await loadNotes();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not delete note.');
    } finally {
      setDeleting(false);
    }
  };

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
            Back to Notes
          </button>
          <h2 className="font-sans text-xl font-semibold text-stone-900">
            {editing.id ? 'Edit Note' : 'New Desk Note'}
          </h2>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5 max-w-2xl"
        >
          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={editing.title || ''}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={editing.category || ''}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Writing Desk, Announcement, Reading..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
                Status
              </label>
              <select
                value={editing.status || 'published'}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value as NoteStatus })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white"
              >
                <option value="draft">Draft (Private)</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Note Text *
            </label>
            <textarea
              required
              rows={5}
              value={editing.body || ''}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <label className="inline-flex items-center gap-2 font-sans text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.isDemo)}
                onChange={(e) => setEditing({ ...editing, isDemo: e.target.checked })}
              />
              Demo Placeholder
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 font-sans text-sm text-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Note'}
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
          <h2 className="font-sans text-2xl font-semibold text-stone-900">Notes</h2>
          <p className="font-sans text-sm text-stone-500 mt-0.5">
            Post brief thoughts, writing updates, and announcements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_NOTE })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>

      {loading ? (
        <div className="h-44 rounded-2xl bg-stone-200/70 animate-pulse" />
      ) : notes.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="font-sans text-base font-medium text-stone-800">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white border border-stone-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div>
                <div className="font-sans text-xs text-stone-500 flex items-center gap-2">
                  <span>{note.category}</span>
                  <span aria-hidden="true">·</span>
                  <span
                    className={
                      note.status === 'published'
                        ? 'text-[#23483D] font-medium'
                        : 'text-stone-500'
                    }
                  >
                    {note.status}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{formatLiteraryDate(note.createdAt)}</span>
                </div>
                <h3 className="font-sans text-base font-semibold text-stone-900 mt-1">
                  {note.title}
                </h3>
                <p className="font-sans text-sm text-stone-600 mt-1.5 whitespace-pre-line">
                  {note.body}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(note)}
                  aria-label={`Edit "${note.title}"`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(note)}
                  aria-label={`Delete "${note.title}"`}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#9E3D26] hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Note?"
        message={`Permanently delete "${deleteTarget?.title}"?`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
