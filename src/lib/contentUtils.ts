import type { Book, JournalPost, Note, Poem } from '../types/content';

export function slugify(input: string): string {
  const cleaned = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `entry-${Date.now()}`;
}

export function isSafeHttpUrl(url: string): boolean {
  const trimmed = (url || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) {
    return !trimmed.startsWith('//');
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return parsed.toString();
    }
    return '';
  } catch {
    return '';
  }
}

export function sanitizeImageUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }
  return sanitizeExternalUrl(trimmed);
}

export function estimateReadingTime(text: string): number {
  const words = (text || '')
    .replace(/[#*_>`[\]()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatLiteraryDate(dateStr: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return dateStr;
  }
  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'link'; label: string; href: string };

export type FormattedBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'paragraph'; text: string };

export function parseInlineTokens(line: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: line.slice(lastIndex, match.index) });
    }
    const raw = match[0];
    if (raw.startsWith('**') && raw.endsWith('**')) {
      tokens.push({ type: 'bold', value: raw.slice(2, -2) });
    } else if (raw.startsWith('*') && raw.endsWith('*')) {
      tokens.push({ type: 'italic', value: raw.slice(1, -1) });
    } else if (raw.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(raw);
      if (linkMatch) {
        const safeHref = isSafeHttpUrl(linkMatch[2]) ? linkMatch[2].trim() : '';
        if (safeHref) {
          tokens.push({ type: 'link', label: linkMatch[1], href: safeHref });
        } else {
          tokens.push({ type: 'text', value: linkMatch[1] });
        }
      }
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: 'text', value: line.slice(lastIndex) });
  }
  return tokens;
}

export function parseFormattedBlocks(content: string): FormattedBlock[] {
  const lines = (content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: FormattedBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', text: trimmed.slice(4).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'h2', text: trimmed.slice(3).trim() });
      i++;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        quoteLines.push(lines[i].trim().slice(2).trim());
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trim().startsWith('## ') &&
      !lines[i].trim().startsWith('### ') &&
      !lines[i].trim().startsWith('> ') &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

export function validateContactInput(input: {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const subject = (input.subject || '').trim();
  const message = (input.message || '').trim();

  if (name.length < 2) {
    errors.name = 'Please enter your name (at least 2 characters).';
  } else if (name.length > 120) {
    errors.name = 'Name must be 120 characters or fewer.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (subject.length > 180) {
    errors.subject = 'Subject must be 180 characters or fewer.';
  }

  if (message.length < 10) {
    errors.message = 'Please share a brief message (at least 10 characters).';
  } else if (message.length > 4000) {
    errors.message = 'Message must be 4,000 characters or fewer.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateBookInput(input: {
  title?: string;
  status?: string;
  googlePlayUrl?: string;
  amazonUrl?: string;
  wattpadUrl?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!(input.title || '').trim()) {
    errors.title = 'Book title is required.';
  }
  const allowedStatuses = ['draft', 'upcoming', 'published'];
  if (input.status && !allowedStatuses.includes(input.status)) {
    errors.status = 'Status must be draft, upcoming, or published.';
  }
  const urlFields: Array<['googlePlayUrl' | 'amazonUrl' | 'wattpadUrl', string]> = [
    ['googlePlayUrl', 'Google Play Books URL'],
    ['amazonUrl', 'Amazon URL'],
    ['wattpadUrl', 'Wattpad URL'],
  ];
  for (const [key, label] of urlFields) {
    const val = (input[key] || '').trim();
    if (val && !sanitizeExternalUrl(val)) {
      errors[key] = `${label} must be a valid http:// or https:// URL.`;
    }
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function isJournalPostPublic(
  post: Pick<JournalPost, 'status' | 'scheduledFor'>,
  now: Date = new Date()
): boolean {
  if (post.status === 'published') return true;
  if (post.status === 'scheduled' && post.scheduledFor) {
    const scheduledTime = new Date(post.scheduledFor);
    return !Number.isNaN(scheduledTime.getTime()) && scheduledTime.getTime() <= now.getTime();
  }
  return false;
}

export function validateMediaMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (!buffer || buffer.length < 12) return false;
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  return false;
}

export function searchAcrossCollections(
  query: string,
  collections: {
    books: Book[];
    journalPosts: JournalPost[];
    poems: Poem[];
    notes: Note[];
  }
) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    return {
      query: '',
      books: [],
      journalPosts: [],
      poems: [],
      notes: [],
    };
  }

  const books = collections.books.filter(
    (b) =>
      b.status !== 'draft' &&
      [b.title, b.subtitle, b.shortDescription, b.fullDescription, b.category, b.language]
        .join(' ')
        .toLowerCase()
        .includes(q)
  );

  const journalPosts = collections.journalPosts.filter(
    (p) =>
      isJournalPostPublic(p) &&
      [p.title, p.excerpt, p.content, p.category, ...(p.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
  );

  const poems = collections.poems.filter(
    (p) =>
      p.status === 'published' &&
      [p.title, p.subtitle, p.body, p.category, p.language]
        .join(' ')
        .toLowerCase()
        .includes(q)
  );

  const notes = collections.notes.filter(
    (n) =>
      n.status === 'published' &&
      [n.title, n.body, n.category].join(' ').toLowerCase().includes(q)
  );

  return { query: query.trim(), books, journalPosts, poems, notes };
}
