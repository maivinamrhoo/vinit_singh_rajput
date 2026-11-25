import test from 'node:test';
import assert from 'node:assert/strict';
import {
  slugify,
  isSafeHttpUrl,
  sanitizeExternalUrl,
  estimateReadingTime,
  parseFormattedBlocks,
  parseInlineTokens,
  validateContactInput,
  validateBookInput,
  isJournalPostPublic,
  validateMediaMagicBytes,
  searchAcrossCollections,
} from './contentUtils';
import type { Book, JournalPost, Note, Poem } from '../types/content';

test('slugify creates clean URL-friendly slugs', () => {
  assert.equal(slugify('Letters Across the Courtyard!'), 'letters-across-the-courtyard');
  assert.equal(slugify('  A  Quiet   Evening — Part 2 '), 'a-quiet-evening-part-2');
});

test('URL validation blocks unsafe schemes and permits valid http/https/relative paths', () => {
  assert.equal(isSafeHttpUrl('https://play.google.com/store/books'), true);
  assert.equal(isSafeHttpUrl('/api/media/abc-123'), true);
  assert.equal(isSafeHttpUrl('//evil.example/script.js'), false);
  assert.equal(isSafeHttpUrl('javascript:alert(1)'), false);
  assert.equal(isSafeHttpUrl('data:text/html,<script>alert(1)</script>'), false);
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '');
  assert.equal(sanitizeExternalUrl('https://amazon.in/dp/B001'), 'https://amazon.in/dp/B001');
});

test('estimateReadingTime computes reasonable reading duration', () => {
  assert.equal(estimateReadingTime('short note'), 1);
  assert.equal(estimateReadingTime(Array(420).fill('word').join(' ')), 3);
});

test('parseFormattedBlocks and parseInlineTokens safely handle literary markdown without HTML', () => {
  const md = [
    '## Morning Light',
    '',
    'A quiet **storybook** with *gentle* ink and a [valid link](https://example.com) plus [bad](javascript:alert(1)).',
    '',
    '> Every notebook holds a map of unspoken rooms.',
    '',
    '- Notebook',
    '- Fountain pen',
  ].join('\n');

  const blocks = parseFormattedBlocks(md);
  assert.equal(blocks.length, 4);
  assert.equal(blocks[0].type, 'h2');
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'blockquote');
  assert.equal(blocks[3].type, 'ul');

  if (blocks[1].type === 'paragraph') {
    const tokens = parseInlineTokens(blocks[1].text);
    const links = tokens.filter((t) => t.type === 'link');
    assert.equal(links.length, 1);
    assert.equal(links[0].type === 'link' && links[0].href, 'https://example.com');
  }
});

test('validateContactInput rejects invalid input and accepts valid messages', () => {
  const invalid = validateContactInput({ name: 'A', email: 'not-an-email', message: 'hi' });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.message);

  const valid = validateContactInput({
    name: 'Aarav Mehta',
    email: 'aarav@example.com',
    subject: 'Book inquiry',
    message: 'Loved reading your poetry collection and reflections.',
  });
  assert.equal(valid.valid, true);
});

test('validateBookInput enforces title, status, and safe URLs', () => {
  const bad = validateBookInput({
    title: '',
    status: 'invalid',
    amazonUrl: 'javascript:void(0)',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.title);
  assert.ok(bad.errors.status);
  assert.ok(bad.errors.amazonUrl);

  const good = validateBookInput({
    title: 'Whispers by the Banyan',
    status: 'upcoming',
    amazonUrl: 'https://www.amazon.in/example',
  });
  assert.equal(good.valid, true);
});

test('isJournalPostPublic enforces draft vs published vs scheduled visibility', () => {
  const now = new Date('2026-11-24T12:00:00Z');
  assert.equal(isJournalPostPublic({ status: 'draft', scheduledFor: '' }, now), false);
  assert.equal(isJournalPostPublic({ status: 'published', scheduledFor: '' }, now), true);
  assert.equal(
    isJournalPostPublic({ status: 'scheduled', scheduledFor: '2026-11-20T00:00:00Z' }, now),
    true
  );
  assert.equal(
    isJournalPostPublic({ status: 'scheduled', scheduledFor: '2026-12-01T00:00:00Z' }, now),
    false
  );
});

test('validateMediaMagicBytes checks PNG, JPEG, and WebP headers accurately', () => {
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpgBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const webpBuf = Buffer.from('RIFF1234WEBP', 'ascii');
  const fakeBuf = Buffer.from('<html>not an image</html>', 'utf8');

  assert.equal(validateMediaMagicBytes(pngBuf, 'image/png'), true);
  assert.equal(validateMediaMagicBytes(jpgBuf, 'image/jpeg'), true);
  assert.equal(validateMediaMagicBytes(webpBuf, 'image/webp'), true);
  assert.equal(validateMediaMagicBytes(fakeBuf, 'image/png'), false);
});

test('searchAcrossCollections excludes drafts and matches published content across collections', () => {
  const sampleBook: Book = {
    id: '1',
    title: 'Lanterns Over Riverbend',
    slug: 'lanterns',
    subtitle: '',
    coverImage: '',
    shortDescription: 'A quiet story',
    fullDescription: '',
    author: 'Vinit Singh Rajput',
    category: 'Fiction',
    language: 'English',
    publicationDate: '',
    status: 'published',
    featured: true,
    displayOrder: 0,
    googlePlayUrl: '',
    amazonUrl: '',
    wattpadUrl: '',
    otherLinks: [],
    seoTitle: '',
    seoDescription: '',
    isDemo: true,
    createdAt: '',
    updatedAt: '',
  };
  const draftBook: Book = { ...sampleBook, id: '2', title: 'Lanterns Secret Draft', slug: 'secret', status: 'draft' };
  const samplePoem: Poem = {
    id: 'p1',
    title: 'Shaam Ki Khidki',
    slug: 'shaam-ki-khidki',
    subtitle: '',
    body: 'Lanterns glow softly by the rain',
    category: 'Evening',
    language: 'Hinglish',
    featured: true,
    status: 'published',
    isDemo: true,
    createdAt: '',
    updatedAt: '',
  };
  const results = searchAcrossCollections('lanterns', {
    books: [sampleBook, draftBook],
    journalPosts: [] as JournalPost[],
    poems: [samplePoem],
    notes: [] as Note[],
  });
  assert.equal(results.books.length, 1);
  assert.equal(results.books[0].id, '1');
  assert.equal(results.poems.length, 1);
});
