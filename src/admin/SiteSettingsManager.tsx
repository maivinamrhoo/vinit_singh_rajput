import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import {
  fetchAdminBooks,
  fetchAdminSettings,
  saveAdminSettings,
} from '../services/api';
import type { Book, SiteSettings } from '../types/content';
import { ImageUploadField } from './AdminComponents';

interface Props {
  getToken: () => Promise<string>;
  notify: (type: 'success' | 'error', message: string) => void;
}

export function SiteSettingsManager({ getToken, notify }: Props) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const [s, b] = await Promise.all([
          fetchAdminSettings(token),
          fetchAdminBooks(token),
        ]);
        setSettings(s);
        setBooks(b.filter((item) => item.status !== 'draft'));
      } catch (err: any) {
        notify('error', err?.message || 'Could not load site settings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const token = await getToken();
      const updated = await saveAdminSettings(token, settings);
      setSettings(updated);
      notify('success', 'Site settings saved. Public website updated immediately.');
    } catch (err: any) {
      notify('error', err?.message || 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="h-96 rounded-2xl bg-stone-200/70 animate-pulse" />;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-semibold text-stone-900">
            Site Settings
          </h2>
          <p className="font-sans text-sm text-stone-500 mt-0.5">
            Update hero copy, author biography, photograph, social links, and featured book
            without touching code.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] disabled:opacity-60 whitespace-nowrap"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-sans text-base font-semibold text-stone-900">
          Homepage Hero
        </h3>
        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Hero Heading
          </label>
          <input
            type="text"
            value={settings.heroHeading}
            onChange={(e) => setSettings({ ...settings, heroHeading: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>
        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Hero Supporting Description
          </label>
          <textarea
            rows={3}
            value={settings.heroDescription}
            onChange={(e) =>
              setSettings({ ...settings, heroDescription: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>
        <ImageUploadField
          label="Hero Illustration Image"
          value={settings.heroImage}
          onChange={(url) => setSettings({ ...settings, heroImage: url })}
          getToken={getToken}
          onError={(msg) => notify('error', msg)}
          aspectClass="aspect-video w-48"
        />
        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Featured Book Override (optional)
          </label>
          <select
            value={settings.featuredBookId || ''}
            onChange={(e) =>
              setSettings({ ...settings, featuredBookId: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm bg-white"
          >
            <option value="">Use book marked &ldquo;Featured&rdquo; automatically</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.status})
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Author Profile */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-sans text-base font-semibold text-stone-900">
          Author Profile &amp; Biography
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Author Name
            </label>
            <input
              type="text"
              value={settings.authorName}
              onChange={(e) => setSettings({ ...settings, authorName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
            />
          </div>
          <div>
            <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={settings.authorLocation}
              onChange={(e) =>
                setSettings({ ...settings, authorLocation: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
            />
          </div>
        </div>

        <ImageUploadField
          label="Author Photograph"
          value={settings.authorPhoto}
          onChange={(url) => setSettings({ ...settings, authorPhoto: url })}
          getToken={getToken}
          onError={(msg) => notify('error', msg)}
        />

        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Biography
          </label>
          <textarea
            rows={4}
            value={settings.authorBio}
            onChange={(e) => setSettings({ ...settings, authorBio: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>

        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Writing Philosophy Quote
          </label>
          <textarea
            rows={3}
            value={settings.writingPhilosophy}
            onChange={(e) =>
              setSettings({ ...settings, writingPhilosophy: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>

        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Literary Approach &amp; Interests
          </label>
          <textarea
            rows={3}
            value={settings.literaryApproach}
            onChange={(e) =>
              setSettings({ ...settings, literaryApproach: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>
      </section>

      {/* Contact, Socials & Footer */}
      <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-5">
        <h3 className="font-sans text-base font-semibold text-stone-900">
          Contact, Social Links &amp; Footer
        </h3>
        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Public Contact Email (leave empty to hide email link)
          </label>
          <input
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            placeholder="author@yourdomain.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              ['instagram', 'Instagram URL'],
              ['twitter', 'X / Twitter URL'],
              ['goodreads', 'Goodreads URL'],
              ['youtube', 'YouTube URL'],
              ['facebook', 'Facebook URL'],
              ['linkedin', 'LinkedIn URL'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="block font-sans text-xs font-medium text-stone-700 mb-1">
                {label}
              </label>
              <input
                type="url"
                value={settings.socialLinks?.[key] || ''}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    socialLinks: {
                      ...settings.socialLinks,
                      [key]: e.target.value,
                    },
                  })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 font-sans text-xs"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block font-sans text-xs font-medium text-stone-700 mb-1.5">
            Footer Description
          </label>
          <textarea
            rows={2}
            value={settings.footerDescription}
            onChange={(e) =>
              setSettings({ ...settings, footerDescription: e.target.value })
            }
            className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 font-sans text-sm"
          />
        </div>
      </section>
    </form>
  );
}
