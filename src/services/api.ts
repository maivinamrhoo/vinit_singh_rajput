import type {
  AdminOverview,
  Book,
  ContactMessage,
  HomePayload,
  JournalPost,
  Note,
  Poem,
  SearchResults,
  SiteSettings,
} from '../types/content';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`) as Error & {
      status?: number;
      fieldErrors?: Record<string, string>;
    };
    err.status = res.status;
    err.fieldErrors = data.fieldErrors;
    throw err;
  }
  return data as T;
}

function authHeaders(token: string): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// --- Public API ---

export async function fetchHome(): Promise<HomePayload> {
  const res = await fetch('/api/public/home');
  return handleResponse<HomePayload>(res);
}

export async function fetchPublicSettings(): Promise<SiteSettings> {
  const res = await fetch('/api/public/settings');
  return handleResponse<SiteSettings>(res);
}

export async function fetchPublicBooks(): Promise<Book[]> {
  const res = await fetch('/api/public/books');
  return handleResponse<Book[]>(res);
}

export async function fetchPublicBook(slug: string): Promise<Book> {
  const res = await fetch(`/api/public/books/${encodeURIComponent(slug)}`);
  return handleResponse<Book>(res);
}

export async function fetchPublicJournal(): Promise<JournalPost[]> {
  const res = await fetch('/api/public/journal');
  return handleResponse<JournalPost[]>(res);
}

export async function fetchPublicArticle(slug: string): Promise<JournalPost> {
  const res = await fetch(`/api/public/journal/${encodeURIComponent(slug)}`);
  return handleResponse<JournalPost>(res);
}

export async function fetchPublicPoems(): Promise<Poem[]> {
  const res = await fetch('/api/public/poetry');
  return handleResponse<Poem[]>(res);
}

export async function fetchPublicPoem(slug: string): Promise<Poem> {
  const res = await fetch(`/api/public/poetry/${encodeURIComponent(slug)}`);
  return handleResponse<Poem>(res);
}

export async function fetchPublicNotes(): Promise<Note[]> {
  const res = await fetch('/api/public/notes');
  return handleResponse<Note[]>(res);
}

export async function searchSite(query: string): Promise<SearchResults> {
  const res = await fetch(`/api/public/search?q=${encodeURIComponent(query)}`);
  return handleResponse<SearchResults>(res);
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<{ id: string; message: string }> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ id: string; message: string }>(res);
}

// --- Admin API ---

export async function fetchAdminMe(token: string) {
  const res = await fetch('/api/admin/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ uid: string; email: string; fullName: string; role: string }>(res);
}

export async function fetchAdminOverview(token: string): Promise<AdminOverview> {
  const res = await fetch('/api/admin/overview', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AdminOverview>(res);
}

export async function fetchAdminBooks(token: string): Promise<Book[]> {
  const res = await fetch('/api/admin/books', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Book[]>(res);
}

export async function createAdminBook(token: string, book: Partial<Book>): Promise<Book> {
  const res = await fetch('/api/admin/books', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(book),
  });
  return handleResponse<Book>(res);
}

export async function updateAdminBook(
  token: string,
  id: string,
  book: Partial<Book>
): Promise<Book> {
  const res = await fetch(`/api/admin/books/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(book),
  });
  return handleResponse<Book>(res);
}

export async function deleteAdminBook(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/books/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function fetchAdminJournal(token: string): Promise<JournalPost[]> {
  const res = await fetch('/api/admin/journal', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<JournalPost[]>(res);
}

export async function createAdminJournal(
  token: string,
  post: Partial<JournalPost>
): Promise<JournalPost> {
  const res = await fetch('/api/admin/journal', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(post),
  });
  return handleResponse<JournalPost>(res);
}

export async function updateAdminJournal(
  token: string,
  id: string,
  post: Partial<JournalPost>
): Promise<JournalPost> {
  const res = await fetch(`/api/admin/journal/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(post),
  });
  return handleResponse<JournalPost>(res);
}

export async function deleteAdminJournal(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/journal/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function fetchAdminPoems(token: string): Promise<Poem[]> {
  const res = await fetch('/api/admin/poetry', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Poem[]>(res);
}

export async function createAdminPoem(token: string, poem: Partial<Poem>): Promise<Poem> {
  const res = await fetch('/api/admin/poetry', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(poem),
  });
  return handleResponse<Poem>(res);
}

export async function updateAdminPoem(
  token: string,
  id: string,
  poem: Partial<Poem>
): Promise<Poem> {
  const res = await fetch(`/api/admin/poetry/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(poem),
  });
  return handleResponse<Poem>(res);
}

export async function deleteAdminPoem(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/poetry/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function fetchAdminNotes(token: string): Promise<Note[]> {
  const res = await fetch('/api/admin/notes', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Note[]>(res);
}

export async function createAdminNote(token: string, note: Partial<Note>): Promise<Note> {
  const res = await fetch('/api/admin/notes', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(note),
  });
  return handleResponse<Note>(res);
}

export async function updateAdminNote(
  token: string,
  id: string,
  note: Partial<Note>
): Promise<Note> {
  const res = await fetch(`/api/admin/notes/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(note),
  });
  return handleResponse<Note>(res);
}

export async function deleteAdminNote(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/notes/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function fetchAdminMessages(token: string): Promise<ContactMessage[]> {
  const res = await fetch('/api/admin/messages', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ContactMessage[]>(res);
}

export async function markAdminMessageRead(
  token: string,
  id: string,
  isRead: boolean
): Promise<ContactMessage> {
  const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ isRead }),
  });
  return handleResponse<ContactMessage>(res);
}

export async function deleteAdminMessage(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/messages/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse(res);
}

export async function fetchAdminSettings(token: string): Promise<SiteSettings> {
  const res = await fetch('/api/admin/settings', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<SiteSettings>(res);
}

export async function saveAdminSettings(
  token: string,
  settings: Partial<SiteSettings>
): Promise<SiteSettings> {
  const res = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(settings),
  });
  return handleResponse<SiteSettings>(res);
}

export async function uploadAdminImage(
  token: string,
  file: File
): Promise<{ id: string; url: string }> {
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read selected file.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      dataBase64,
    }),
  });
  return handleResponse<{ id: string; url: string }>(res);
}
