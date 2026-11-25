import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Feather,
  StickyNote,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Lock,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchAdminOverview } from '../services/api';
import type { AdminOverview } from '../types/content';
import { BooksManager } from './BooksManager';
import { JournalManager } from './JournalManager';
import { PoetryManager } from './PoetryManager';
import { NotesManager } from './NotesManager';
import { MessagesManager } from './MessagesManager';
import { SiteSettingsManager } from './SiteSettingsManager';
import { ToastItem, ToastStack } from './AdminComponents';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

type AdminTab =
  | 'overview'
  | 'books'
  | 'journal'
  | 'poetry'
  | 'notes'
  | 'messages'
  | 'settings';

const SIDEBAR_ITEMS: Array<{
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'journal', label: 'Journal', icon: FileText },
  { id: 'poetry', label: 'Poetry', icon: Feather },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'settings', label: 'Site Settings', icon: Settings },
];

export function AdminDashboard() {
  const { user, adminProfile, loading, authError, signInWithGoogle, signOut, getToken } =
    useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useDocumentMeta({
    title: 'Author Admin Desk — Vinit Singh Rajput',
    description: 'Private editorial dashboard for managing books, journal, poetry, and site settings.',
  });

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const loadOverview = useCallback(async () => {
    if (!adminProfile) return;
    setOverviewLoading(true);
    try {
      const token = await getToken();
      setOverview(await fetchAdminOverview(token));
    } catch (err: any) {
      notify('error', err?.message || 'Could not load overview metrics.');
    } finally {
      setOverviewLoading(false);
    }
  }, [adminProfile, getToken, notify]);

  useEffect(() => {
    if (adminProfile) {
      loadOverview();
    }
  }, [adminProfile, loadOverview]);

  // Loading auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F2EC] flex items-center justify-center p-6">
        <div className="font-sans text-sm text-stone-600">
          Verifying administrator session...
        </div>
      </div>
    );
  }

  // Unauthenticated or Unauthorized Gate (No Public Registration!)
  if (!user || !adminProfile) {
    return (
      <div className="min-h-screen bg-[#F8F1E6] flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 sm:p-10 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-[#23483D]/10 text-[#23483D] flex items-center justify-center mx-auto mb-5">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-display text-3xl font-semibold text-[#17372F]">
            Author Admin Desk
          </h1>
          <p className="font-sans text-sm text-stone-600 mt-2 leading-relaxed">
            Private publishing workspace for Vinit Singh Rajput. Public account
            registration is disabled — sign in with an authorized administrator Google
            account.
          </p>

          {authError && (
            <div
              role="alert"
              className="mt-5 p-3.5 rounded-xl bg-[#FFF5F2] border border-[#B96F4E]/35 font-sans text-xs text-[#7D2B19] text-left"
            >
              {authError}
            </div>
          )}

          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full py-3 px-5 rounded-lg bg-[#23483D] text-white font-sans text-sm font-medium hover:bg-[#17372F] transition-colors"
            >
              Sign in with Google
            </button>

            {user && !adminProfile && (
              <button
                type="button"
                onClick={signOut}
                className="w-full py-2.5 px-4 rounded-lg border border-stone-300 font-sans text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                Sign out ({user.email})
              </button>
            )}
          </div>

          <div className="mt-7 pt-5 border-t border-stone-100">
            <Link
              to="/"
              className="font-sans text-xs text-stone-500 hover:text-[#23483D] underline underline-offset-4"
            >
              Return to public website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3EF] text-stone-900 flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-[#17372F] text-[#F8F1E6] px-4 h-14 flex items-center justify-between">
        <span className="font-display text-xl font-semibold tracking-wide">
          Author Admin
        </span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle admin menu"
          className="p-2 rounded-lg hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } lg:flex lg:flex-col w-full lg:w-64 bg-[#17372F] text-[#F8F1E6] shrink-0 justify-between`}
      >
        <div className="p-5">
          <div className="hidden lg:block pb-6 border-b border-white/10">
            <p className="font-display text-2xl font-semibold tracking-wide">
              Author Desk
            </p>
            <p className="text-xs text-[#EFE2CC]/65 mt-0.5 truncate">
              {adminProfile.email}
            </p>
          </div>

          <nav aria-label="Admin sections" className="mt-4 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#23483D] text-white'
                      : 'text-[#EFE2CC]/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-85" />
                    {item.label}
                  </span>
                  {item.id === 'messages' && overview && overview.unreadMessages > 0 && (
                    <span className="text-xs tabular-nums text-[#DDA7A0] font-semibold">
                      {overview.unreadMessages}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-5 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#EFE2CC]/80 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Public Website
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#DDA7A0] hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Workspace Main Content */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900">
                Editorial Overview
              </h1>
              <p className="text-sm text-stone-500 mt-1">
                Live publishing snapshot for Vinit Singh Rajput&rsquo;s website.
              </p>
            </div>

            {overviewLoading || !overview ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-28 rounded-2xl bg-stone-200/70 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    label: 'Published Books',
                    value: overview.publishedBooks,
                    action: () => setActiveTab('books'),
                  },
                  {
                    label: 'Upcoming Books',
                    value: overview.upcomingBooks,
                    action: () => setActiveTab('books'),
                  },
                  {
                    label: 'Journal Articles',
                    value: overview.publishedJournal,
                    action: () => setActiveTab('journal'),
                  },
                  {
                    label: 'Published Poems',
                    value: overview.publishedPoems,
                    action: () => setActiveTab('poetry'),
                  },
                  {
                    label: 'Draft Content',
                    value: overview.draftCount,
                    action: () => setActiveTab('books'),
                  },
                  {
                    label: 'Unread Messages',
                    value: overview.unreadMessages,
                    action: () => setActiveTab('messages'),
                  },
                ].map((stat) => (
                  <button
                    key={stat.label}
                    type="button"
                    onClick={stat.action}
                    className="text-left bg-white border border-stone-200 rounded-2xl p-6 hover:border-[#23483D]/50 transition-colors"
                  >
                    <p className="text-xs font-medium text-stone-500">{stat.label}</p>
                    <p className="text-3xl font-semibold text-[#17372F] mt-2 tabular-nums">
                      {stat.value}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-stone-900">Quick Actions</h2>
              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('books')}
                  className="px-4 py-2 rounded-lg bg-[#23483D] text-white text-xs font-medium hover:bg-[#17372F]"
                >
                  Manage Books
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('journal')}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Write Journal Article
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('poetry')}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Add Poem
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Edit Biography &amp; Hero
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <BooksManager
            getToken={getToken}
            notify={notify}
            onDataChanged={loadOverview}
          />
        )}
        {activeTab === 'journal' && (
          <JournalManager
            getToken={getToken}
            notify={notify}
            onDataChanged={loadOverview}
          />
        )}
        {activeTab === 'poetry' && (
          <PoetryManager
            getToken={getToken}
            notify={notify}
            onDataChanged={loadOverview}
          />
        )}
        {activeTab === 'notes' && (
          <NotesManager
            getToken={getToken}
            notify={notify}
            onDataChanged={loadOverview}
          />
        )}
        {activeTab === 'messages' && (
          <MessagesManager
            getToken={getToken}
            notify={notify}
            onDataChanged={loadOverview}
          />
        )}
        {activeTab === 'settings' && (
          <SiteSettingsManager getToken={getToken} notify={notify} />
        )}
      </main>

      <ToastStack
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
