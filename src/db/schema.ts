import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export interface ExternalLink {
  label: string;
  url: string;
}

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  goodreads?: string;
  youtube?: string;
  facebook?: string;
  linkedin?: string;
}

export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').default('').notNull(),
  role: text('role').default('reader').notNull(), // 'admin' | 'reader'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const books = pgTable('books', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  subtitle: text('subtitle').default('').notNull(),
  coverImage: text('cover_image').default('').notNull(),
  shortDescription: text('short_description').default('').notNull(),
  fullDescription: text('full_description').default('').notNull(),
  author: text('author').default('Vinit Singh Rajput').notNull(),
  category: text('category').default('Literary Fiction').notNull(),
  language: text('language').default('English').notNull(),
  publicationDate: text('publication_date').default('').notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'upcoming' | 'published'
  featured: boolean('featured').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  googlePlayUrl: text('google_play_url').default('').notNull(),
  amazonUrl: text('amazon_url').default('').notNull(),
  wattpadUrl: text('wattpad_url').default('').notNull(),
  otherLinks: jsonb('other_links').$type<ExternalLink[]>().default([]).notNull(),
  seoTitle: text('seo_title').default('').notNull(),
  seoDescription: text('seo_description').default('').notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const journalPosts = pgTable('journal_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt').default('').notNull(),
  content: text('content').default('').notNull(),
  coverImage: text('cover_image').default('').notNull(),
  category: text('category').default('Reflections').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'published' | 'scheduled'
  publishedAt: text('published_at').default('').notNull(),
  scheduledFor: text('scheduled_for').default('').notNull(),
  seoTitle: text('seo_title').default('').notNull(),
  seoDescription: text('seo_description').default('').notNull(),
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const poems = pgTable('poems', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  subtitle: text('subtitle').default('').notNull(),
  body: text('body').notNull(),
  category: text('category').default('Lyric').notNull(),
  language: text('language').default('English').notNull(), // 'English' | 'Hindi' | 'Hinglish'
  featured: boolean('featured').default(false).notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'published'
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  category: text('category').default('Writing Desk').notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'published'
  isDemo: boolean('is_demo').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  siteKey: text('site_key').default('main').notNull().unique(),
  heroHeading: text('hero_heading')
    .default('Every page holds a world waiting to be discovered.')
    .notNull(),
  heroDescription: text('hero_description')
    .default(
      'Welcome to the literary world of Vinit Singh Rajput — a collection of stories, thoughts, poetry and imagination.'
    )
    .notNull(),
  heroImage: text('hero_image')
    .default('/src/assets/images/hero_storybook_landscape_1795586459674.jpg')
    .notNull(),
  authorName: text('author_name').default('Vinit Singh Rajput').notNull(),
  authorLocation: text('author_location').default('India').notNull(),
  authorPhoto: text('author_photo')
    .default('/src/assets/images/author_portrait_editorial_1795586463851.jpg')
    .notNull(),
  authorBio: text('author_bio').default('').notNull(),
  writingPhilosophy: text('writing_philosophy').default('').notNull(),
  literaryApproach: text('literary_approach').default('').notNull(),
  contactEmail: text('contact_email').default('').notNull(),
  footerDescription: text('footer_description')
    .default(
      'Stories, essays, poetry, and quiet notebooks from the desk of Vinit Singh Rajput.'
    )
    .notNull(),
  socialLinks: jsonb('social_links').$type<SocialLinks>().default({}).notNull(),
  featuredBookId: text('featured_book_id').default('').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').default('').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  dataBase64: text('data_base64').notNull(),
  uploadedByUid: text('uploaded_by_uid').default('').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
