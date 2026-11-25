-- Vinit Singh Rajput — Author Website PostgreSQL / Supabase Schema + RLS Policies
-- UUID primary keys, strict Row Level Security, and storage bucket policies.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles (links auth users to admin role; no public signups)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'reader' CHECK (role IN ('admin', 'reader')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Books
CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  short_description TEXT NOT NULL DEFAULT '',
  full_description TEXT NOT NULL DEFAULT '',
  author TEXT NOT NULL DEFAULT 'Vinit Singh Rajput',
  category TEXT NOT NULL DEFAULT 'Literary Fiction',
  language TEXT NOT NULL DEFAULT 'English',
  publication_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'upcoming', 'published')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  google_play_url TEXT NOT NULL DEFAULT '',
  amazon_url TEXT NOT NULL DEFAULT '',
  wattpad_url TEXT NOT NULL DEFAULT '',
  other_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Journal Posts
CREATE TABLE IF NOT EXISTS public.journal_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Reflections',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TEXT NOT NULL DEFAULT '',
  scheduled_for TEXT NOT NULL DEFAULT '',
  seo_title TEXT NOT NULL DEFAULT '',
  seo_description TEXT NOT NULL DEFAULT '',
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Poems
CREATE TABLE IF NOT EXISTS public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Lyric',
  language TEXT NOT NULL DEFAULT 'English' CHECK (language IN ('English', 'Hindi', 'Hinglish')),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Notes
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Writing Desk',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_key TEXT NOT NULL UNIQUE DEFAULT 'main',
  hero_heading TEXT NOT NULL DEFAULT 'Every page holds a world waiting to be discovered.',
  hero_description TEXT NOT NULL DEFAULT 'Welcome to the literary world of Vinit Singh Rajput — a collection of stories, thoughts, poetry and imagination.',
  hero_image TEXT NOT NULL DEFAULT '',
  author_name TEXT NOT NULL DEFAULT 'Vinit Singh Rajput',
  author_location TEXT NOT NULL DEFAULT 'India',
  author_photo TEXT NOT NULL DEFAULT '',
  author_bio TEXT NOT NULL DEFAULT '',
  writing_philosophy TEXT NOT NULL DEFAULT '',
  literary_approach TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  footer_description TEXT NOT NULL DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  featured_book_id TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Contact Messages (strictly private to admins for read/delete)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helper function for Supabase Row Level Security
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE uid = auth.uid()::text
      AND role = 'admin'
  );
$$;

-- Enable Row Level Security on every table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Admins can view profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Books policies (public reads published & upcoming only; drafts strictly hidden)
CREATE POLICY "Public reads published or upcoming books"
  ON public.books FOR SELECT
  USING (status IN ('published', 'upcoming') OR public.is_admin());

CREATE POLICY "Admins manage books"
  ON public.books FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Journal policies
CREATE POLICY "Public reads published journal posts"
  ON public.journal_posts FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage journal posts"
  ON public.journal_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Poems policies
CREATE POLICY "Public reads published poems"
  ON public.poems FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage poems"
  ON public.poems FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notes policies
CREATE POLICY "Public reads published notes"
  ON public.notes FOR SELECT
  USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage notes"
  ON public.notes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Site settings policies
CREATE POLICY "Public reads site settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins update site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Contact messages policies (anyone can submit; ONLY admins can read/update/delete)
CREATE POLICY "Visitors can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (char_length(name) >= 2 AND char_length(message) >= 10);

CREATE POLICY "Admins read contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins manage contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.is_admin());

-- Storage bucket & policies (run in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('author-media', 'author-media', TRUE)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public reads author media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'author-media');

CREATE POLICY "Only admins upload author media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'author-media' AND public.is_admin());

CREATE POLICY "Only admins update author media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'author-media' AND public.is_admin());

CREATE POLICY "Only admins delete author media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'author-media' AND public.is_admin());

-- =========================================================================
-- FIRST AUTHORIZED ADMINISTRATOR SETUP (Run after creating your Auth user)
-- =========================================================================
-- 1. In Supabase Dashboard -> Authentication -> Users -> Add user (disable public signup in Auth Settings).
-- 2. Copy the user's UUID and email, then run:
--
-- INSERT INTO public.profiles (uid, email, full_name, role)
-- VALUES ('<AUTH_USER_UUID>', 'your-email@example.com', 'Vinit Singh Rajput', 'admin')
-- ON CONFLICT (email) DO UPDATE SET role = 'admin', uid = EXCLUDED.uid;
