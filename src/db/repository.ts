import { asc, desc, eq, ne } from 'drizzle-orm';
import { db } from './index.ts';
import {
  books,
  contactMessages,
  journalPosts,
  mediaAssets,
  notes,
  poems,
  siteSettings,
} from './schema.ts';
import type {
  AdminOverview,
  Book,
  ContactMessage,
  HomePayload,
  JournalPost,
  Note,
  Poem,
  SiteSettings,
} from '../types/content.ts';
import {
  isJournalPostPublic,
  sanitizeExternalUrl,
  sanitizeImageUrl,
  searchAcrossCollections,
  slugify,
} from '../lib/contentUtils.ts';

let seededOnce = false;

const DEFAULT_HERO_IMAGE = '/src/assets/images/hero_storybook_landscape_1795586459674.jpg';
const DEFAULT_BOOK_COVER_1 = '/src/assets/images/book_cover_moonlit_letters_1795586459222.jpg';
const DEFAULT_BOOK_COVER_2 = '/src/assets/images/book_cover_garden_shadows_1795586460472.jpg';
const DEFAULT_JOURNAL_IMAGE = '/src/assets/images/journal_desk_watercolor_1795586463697.jpg';
const DEFAULT_AUTHOR_PHOTO = '/src/assets/images/author_portrait_editorial_1795586463851.jpg';

function mapBook(row: typeof books.$inferSelect): Book {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    coverImage: row.coverImage,
    shortDescription: row.shortDescription,
    fullDescription: row.fullDescription,
    author: row.author,
    category: row.category,
    language: row.language,
    publicationDate: row.publicationDate,
    status: row.status as Book['status'],
    featured: row.featured,
    displayOrder: row.displayOrder,
    googlePlayUrl: row.googlePlayUrl,
    amazonUrl: row.amazonUrl,
    wattpadUrl: row.wattpadUrl,
    otherLinks: Array.isArray(row.otherLinks) ? row.otherLinks : [],
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    isDemo: row.isDemo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapJournal(row: typeof journalPosts.$inferSelect): JournalPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status as JournalPost['status'],
    publishedAt: row.publishedAt,
    scheduledFor: row.scheduledFor,
    seoTitle: row.seoTitle,
    seoDescription: row.seoDescription,
    isDemo: row.isDemo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPoem(row: typeof poems.$inferSelect): Poem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    subtitle: row.subtitle,
    body: row.body,
    category: row.category,
    language: row.language as Poem['language'],
    featured: row.featured,
    status: row.status as Poem['status'],
    isDemo: row.isDemo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapNote(row: typeof notes.$inferSelect): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    status: row.status as Note['status'],
    isDemo: row.isDemo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapSettings(row: typeof siteSettings.$inferSelect): SiteSettings {
  return {
    id: row.id,
    siteKey: row.siteKey,
    heroHeading: row.heroHeading,
    heroDescription: row.heroDescription,
    heroImage: row.heroImage,
    authorName: row.authorName,
    authorLocation: row.authorLocation,
    authorPhoto: row.authorPhoto,
    authorBio: row.authorBio,
    writingPhilosophy: row.writingPhilosophy,
    literaryApproach: row.literaryApproach,
    contactEmail: row.contactEmail,
    footerDescription: row.footerDescription,
    socialLinks: row.socialLinks || {},
    featuredBookId: row.featuredBookId,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapMessage(row: typeof contactMessages.$inferSelect): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Ensures initial site settings and clearly marked demo showcase entries exist
 * on a brand-new database. Never invents awards, credentials, or fake reviews.
 */
export async function ensureInitialData(): Promise<void> {
  if (seededOnce) return;
  try {
    const existingSettings = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.siteKey, 'main'))
      .limit(1);

    if (!existingSettings.length) {
      await db
        .insert(siteSettings)
        .values({
          siteKey: 'main',
          heroHeading: 'Every page holds a world waiting to be discovered.',
          heroDescription:
            'Welcome to the literary world of Vinit Singh Rajput — a collection of stories, thoughts, poetry and imagination.',
          heroImage: DEFAULT_HERO_IMAGE,
          authorName: 'Vinit Singh Rajput',
          authorLocation: 'India',
          authorPhoto: DEFAULT_AUTHOR_PHOTO,
          authorBio:
            'Vinit Singh Rajput is an Indian author and writer drawn to quiet human moments, nostalgic landscapes, and the inner lives of ordinary people. Working across fiction, reflective essays, and multilingual poetry, he writes from a sunlit notebook desk where imagination meets memory.',
          writingPhilosophy:
            'Stories do not need noise to stay with a reader. A single honest sentence—written with patience and stillness—can open an entire doorway into memory, wonder, and belonging.',
          literaryApproach:
            'Writing across English, Hindi, and Hinglish, his notebooks blend evocative imagery with intimate emotional clarity. Every piece begins by hand in unhurried margins before finding its finished voice on the page.',
          contactEmail: '',
          footerDescription:
            'An independent literary sanctuary for stories, essays, poetry, and notebook reflections by Vinit Singh Rajput.',
          socialLinks: {},
          featuredBookId: '',
        })
        .onConflictDoNothing();
    }

    const existingBooks = await db.select({ id: books.id }).from(books).limit(1);
    if (!existingBooks.length) {
      await db
        .insert(books)
        .values([
          {
            title: 'Lanterns by the Stone Bridge',
            slug: 'lanterns-by-the-stone-bridge',
            subtitle: 'Sample Literary Fiction Entry — Replace from Admin Dashboard',
            coverImage: DEFAULT_BOOK_COVER_1,
            shortDescription:
              'A clearly marked sample showcase entry illustrating how your featured novel will appear with cover art, synopsis, category details, and verified reading links.',
            fullDescription:
              'This is a sample demonstration entry created to showcase the editorial book layout.\n\nFrom the private Admin Dashboard, you can edit this entry or replace it with your own published title, authentic synopsis, publication date, cover artwork, and official Google Play Books, Amazon, or Wattpad links.\n\nEvery change you save updates the live public bookshelf immediately without touching any code.',
            author: 'Vinit Singh Rajput',
            category: 'Literary Fiction',
            language: 'English',
            publicationDate: '',
            status: 'published',
            featured: true,
            displayOrder: 1,
            googlePlayUrl: '',
            amazonUrl: '',
            wattpadUrl: '',
            otherLinks: [],
            seoTitle: 'Lanterns by the Stone Bridge — Sample Book | Vinit Singh Rajput',
            seoDescription:
              'Sample book showcase entry in the literary portfolio of Vinit Singh Rajput.',
            isDemo: true,
          },
          {
            title: 'Letters Through the Courtyard Window',
            slug: 'letters-through-the-courtyard-window',
            subtitle: 'Sample Anthology Entry — Replace from Admin Dashboard',
            coverImage: DEFAULT_BOOK_COVER_2,
            shortDescription:
              'A clearly marked sample entry showing how an upcoming manuscript appears on the bookshelf and in the Upcoming Releases section.',
            fullDescription:
              'This is a sample demonstration entry marked as Upcoming.\n\nWhen you are preparing a new book, mark its status as Upcoming in the Admin Dashboard to introduce readers to the cover artwork, expected release window, and early synopsis ahead of publication.',
            author: 'Vinit Singh Rajput',
            category: 'Short Stories',
            language: 'English',
            publicationDate: '',
            status: 'upcoming',
            featured: false,
            displayOrder: 2,
            googlePlayUrl: '',
            amazonUrl: '',
            wattpadUrl: '',
            otherLinks: [],
            seoTitle: 'Letters Through the Courtyard Window — Upcoming Sample | Vinit Singh Rajput',
            seoDescription:
              'Upcoming sample book placeholder in the literary portfolio of Vinit Singh Rajput.',
            isDemo: true,
          },
        ])
        .onConflictDoNothing();
    }

    const existingJournal = await db
      .select({ id: journalPosts.id })
      .from(journalPosts)
      .limit(1);
    if (!existingJournal.length) {
      await db
        .insert(journalPosts)
        .values([
          {
            title: 'On Keeping a Quiet Notebook by the Window',
            slug: 'on-keeping-a-quiet-notebook-by-the-window',
            excerpt:
              'A sample journal essay exploring the ritual of early morning pages, unhurried tea, and listening for the first true line of a story.',
            content: [
              'Before a book ever gathers chapters, it begins as a quiet conversation in the margin of a notebook. The earliest pages rarely look finished; they carry half-remembered weather, overheard phrases, and small sketches of places that have not yet found their name.',
              '',
              '## Listening Before Writing',
              '',
              'Most mornings begin best without hurry. A cup of warm tea, an open window, and the discipline to sit still long enough for ordinary details to speak. When we stop trying to sound impressive, the writing becomes honest.',
              '',
              '> Every lasting story begins with paying closer attention to something the world walked past.',
              '',
              '### Habits From the Writing Desk',
              '',
              '- Keep one notebook dedicated strictly to unfinished fragments and sensory details.',
              '- Read drafts aloud slowly; the ear notices what the eye forgives.',
              '- Return to yesterday’s paragraph with kindness before editing a single line.',
              '',
              '*(Sample Journal Entry — You can edit, unpublish, or replace this article directly from the Admin Dashboard.)*',
            ].join('\n'),
            coverImage: DEFAULT_JOURNAL_IMAGE,
            category: 'Writing Craft',
            tags: ['notebooks', 'writing-life', 'reflections'],
            status: 'published',
            publishedAt: '2026-11-18',
            scheduledFor: '',
            seoTitle: 'On Keeping a Quiet Notebook by the Window | Vinit Singh Rajput',
            seoDescription:
              'A sample essay on notebooks, stillness, and the writing craft from Vinit Singh Rajput.',
            isDemo: true,
          },
          {
            title: 'Why Stories Live Between Two Languages',
            slug: 'why-stories-live-between-two-languages',
            excerpt:
              'Reflections on moving between English, Hindi, and Hinglish — and how each language holds its own warmth, rhythm, and cadence.',
            content: [
              'Anyone who grows up thinking in more than one language knows that certain feelings belong naturally to a specific tongue. One word carries the crispness of autumn ink; another carries the warmth of home, rain on courtyard stone, and evening conversation.',
              '',
              '## Writing Without Borders',
              '',
              'Rather than forcing every poem or essay into a single register, letting English, Hindi, and Hinglish live side by side keeps the voice faithful to lived life.',
              '',
              '> Some memories arrive in Devanagari; others knock quietly in English.',
              '',
              '*(Sample Journal Entry — Replace or expand with your own essays from the Admin Dashboard.)*',
            ].join('\n'),
            coverImage: DEFAULT_HERO_IMAGE,
            category: 'Literature',
            tags: ['language', 'poetry', 'storytelling'],
            status: 'published',
            publishedAt: '2026-11-10',
            scheduledFor: '',
            seoTitle: 'Why Stories Live Between Two Languages | Vinit Singh Rajput',
            seoDescription:
              'Sample reflection on writing across English, Hindi, and Hinglish.',
            isDemo: true,
          },
        ])
        .onConflictDoNothing();
    }

    const existingPoems = await db.select({ id: poems.id }).from(poems).limit(1);
    if (!existingPoems.length) {
      await db
        .insert(poems)
        .values([
          {
            title: 'The Unfinished Page',
            slug: 'the-unfinished-page',
            subtitle: 'Sample English Verse',
            body: [
              'Leave one window open to the afternoon,',
              'where cedar dust drifts softly through the gold,',
              'a quiet lantern waiting for the moon,',
              'a gentler story waiting to be told.',
              '',
              'The ink dries slowly on the linen sheet,',
              'and every pause becomes a place to rest,',
              'where distant hills and paper valleys meet,',
              'and quiet words remember what is best.',
            ].join('\n'),
            category: 'Stillness',
            language: 'English',
            featured: true,
            status: 'published',
            isDemo: true,
          },
          {
            title: 'शाम की खिड़की',
            slug: 'shaam-ki-khidki-hindi',
            subtitle: 'नमूना हिन्दी कविता',
            body: [
              'ढलती धूप ने कागज़ पर कुछ रंग गिरा दिए,',
              'पुरानी किताबों ने फिर से किस्से सुना दिए।',
              '',
              'खामोशी की दहलीज़ पर एक दिया जलता रहा,',
              'हर अनकहा लफ़्ज़ धीरे-धीरे कविता बनता रहा।',
            ].join('\n'),
            category: 'सांझ',
            language: 'Hindi',
            featured: true,
            status: 'published',
            isDemo: true,
          },
          {
            title: 'Kagaz Aur Chaand',
            slug: 'kagaz-aur-chaand',
            subtitle: 'Sample Hinglish Verse',
            body: [
              'Shaam ke aakhiri panne par,',
              'hawa ne kuch khamosh alfaaz rakh diye,',
              'na koi shor tha kamre mein,',
              'bas chai ki bhaap aur purane khwaab the.',
              '',
              'Jo baatein din bhar reh gayi ankahi,',
              'raat ki syaahi ne unhe ghar de diya.',
            ].join('\n'),
            category: 'Khayal',
            language: 'Hinglish',
            featured: true,
            status: 'published',
            isDemo: true,
          },
        ])
        .onConflictDoNothing();
    }

    const existingNotes = await db.select({ id: notes.id }).from(notes).limit(1);
    if (!existingNotes.length) {
      await db
        .insert(notes)
        .values([
          {
            title: 'A Note From the Writing Desk',
            body: 'Welcome to the new literary home. These sample desk notes demonstrate how short writing updates, manuscript thoughts, and reader announcements appear on the Notes page.',
            category: 'Announcement',
            status: 'published',
            isDemo: true,
          },
          {
            title: 'On Pacing a Chapter',
            body: 'Whenever a chapter feels hurried, try stepping outside for ten minutes without a phone. Most pacing troubles are simply a story asking for room to breathe.',
            category: 'Writing Desk',
            status: 'published',
            isDemo: true,
          },
        ])
        .onConflictDoNothing();
    }

    seededOnce = true;
  } catch (error) {
    console.error('Database initial seed failed:', error);
    throw new Error('Unable to initialize site content.', { cause: error });
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.siteKey, 'main'))
      .limit(1);
    if (!rows[0]) {
      throw new Error('Site settings record not found.');
    }
    return mapSettings(rows[0]);
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    throw new Error('Could not load site settings.', { cause: error });
  }
}

export async function updateSiteSettings(
  input: Partial<Omit<SiteSettings, 'id' | 'siteKey' | 'updatedAt'>>
): Promise<SiteSettings> {
  try {
    await ensureInitialData();
    const current = await getSiteSettings();

    const cleanedSocials: SiteSettings['socialLinks'] = {};
    if (input.socialLinks) {
      for (const key of [
        'instagram',
        'twitter',
        'goodreads',
        'youtube',
        'facebook',
        'linkedin',
      ] as const) {
        const safe = sanitizeExternalUrl(input.socialLinks[key] || '');
        if (safe) cleanedSocials[key] = safe;
      }
    }

    const updated = await db
      .update(siteSettings)
      .set({
        heroHeading: input.heroHeading !== undefined ? input.heroHeading.trim() : current.heroHeading,
        heroDescription:
          input.heroDescription !== undefined ? input.heroDescription.trim() : current.heroDescription,
        heroImage:
          input.heroImage !== undefined
            ? sanitizeImageUrl(input.heroImage) || current.heroImage
            : current.heroImage,
        authorName: input.authorName !== undefined ? input.authorName.trim() : current.authorName,
        authorLocation:
          input.authorLocation !== undefined ? input.authorLocation.trim() : current.authorLocation,
        authorPhoto:
          input.authorPhoto !== undefined
            ? sanitizeImageUrl(input.authorPhoto) || current.authorPhoto
            : current.authorPhoto,
        authorBio: input.authorBio !== undefined ? input.authorBio.trim() : current.authorBio,
        writingPhilosophy:
          input.writingPhilosophy !== undefined
            ? input.writingPhilosophy.trim()
            : current.writingPhilosophy,
        literaryApproach:
          input.literaryApproach !== undefined
            ? input.literaryApproach.trim()
            : current.literaryApproach,
        contactEmail:
          input.contactEmail !== undefined ? input.contactEmail.trim() : current.contactEmail,
        footerDescription:
          input.footerDescription !== undefined
            ? input.footerDescription.trim()
            : current.footerDescription,
        socialLinks: input.socialLinks !== undefined ? cleanedSocials : current.socialLinks,
        featuredBookId:
          input.featuredBookId !== undefined ? input.featuredBookId.trim() : current.featuredBookId,
        updatedAt: new Date(),
      })
      .where(eq(siteSettings.siteKey, 'main'))
      .returning();

    return mapSettings(updated[0]);
  } catch (error) {
    console.error('Failed to update site settings:', error);
    throw new Error('Could not update site settings.', { cause: error });
  }
}

export async function getPublicHomePayload(): Promise<HomePayload> {
  try {
    await ensureInitialData();
    const [settings, bookRows, journalRows, poemRows, noteRows] = await Promise.all([
      getSiteSettings(),
      db
        .select()
        .from(books)
        .where(ne(books.status, 'draft'))
        .orderBy(asc(books.displayOrder), desc(books.createdAt)),
      db
        .select()
        .from(journalPosts)
        .where(ne(journalPosts.status, 'draft'))
        .orderBy(desc(journalPosts.publishedAt), desc(journalPosts.createdAt)),
      db
        .select()
        .from(poems)
        .where(eq(poems.status, 'published'))
        .orderBy(desc(poems.featured), desc(poems.createdAt)),
      db
        .select()
        .from(notes)
        .where(eq(notes.status, 'published'))
        .orderBy(desc(notes.createdAt))
        .limit(4),
    ]);

    const allPublicBooks = bookRows.map(mapBook);
    const publishedBooks = allPublicBooks.filter((b) => b.status === 'published');
    const upcomingBooks = allPublicBooks.filter((b) => b.status === 'upcoming');

    let featuredBook: Book | null = null;
    if (settings.featuredBookId) {
      featuredBook =
        allPublicBooks.find((b) => b.id === settings.featuredBookId) || null;
    }
    if (!featuredBook) {
      featuredBook =
        publishedBooks.find((b) => b.featured) ||
        allPublicBooks.find((b) => b.featured) ||
        publishedBooks[0] ||
        upcomingBooks[0] ||
        null;
    }

    const publicJournal = journalRows
      .map(mapJournal)
      .filter((p) => isJournalPostPublic(p))
      .slice(0, 3);

    const featuredPoems = poemRows.map(mapPoem).slice(0, 3);

    return {
      settings,
      featuredBook,
      books: allPublicBooks,
      upcomingBooks,
      journalPosts: publicJournal,
      poems: featuredPoems,
      notes: noteRows.map(mapNote),
    };
  } catch (error) {
    console.error('Failed to build home payload:', error);
    throw new Error('Could not load homepage content.', { cause: error });
  }
}

// --- Books ---

export async function listPublicBooks(): Promise<Book[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(books)
      .where(ne(books.status, 'draft'))
      .orderBy(asc(books.displayOrder), desc(books.createdAt));
    return rows.map(mapBook);
  } catch (error) {
    console.error('Failed to list public books:', error);
    throw new Error('Could not load books.', { cause: error });
  }
}

export async function getPublicBookBySlug(slug: string): Promise<Book | null> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(books)
      .where(eq(books.slug, slug))
      .limit(1);
    if (!rows[0] || rows[0].status === 'draft') return null;
    return mapBook(rows[0]);
  } catch (error) {
    console.error('Failed to load book by slug:', error);
    throw new Error('Could not load book details.', { cause: error });
  }
}

export async function listAllBooksAdmin(): Promise<Book[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(books)
      .orderBy(asc(books.displayOrder), desc(books.createdAt));
    return rows.map(mapBook);
  } catch (error) {
    console.error('Failed to list admin books:', error);
    throw new Error('Could not load books for admin.', { cause: error });
  }
}

export async function createBookAdmin(input: Partial<Book>): Promise<Book> {
  try {
    const title = (input.title || '').trim();
    const baseSlug = slugify(input.slug?.trim() || title);
    const uniqueSlug = await ensureUniqueSlug(books, books.slug, baseSlug);

    const otherLinks = Array.isArray(input.otherLinks)
      ? input.otherLinks
          .map((l) => ({
            label: (l.label || '').trim(),
            url: sanitizeExternalUrl(l.url || ''),
          }))
          .filter((l) => l.label && l.url)
      : [];

    if (input.featured) {
      await db.update(books).set({ featured: false });
    }

    const inserted = await db
      .insert(books)
      .values({
        title,
        slug: uniqueSlug,
        subtitle: (input.subtitle || '').trim(),
        coverImage: sanitizeImageUrl(input.coverImage || ''),
        shortDescription: (input.shortDescription || '').trim(),
        fullDescription: (input.fullDescription || '').trim(),
        author: (input.author || 'Vinit Singh Rajput').trim(),
        category: (input.category || 'Literary Fiction').trim(),
        language: (input.language || 'English').trim(),
        publicationDate: (input.publicationDate || '').trim(),
        status: input.status || 'draft',
        featured: Boolean(input.featured),
        displayOrder: Number.isFinite(Number(input.displayOrder))
          ? Number(input.displayOrder)
          : 0,
        googlePlayUrl: sanitizeExternalUrl(input.googlePlayUrl || ''),
        amazonUrl: sanitizeExternalUrl(input.amazonUrl || ''),
        wattpadUrl: sanitizeExternalUrl(input.wattpadUrl || ''),
        otherLinks,
        seoTitle: (input.seoTitle || '').trim(),
        seoDescription: (input.seoDescription || '').trim(),
        isDemo: Boolean(input.isDemo),
      })
      .returning();

    return mapBook(inserted[0]);
  } catch (error) {
    console.error('Failed to create book:', error);
    throw new Error('Could not save book.', { cause: error });
  }
}

export async function updateBookAdmin(id: string, input: Partial<Book>): Promise<Book | null> {
  try {
    const existingRows = await db.select().from(books).where(eq(books.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return null;

    let nextSlug = existing.slug;
    if (input.slug && input.slug.trim() && input.slug.trim() !== existing.slug) {
      nextSlug = await ensureUniqueSlug(books, books.slug, slugify(input.slug), id);
    }

    const otherLinks = Array.isArray(input.otherLinks)
      ? input.otherLinks
          .map((l) => ({
            label: (l.label || '').trim(),
            url: sanitizeExternalUrl(l.url || ''),
          }))
          .filter((l) => l.label && l.url)
      : existing.otherLinks;

    if (input.featured) {
      await db.update(books).set({ featured: false }).where(ne(books.id, id));
    }

    const updated = await db
      .update(books)
      .set({
        title: input.title !== undefined ? input.title.trim() : existing.title,
        slug: nextSlug,
        subtitle: input.subtitle !== undefined ? input.subtitle.trim() : existing.subtitle,
        coverImage:
          input.coverImage !== undefined
            ? sanitizeImageUrl(input.coverImage)
            : existing.coverImage,
        shortDescription:
          input.shortDescription !== undefined
            ? input.shortDescription.trim()
            : existing.shortDescription,
        fullDescription:
          input.fullDescription !== undefined
            ? input.fullDescription.trim()
            : existing.fullDescription,
        author: input.author !== undefined ? input.author.trim() : existing.author,
        category: input.category !== undefined ? input.category.trim() : existing.category,
        language: input.language !== undefined ? input.language.trim() : existing.language,
        publicationDate:
          input.publicationDate !== undefined
            ? input.publicationDate.trim()
            : existing.publicationDate,
        status: input.status !== undefined ? input.status : existing.status,
        featured: input.featured !== undefined ? Boolean(input.featured) : existing.featured,
        displayOrder:
          input.displayOrder !== undefined && Number.isFinite(Number(input.displayOrder))
            ? Number(input.displayOrder)
            : existing.displayOrder,
        googlePlayUrl:
          input.googlePlayUrl !== undefined
            ? sanitizeExternalUrl(input.googlePlayUrl)
            : existing.googlePlayUrl,
        amazonUrl:
          input.amazonUrl !== undefined
            ? sanitizeExternalUrl(input.amazonUrl)
            : existing.amazonUrl,
        wattpadUrl:
          input.wattpadUrl !== undefined
            ? sanitizeExternalUrl(input.wattpadUrl)
            : existing.wattpadUrl,
        otherLinks,
        seoTitle: input.seoTitle !== undefined ? input.seoTitle.trim() : existing.seoTitle,
        seoDescription:
          input.seoDescription !== undefined
            ? input.seoDescription.trim()
            : existing.seoDescription,
        isDemo: input.isDemo !== undefined ? Boolean(input.isDemo) : existing.isDemo,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();

    return mapBook(updated[0]);
  } catch (error) {
    console.error('Failed to update book:', error);
    throw new Error('Could not update book.', { cause: error });
  }
}

export async function deleteBookAdmin(id: string): Promise<boolean> {
  try {
    const deleted = await db.delete(books).where(eq(books.id, id)).returning({ id: books.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete book:', error);
    throw new Error('Could not delete book.', { cause: error });
  }
}

// --- Journal ---

export async function listPublicJournal(): Promise<JournalPost[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(journalPosts)
      .where(ne(journalPosts.status, 'draft'))
      .orderBy(desc(journalPosts.publishedAt), desc(journalPosts.createdAt));
    return rows.map(mapJournal).filter((p) => isJournalPostPublic(p));
  } catch (error) {
    console.error('Failed to list public journal:', error);
    throw new Error('Could not load journal articles.', { cause: error });
  }
}

export async function getPublicJournalBySlug(slug: string): Promise<JournalPost | null> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(journalPosts)
      .where(eq(journalPosts.slug, slug))
      .limit(1);
    if (!rows[0]) return null;
    const mapped = mapJournal(rows[0]);
    return isJournalPostPublic(mapped) ? mapped : null;
  } catch (error) {
    console.error('Failed to load journal article:', error);
    throw new Error('Could not load journal article.', { cause: error });
  }
}

export async function listAllJournalAdmin(): Promise<JournalPost[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(journalPosts)
      .orderBy(desc(journalPosts.createdAt));
    return rows.map(mapJournal);
  } catch (error) {
    console.error('Failed to list admin journal:', error);
    throw new Error('Could not load journal posts for admin.', { cause: error });
  }
}

export async function createJournalAdmin(input: Partial<JournalPost>): Promise<JournalPost> {
  try {
    const title = (input.title || '').trim();
    const uniqueSlug = await ensureUniqueSlug(
      journalPosts,
      journalPosts.slug,
      slugify(input.slug?.trim() || title)
    );
    const tags = Array.isArray(input.tags)
      ? input.tags.map((t) => t.trim()).filter(Boolean)
      : [];
    const status = input.status || 'draft';
    const publishedAt =
      input.publishedAt?.trim() ||
      (status === 'published' ? new Date().toISOString().slice(0, 10) : '');

    const inserted = await db
      .insert(journalPosts)
      .values({
        title,
        slug: uniqueSlug,
        excerpt: (input.excerpt || '').trim(),
        content: (input.content || '').trim(),
        coverImage: sanitizeImageUrl(input.coverImage || ''),
        category: (input.category || 'Reflections').trim(),
        tags,
        status,
        publishedAt,
        scheduledFor: (input.scheduledFor || '').trim(),
        seoTitle: (input.seoTitle || '').trim(),
        seoDescription: (input.seoDescription || '').trim(),
        isDemo: Boolean(input.isDemo),
      })
      .returning();

    return mapJournal(inserted[0]);
  } catch (error) {
    console.error('Failed to create journal post:', error);
    throw new Error('Could not create journal article.', { cause: error });
  }
}

export async function updateJournalAdmin(
  id: string,
  input: Partial<JournalPost>
): Promise<JournalPost | null> {
  try {
    const existingRows = await db
      .select()
      .from(journalPosts)
      .where(eq(journalPosts.id, id))
      .limit(1);
    const existing = existingRows[0];
    if (!existing) return null;

    let nextSlug = existing.slug;
    if (input.slug && input.slug.trim() && input.slug.trim() !== existing.slug) {
      nextSlug = await ensureUniqueSlug(journalPosts, journalPosts.slug, slugify(input.slug), id);
    }

    const nextStatus = input.status !== undefined ? input.status : existing.status;
    let nextPublishedAt =
      input.publishedAt !== undefined ? input.publishedAt.trim() : existing.publishedAt;
    if (nextStatus === 'published' && !nextPublishedAt) {
      nextPublishedAt = new Date().toISOString().slice(0, 10);
    }

    const updated = await db
      .update(journalPosts)
      .set({
        title: input.title !== undefined ? input.title.trim() : existing.title,
        slug: nextSlug,
        excerpt: input.excerpt !== undefined ? input.excerpt.trim() : existing.excerpt,
        content: input.content !== undefined ? input.content.trim() : existing.content,
        coverImage:
          input.coverImage !== undefined
            ? sanitizeImageUrl(input.coverImage)
            : existing.coverImage,
        category: input.category !== undefined ? input.category.trim() : existing.category,
        tags: Array.isArray(input.tags)
          ? input.tags.map((t) => t.trim()).filter(Boolean)
          : existing.tags,
        status: nextStatus,
        publishedAt: nextPublishedAt,
        scheduledFor:
          input.scheduledFor !== undefined ? input.scheduledFor.trim() : existing.scheduledFor,
        seoTitle: input.seoTitle !== undefined ? input.seoTitle.trim() : existing.seoTitle,
        seoDescription:
          input.seoDescription !== undefined
            ? input.seoDescription.trim()
            : existing.seoDescription,
        isDemo: input.isDemo !== undefined ? Boolean(input.isDemo) : existing.isDemo,
        updatedAt: new Date(),
      })
      .where(eq(journalPosts.id, id))
      .returning();

    return mapJournal(updated[0]);
  } catch (error) {
    console.error('Failed to update journal post:', error);
    throw new Error('Could not update journal article.', { cause: error });
  }
}

export async function deleteJournalAdmin(id: string): Promise<boolean> {
  try {
    const deleted = await db
      .delete(journalPosts)
      .where(eq(journalPosts.id, id))
      .returning({ id: journalPosts.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete journal post:', error);
    throw new Error('Could not delete journal article.', { cause: error });
  }
}

// --- Poetry ---

export async function listPublicPoems(): Promise<Poem[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(poems)
      .where(eq(poems.status, 'published'))
      .orderBy(desc(poems.featured), desc(poems.createdAt));
    return rows.map(mapPoem);
  } catch (error) {
    console.error('Failed to list public poems:', error);
    throw new Error('Could not load poems.', { cause: error });
  }
}

export async function getPublicPoemBySlug(slug: string): Promise<Poem | null> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(poems)
      .where(eq(poems.slug, slug))
      .limit(1);
    if (!rows[0] || rows[0].status !== 'published') return null;
    return mapPoem(rows[0]);
  } catch (error) {
    console.error('Failed to load poem by slug:', error);
    throw new Error('Could not load poem.', { cause: error });
  }
}

export async function listAllPoemsAdmin(): Promise<Poem[]> {
  try {
    await ensureInitialData();
    const rows = await db.select().from(poems).orderBy(desc(poems.createdAt));
    return rows.map(mapPoem);
  } catch (error) {
    console.error('Failed to list admin poems:', error);
    throw new Error('Could not load poems for admin.', { cause: error });
  }
}

export async function createPoemAdmin(input: Partial<Poem>): Promise<Poem> {
  try {
    const title = (input.title || '').trim();
    const uniqueSlug = await ensureUniqueSlug(
      poems,
      poems.slug,
      slugify(input.slug?.trim() || title)
    );
    const inserted = await db
      .insert(poems)
      .values({
        title,
        slug: uniqueSlug,
        subtitle: (input.subtitle || '').trim(),
        body: (input.body || '').replace(/\r\n/g, '\n'),
        category: (input.category || 'Lyric').trim(),
        language: input.language || 'English',
        featured: Boolean(input.featured),
        status: input.status || 'draft',
        isDemo: Boolean(input.isDemo),
      })
      .returning();
    return mapPoem(inserted[0]);
  } catch (error) {
    console.error('Failed to create poem:', error);
    throw new Error('Could not save poem.', { cause: error });
  }
}

export async function updatePoemAdmin(id: string, input: Partial<Poem>): Promise<Poem | null> {
  try {
    const existingRows = await db.select().from(poems).where(eq(poems.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return null;

    let nextSlug = existing.slug;
    if (input.slug && input.slug.trim() && input.slug.trim() !== existing.slug) {
      nextSlug = await ensureUniqueSlug(poems, poems.slug, slugify(input.slug), id);
    }

    const updated = await db
      .update(poems)
      .set({
        title: input.title !== undefined ? input.title.trim() : existing.title,
        slug: nextSlug,
        subtitle: input.subtitle !== undefined ? input.subtitle.trim() : existing.subtitle,
        body: input.body !== undefined ? input.body.replace(/\r\n/g, '\n') : existing.body,
        category: input.category !== undefined ? input.category.trim() : existing.category,
        language: input.language !== undefined ? input.language : existing.language,
        featured: input.featured !== undefined ? Boolean(input.featured) : existing.featured,
        status: input.status !== undefined ? input.status : existing.status,
        isDemo: input.isDemo !== undefined ? Boolean(input.isDemo) : existing.isDemo,
        updatedAt: new Date(),
      })
      .where(eq(poems.id, id))
      .returning();

    return mapPoem(updated[0]);
  } catch (error) {
    console.error('Failed to update poem:', error);
    throw new Error('Could not update poem.', { cause: error });
  }
}

export async function deletePoemAdmin(id: string): Promise<boolean> {
  try {
    const deleted = await db.delete(poems).where(eq(poems.id, id)).returning({ id: poems.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete poem:', error);
    throw new Error('Could not delete poem.', { cause: error });
  }
}

// --- Notes ---

export async function listPublicNotes(): Promise<Note[]> {
  try {
    await ensureInitialData();
    const rows = await db
      .select()
      .from(notes)
      .where(eq(notes.status, 'published'))
      .orderBy(desc(notes.createdAt));
    return rows.map(mapNote);
  } catch (error) {
    console.error('Failed to list public notes:', error);
    throw new Error('Could not load notes.', { cause: error });
  }
}

export async function listAllNotesAdmin(): Promise<Note[]> {
  try {
    await ensureInitialData();
    const rows = await db.select().from(notes).orderBy(desc(notes.createdAt));
    return rows.map(mapNote);
  } catch (error) {
    console.error('Failed to list admin notes:', error);
    throw new Error('Could not load notes for admin.', { cause: error });
  }
}

export async function createNoteAdmin(input: Partial<Note>): Promise<Note> {
  try {
    const inserted = await db
      .insert(notes)
      .values({
        title: (input.title || '').trim(),
        body: (input.body || '').trim(),
        category: (input.category || 'Writing Desk').trim(),
        status: input.status || 'draft',
        isDemo: Boolean(input.isDemo),
      })
      .returning();
    return mapNote(inserted[0]);
  } catch (error) {
    console.error('Failed to create note:', error);
    throw new Error('Could not save note.', { cause: error });
  }
}

export async function updateNoteAdmin(id: string, input: Partial<Note>): Promise<Note | null> {
  try {
    const existingRows = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
    const existing = existingRows[0];
    if (!existing) return null;

    const updated = await db
      .update(notes)
      .set({
        title: input.title !== undefined ? input.title.trim() : existing.title,
        body: input.body !== undefined ? input.body.trim() : existing.body,
        category: input.category !== undefined ? input.category.trim() : existing.category,
        status: input.status !== undefined ? input.status : existing.status,
        isDemo: input.isDemo !== undefined ? Boolean(input.isDemo) : existing.isDemo,
        updatedAt: new Date(),
      })
      .where(eq(notes.id, id))
      .returning();

    return mapNote(updated[0]);
  } catch (error) {
    console.error('Failed to update note:', error);
    throw new Error('Could not update note.', { cause: error });
  }
}

export async function deleteNoteAdmin(id: string): Promise<boolean> {
  try {
    const deleted = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw new Error('Could not delete note.', { cause: error });
  }
}

// --- Contact Messages ---

export async function createContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ContactMessage> {
  try {
    const inserted = await db
      .insert(contactMessages)
      .values({
        name: input.name.trim(),
        email: input.email.trim(),
        subject: (input.subject || '').trim(),
        message: input.message.trim(),
      })
      .returning();
    return mapMessage(inserted[0]);
  } catch (error) {
    console.error('Failed to create contact message:', error);
    throw new Error('Could not submit your message. Please try again.', { cause: error });
  }
}

export async function listContactMessagesAdmin(): Promise<ContactMessage[]> {
  try {
    const rows = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    return rows.map(mapMessage);
  } catch (error) {
    console.error('Failed to load contact messages:', error);
    throw new Error('Could not load contact messages.', { cause: error });
  }
}

export async function markContactMessageReadAdmin(
  id: string,
  isRead: boolean
): Promise<ContactMessage | null> {
  try {
    const updated = await db
      .update(contactMessages)
      .set({ isRead })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated[0] ? mapMessage(updated[0]) : null;
  } catch (error) {
    console.error('Failed to update contact message:', error);
    throw new Error('Could not update message status.', { cause: error });
  }
}

export async function deleteContactMessageAdmin(id: string): Promise<boolean> {
  try {
    const deleted = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id))
      .returning({ id: contactMessages.id });
    return deleted.length > 0;
  } catch (error) {
    console.error('Failed to delete contact message:', error);
    throw new Error('Could not delete contact message.', { cause: error });
  }
}

// --- Media Assets ---

export async function saveMediaAsset(input: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  dataBase64: string;
  uploadedByUid: string;
}): Promise<{ id: string; url: string }> {
  try {
    const inserted = await db
      .insert(mediaAssets)
      .values(input)
      .returning({ id: mediaAssets.id });
    const id = inserted[0].id;
    return { id, url: `/api/media/${id}` };
  } catch (error) {
    console.error('Failed to save media asset:', error);
    throw new Error('Could not upload image.', { cause: error });
  }
}

export async function getMediaAssetById(id: string) {
  try {
    const rows = await db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);
    return rows[0] || null;
  } catch (error) {
    console.error('Failed to retrieve media asset:', error);
    throw new Error('Could not load image.', { cause: error });
  }
}

// --- Search & Admin Overview ---

export async function searchPublicSite(query: string) {
  try {
    await ensureInitialData();
    const [publicBooks, publicJournal, publicPoems, publicNotes] = await Promise.all([
      listPublicBooks(),
      listPublicJournal(),
      listPublicPoems(),
      listPublicNotes(),
    ]);
    return searchAcrossCollections(query, {
      books: publicBooks,
      journalPosts: publicJournal,
      poems: publicPoems,
      notes: publicNotes,
    });
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error('Search could not be completed right now.', { cause: error });
  }
}

export async function getAdminOverview(): Promise<AdminOverview> {
  try {
    await ensureInitialData();
    const [allBooks, allJournal, allPoems, allNotes, allMessages] = await Promise.all([
      db.select({ status: books.status }).from(books),
      db.select({ status: journalPosts.status }).from(journalPosts),
      db.select({ status: poems.status }).from(poems),
      db.select({ status: notes.status }).from(notes),
      db.select({ isRead: contactMessages.isRead }).from(contactMessages),
    ]);

    const publishedBooks = allBooks.filter((b) => b.status === 'published').length;
    const upcomingBooks = allBooks.filter((b) => b.status === 'upcoming').length;
    const publishedJournal = allJournal.filter((p) => p.status === 'published').length;
    const publishedPoems = allPoems.filter((p) => p.status === 'published').length;
    const publishedNotes = allNotes.filter((n) => n.status === 'published').length;

    const draftCount =
      allBooks.filter((b) => b.status === 'draft').length +
      allJournal.filter((p) => p.status === 'draft' || p.status === 'scheduled').length +
      allPoems.filter((p) => p.status === 'draft').length +
      allNotes.filter((n) => n.status === 'draft').length;

    const unreadMessages = allMessages.filter((m) => !m.isRead).length;

    return {
      publishedBooks,
      upcomingBooks,
      publishedJournal,
      publishedPoems,
      publishedNotes,
      draftCount,
      unreadMessages,
      totalMessages: allMessages.length,
    };
  } catch (error) {
    console.error('Failed to build admin overview:', error);
    throw new Error('Could not load dashboard metrics.', { cause: error });
  }
}

async function ensureUniqueSlug(
  table: any,
  slugColumn: any,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const existing = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(slugColumn, candidate))
      .limit(1);
    if (!existing.length || (excludeId && existing[0].id === excludeId)) {
      return candidate;
    }
    candidate = `${baseSlug}-${suffix++}`;
  }
}
