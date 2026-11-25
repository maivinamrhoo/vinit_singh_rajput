import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { requireAdmin, AuthRequest } from './src/middleware/auth.ts';
import {
  createBookAdmin,
  createContactMessage,
  createJournalAdmin,
  createNoteAdmin,
  createPoemAdmin,
  deleteBookAdmin,
  deleteContactMessageAdmin,
  deleteJournalAdmin,
  deleteNoteAdmin,
  deletePoemAdmin,
  getAdminOverview,
  getMediaAssetById,
  getPublicBookBySlug,
  getPublicHomePayload,
  getPublicJournalBySlug,
  getPublicPoemBySlug,
  getSiteSettings,
  listAllBooksAdmin,
  listAllJournalAdmin,
  listAllNotesAdmin,
  listAllPoemsAdmin,
  listContactMessagesAdmin,
  listPublicBooks,
  listPublicJournal,
  listPublicNotes,
  listPublicPoems,
  markContactMessageReadAdmin,
  saveMediaAsset,
  searchPublicSite,
  updateBookAdmin,
  updateJournalAdmin,
  updateNoteAdmin,
  updatePoemAdmin,
  updateSiteSettings,
} from './src/db/repository.ts';
import {
  validateBookInput,
  validateContactInput,
  validateMediaMagicBytes,
} from './src/lib/contentUtils.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable('x-powered-by');
  app.use(express.json({ limit: '8mb' }));

  // Basic security headers (preserving iframe compatibility)
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // --- SEO: Dynamic Sitemap & Robots ---
  app.get('/robots.txt', (req, res) => {
    const baseUrl =
      process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /api/',
        `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const baseUrl = (
        process.env.APP_URL || `${req.protocol}://${req.get('host')}`
      ).replace(/\/$/, '');
      const [publicBooks, publicJournal, publicPoems] = await Promise.all([
        listPublicBooks(),
        listPublicJournal(),
        listPublicPoems(),
      ]);

      const staticPaths = [
        '/',
        '/books',
        '/journal',
        '/poetry',
        '/about',
        '/notes',
        '/contact',
      ];
      const urls = [
        ...staticPaths.map((p) => `${baseUrl}${p}`),
        ...publicBooks.map((b) => `${baseUrl}/books/${encodeURIComponent(b.slug)}`),
        ...publicJournal.map((j) => `${baseUrl}/journal/${encodeURIComponent(j.slug)}`),
        ...publicPoems.map((p) => `${baseUrl}/poetry/${encodeURIComponent(p.slug)}`),
      ];

      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map((u) => `  <url><loc>${u}</loc></url>`),
        '</urlset>',
      ].join('\n');

      res.type('application/xml').send(xml);
    } catch (error) {
      console.error('Sitemap generation failed:', error);
      res.status(500).type('text/plain').send('Unable to generate sitemap.');
    }
  });

  // --- Public API Routes ---
  app.get('/api/public/home', async (_req, res) => {
    try {
      const data = await getPublicHomePayload();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load homepage.' });
    }
  });

  app.get('/api/public/settings', async (_req, res) => {
    try {
      const settings = await getSiteSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load settings.' });
    }
  });

  app.get('/api/public/books', async (_req, res) => {
    try {
      const items = await listPublicBooks();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load books.' });
    }
  });

  app.get('/api/public/books/:slug', async (req, res) => {
    try {
      const book = await getPublicBookBySlug(req.params.slug);
      if (!book) return res.status(404).json({ error: 'Book not found.' });
      res.json(book);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load book.' });
    }
  });

  app.get('/api/public/journal', async (_req, res) => {
    try {
      const items = await listPublicJournal();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load journal.' });
    }
  });

  app.get('/api/public/journal/:slug', async (req, res) => {
    try {
      const post = await getPublicJournalBySlug(req.params.slug);
      if (!post) return res.status(404).json({ error: 'Article not found.' });
      res.json(post);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load article.' });
    }
  });

  app.get('/api/public/poetry', async (_req, res) => {
    try {
      const items = await listPublicPoems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load poetry.' });
    }
  });

  app.get('/api/public/poetry/:slug', async (req, res) => {
    try {
      const poem = await getPublicPoemBySlug(req.params.slug);
      if (!poem) return res.status(404).json({ error: 'Poem not found.' });
      res.json(poem);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load poem.' });
    }
  });

  app.get('/api/public/notes', async (_req, res) => {
    try {
      const items = await listPublicNotes();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load notes.' });
    }
  });

  app.get('/api/public/search', async (req, res) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = await searchPublicSite(q);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Search failed.' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const validation = validateContactInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Please check the highlighted fields.',
          fieldErrors: validation.errors,
        });
      }
      const saved = await createContactMessage({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject || '',
        message: req.body.message,
      });
      res.status(201).json({
        id: saved.id,
        message: 'Thank you for writing. Your message has been received.',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Could not send message.' });
    }
  });

  // --- Public Media Delivery ---
  app.get('/api/media/:id', async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid media ID.' });
    }
    try {
      const asset = await getMediaAssetById(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Image not found.' });
      const buffer = Buffer.from(asset.dataBase64, 'base64');
      res.setHeader('Content-Type', asset.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Could not load image.' });
    }
  });

  // --- Protected Admin API Routes ---
  app.get('/api/admin/me', requireAdmin, (req: AuthRequest, res) => {
    res.json({
      uid: req.profile?.uid,
      email: req.profile?.email,
      fullName: req.profile?.fullName,
      role: req.profile?.role,
    });
  });

  app.get('/api/admin/overview', requireAdmin, async (_req, res) => {
    try {
      const overview = await getAdminOverview();
      res.json(overview);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load overview.' });
    }
  });

  // Admin Books
  app.get('/api/admin/books', requireAdmin, async (_req, res) => {
    try {
      res.json(await listAllBooksAdmin());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load books.' });
    }
  });

  app.post('/api/admin/books', requireAdmin, async (req, res) => {
    try {
      const validation = validateBookInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Please correct the book form fields.',
          fieldErrors: validation.errors,
        });
      }
      const created = await createBookAdmin(req.body);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create book.' });
    }
  });

  app.put('/api/admin/books/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    try {
      const validation = validateBookInput(req.body || {});
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Please correct the book form fields.',
          fieldErrors: validation.errors,
        });
      }
      const updated = await updateBookAdmin(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Book not found.' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update book.' });
    }
  });

  app.delete('/api/admin/books/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    try {
      const ok = await deleteBookAdmin(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Book not found.' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete book.' });
    }
  });

  // Admin Journal
  app.get('/api/admin/journal', requireAdmin, async (_req, res) => {
    try {
      res.json(await listAllJournalAdmin());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load journal.' });
    }
  });

  app.post('/api/admin/journal', requireAdmin, async (req, res) => {
    try {
      if (!(req.body?.title || '').trim()) {
        return res.status(400).json({ error: 'Article title is required.' });
      }
      res.status(201).json(await createJournalAdmin(req.body));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create article.' });
    }
  });

  app.put('/api/admin/journal/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }
    try {
      const updated = await updateJournalAdmin(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Article not found.' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update article.' });
    }
  });

  app.delete('/api/admin/journal/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid article ID.' });
    }
    try {
      const ok = await deleteJournalAdmin(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Article not found.' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete article.' });
    }
  });

  // Admin Poetry
  app.get('/api/admin/poetry', requireAdmin, async (_req, res) => {
    try {
      res.json(await listAllPoemsAdmin());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load poems.' });
    }
  });

  app.post('/api/admin/poetry', requireAdmin, async (req, res) => {
    try {
      if (!(req.body?.title || '').trim() || !(req.body?.body || '').trim()) {
        return res.status(400).json({ error: 'Poem title and verses are required.' });
      }
      res.status(201).json(await createPoemAdmin(req.body));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create poem.' });
    }
  });

  app.put('/api/admin/poetry/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid poem ID.' });
    }
    try {
      const updated = await updatePoemAdmin(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Poem not found.' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update poem.' });
    }
  });

  app.delete('/api/admin/poetry/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid poem ID.' });
    }
    try {
      const ok = await deletePoemAdmin(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Poem not found.' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete poem.' });
    }
  });

  // Admin Notes
  app.get('/api/admin/notes', requireAdmin, async (_req, res) => {
    try {
      res.json(await listAllNotesAdmin());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load notes.' });
    }
  });

  app.post('/api/admin/notes', requireAdmin, async (req, res) => {
    try {
      if (!(req.body?.title || '').trim() || !(req.body?.body || '').trim()) {
        return res.status(400).json({ error: 'Note title and body are required.' });
      }
      res.status(201).json(await createNoteAdmin(req.body));
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to create note.' });
    }
  });

  app.put('/api/admin/notes/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid note ID.' });
    }
    try {
      const updated = await updateNoteAdmin(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Note not found.' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update note.' });
    }
  });

  app.delete('/api/admin/notes/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid note ID.' });
    }
    try {
      const ok = await deleteNoteAdmin(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Note not found.' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete note.' });
    }
  });

  // Admin Contact Messages
  app.get('/api/admin/messages', requireAdmin, async (_req, res) => {
    try {
      res.json(await listContactMessagesAdmin());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load messages.' });
    }
  });

  app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid message ID.' });
    }
    try {
      const updated = await markContactMessageReadAdmin(
        req.params.id,
        Boolean(req.body?.isRead)
      );
      if (!updated) return res.status(404).json({ error: 'Message not found.' });
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to update message.' });
    }
  });

  app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    if (!isValidUuid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid message ID.' });
    }
    try {
      const ok = await deleteContactMessageAdmin(req.params.id);
      if (!ok) return res.status(404).json({ error: 'Message not found.' });
      res.json({ deleted: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to delete message.' });
    }
  });

  // Admin Site Settings
  app.get('/api/admin/settings', requireAdmin, async (_req, res) => {
    try {
      res.json(await getSiteSettings());
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to load settings.' });
    }
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    try {
      const updated = await updateSiteSettings(req.body || {});
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save settings.' });
    }
  });

  // Admin Image Upload (base64 JSON payload validated for MIME + magic bytes + size)
  app.post('/api/admin/upload', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { filename, mimeType, dataBase64 } = req.body || {};
      if (!filename || !mimeType || !dataBase64) {
        return res.status(400).json({ error: 'Image file data is required.' });
      }
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return res
          .status(400)
          .json({ error: 'Only JPEG, PNG, and WebP images are supported.' });
      }
      const cleanBase64 = String(dataBase64).replace(/^data:image\/[a-z+]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      if (buffer.length === 0 || buffer.length > MAX_UPLOAD_BYTES) {
        return res.status(400).json({ error: 'Image must be smaller than 5 MB.' });
      }
      if (!validateMediaMagicBytes(buffer, mimeType)) {
        return res
          .status(400)
          .json({ error: 'Uploaded file signature does not match a valid image.' });
      }
      const safeFilename = path.basename(String(filename)).slice(0, 120);
      const saved = await saveMediaAsset({
        filename: safeFilename,
        mimeType,
        sizeBytes: buffer.length,
        dataBase64: cleanBase64,
        uploadedByUid: req.user?.uid || '',
      });
      res.status(201).json(saved);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Could not upload image.' });
    }
  });

  // --- Frontend Serving (Vite dev middleware or static dist) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
