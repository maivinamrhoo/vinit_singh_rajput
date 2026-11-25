import React, { useRef, useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadAdminImage } from '../services/api';
import { SafeImage } from '../components/SafeImage';

export interface ToastItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border font-sans text-sm ${
            t.type === 'success'
              ? 'bg-[#17372F] text-[#F8F1E6] border-[#23483D]'
              : 'bg-[#FFF5F2] text-[#7D2B19] border-[#B96F4E]/40'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#A1A88B]" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B96F4E]" />
          )}
          <span className="flex-1">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
            className="opacity-70 hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 shadow-xl">
        <h3
          id="confirm-dialog-title"
          className="font-sans text-lg font-semibold text-stone-900"
        >
          {title}
        </h3>
        <p className="font-sans text-sm text-stone-600 mt-2 leading-relaxed">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-stone-300 font-sans text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-[#9E3D26] text-white font-sans text-sm font-medium hover:bg-[#82301C] disabled:opacity-60 transition-colors"
          >
            {busy ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ImageUploadField({
  label,
  value,
  onChange,
  getToken,
  onError,
  aspectClass = 'aspect-[3/4] w-28',
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  getToken: () => Promise<string>;
  onError: (msg: string) => void;
  aspectClass?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      onError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError('Image must be 5 MB or smaller.');
      return;
    }
    setUploading(true);
    try {
      const token = await getToken();
      const uploaded = await uploadAdminImage(token, file);
      onChange(uploaded.url);
    } catch (err: any) {
      onError(err?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="block font-sans text-xs font-medium text-stone-700 mb-2">
        {label}
      </label>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div
          className={`${aspectClass} rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0`}
        >
          <SafeImage
            src={value}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#23483D] text-white font-sans text-xs font-medium hover:bg-[#17372F] disabled:opacity-60 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs text-stone-600 hover:bg-stone-50"
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste an image path / https:// URL"
            className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs text-stone-800 focus:outline-none focus:border-[#23483D]"
          />
          <p className="font-sans text-[11px] text-stone-500">
            Supports JPEG, PNG, or WebP up to 5 MB. Uploaded images are stored in PostgreSQL
            and served immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
