import React, { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2 } from 'lucide-react';
import {
  deleteAdminMessage,
  fetchAdminMessages,
  markAdminMessageRead,
} from '../services/api';
import type { ContactMessage } from '../types/content';
import { ConfirmDialog } from './AdminComponents';
import { formatLiteraryDate } from '../lib/contentUtils';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
  onDataChanged: () => void;
}

export function MessagesManager({ getToken, notify, onDataChanged }: Props) {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setMessages(await fetchAdminMessages(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load contact messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const toggleRead = async (msg: ContactMessage) => {
    try {
      const token = await getToken();
      const updated = await markAdminMessageRead(token, msg.id, !msg.isRead);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? updated : m)));
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not update message.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const token = await getToken();
      await deleteAdminMessage(token, deleteTarget.id);
      notify('success', 'Message deleted.');
      setDeleteTarget(null);
      await loadMessages();
      onDataChanged();
    } catch (err: any) {
      notify('error', err?.message || 'Could not delete message.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans text-2xl font-semibold text-stone-900">Messages</h2>
        <p className="font-sans text-sm text-stone-500 mt-0.5">
          Private reader correspondence submitted through the website contact form.
        </p>
      </div>

      {loading ? (
        <div className="h-44 rounded-2xl bg-stone-200/70 animate-pulse" />
      ) : messages.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center">
          <p className="font-sans text-base font-medium text-stone-800">
            Your inbox is empty
          </p>
          <p className="font-sans text-sm text-stone-500 mt-1">
            Messages sent through the public contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`border rounded-xl p-5 transition-colors ${
                msg.isRead
                  ? 'bg-white border-stone-200'
                  : 'bg-[#FAF6EF] border-[#B69A61]/55'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200/70">
                <div>
                  <div className="font-sans text-sm font-semibold text-stone-900 flex items-center gap-2">
                    {msg.name}
                    {!msg.isRead && (
                      <span className="text-[11px] font-medium text-[#B96F4E]">Unread</span>
                    )}
                  </div>
                  <div className="font-sans text-xs text-stone-500">
                    <a
                      href={`mailto:${msg.email}`}
                      className="underline hover:text-[#23483D]"
                    >
                      {msg.email}
                    </a>{' '}
                    · {formatLiteraryDate(msg.createdAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleRead(msg)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
                  >
                    {msg.isRead ? (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Mark Unread
                      </>
                    ) : (
                      <>
                        <MailOpen className="w-3.5 h-3.5" />
                        Mark Read
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(msg)}
                    aria-label={`Delete message from ${msg.name}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#9E3D26] hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              {msg.subject && (
                <p className="font-sans text-sm font-medium text-stone-800 mt-3">
                  {msg.subject}
                </p>
              )}
              <p className="font-sans text-sm text-stone-700 mt-2 whitespace-pre-line leading-relaxed">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Message?"
        message={`Permanently delete the message from "${deleteTarget?.name}"?`}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
