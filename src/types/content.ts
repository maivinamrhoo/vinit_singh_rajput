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

export type BookStatus = 'draft' | 'upcoming' | 'published';
export type JournalStatus = 'draft' | 'published' | 'scheduled';
export type PoemStatus = 'draft' | 'published';
export type PoemLanguage = 'English' | 'Hindi' | 'Hinglish';
export type NoteStatus = 'draft' | 'published';

export interface Book {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  coverImage: string;
  shortDescription: string;
  fullDescription: string;
  author: string;
  category: string;
  language: string;
  publicationDate: string;
  status: BookStatus;
  featured: boolean;
  displayOrder: number;
  googlePlayUrl: string;
  amazonUrl: string;
  wattpadUrl: string;
  otherLinks: ExternalLink[];
  seoTitle: string;
  seoDescription: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JournalPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: JournalStatus;
  publishedAt: string;
  scheduledFor: string;
  seoTitle: string;
  seoDescription: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Poem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  body: string;
  category: string;
  language: PoemLanguage;
  featured: boolean;
  status: PoemStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  category: string;
  status: NoteStatus;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  id: string;
  siteKey: string;
  heroHeading: string;
  heroDescription: string;
  heroImage: string;
  authorName: string;
  authorLocation: string;
  authorPhoto: string;
  authorBio: string;
  writingPhilosophy: string;
  literaryApproach: string;
  contactEmail: string;
  footerDescription: string;
  socialLinks: SocialLinks;
  featuredBookId: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface HomePayload {
  settings: SiteSettings;
  featuredBook: Book | null;
  books: Book[];
  upcomingBooks: Book[];
  journalPosts: JournalPost[];
  poems: Poem[];
  notes: Note[];
}

export interface SearchResults {
  query: string;
  books: Book[];
  journalPosts: JournalPost[];
  poems: Poem[];
  notes: Note[];
}

export interface AdminOverview {
  publishedBooks: number;
  upcomingBooks: number;
  publishedJournal: number;
  publishedPoems: number;
  publishedNotes: number;
  draftCount: number;
  unreadMessages: number;
  totalMessages: number;
}
