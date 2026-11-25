# Vinit Singh Rajput — Official Author Website

A warm, illustrated literary website and private publishing desk for **Vinit Singh Rajput** (Author & Writer, India). Built with React, TypeScript, Vite, Tailwind CSS, React Router, Motion, Express, Drizzle ORM, PostgreSQL (Cloud SQL), and Firebase Authentication.

---

## Features

- **Illustrated Literary Storefront**: Original watercolor hero landscape, Featured Book showcase, filterable Bookshelf, Journal essays, multilingual Poetry archive (**English, Hindi, Hinglish**), editable About the Author page, Writing Desk Notes, Contact form, website-wide Search, and custom 404 page.
- **Private Admin Dashboard (`/admin`)**: Hidden from public navigation with zero public registration. Protected by server-side token verification and role checks (`profiles.role = 'admin'`).
  - **Books Manager**: Add/edit/delete books, upload cover art, reorder books, mark featured, set Draft / Upcoming / Published status, add Google Play Books, Amazon, Wattpad, and custom links, preview before publishing.
  - **Journal Manager**: Formatted writing editor (headings, bold, italic, blockquotes, lists, links), categories & tags, cover uploads, draft/publish/schedule states, live preview.
  - **Poetry Manager**: English, Hindi (Devanagari), and Hinglish poems with preserved stanza line breaks.
  - **Notes & Messages**: Desk updates plus private contact inbox with read/unread tracking.
  - **Site Settings**: Edit hero heading/description/image, author photo, biography, writing philosophy, social links, contact email, and footer copy without touching code.
- **SEO Ready**: Dynamic page titles, meta descriptions, canonical URLs, Open Graph & Twitter cards, Schema.org `Person`, `Book`, `Article`, and `CreativeWork` JSON-LD, `/robots.txt`, and dynamic `/sitemap.xml`.

---

## Environment Variables

Copy `.env.example` to `.env` (never commit real secrets):

```env
APP_URL="https://your-domain.pages.dev"
ADMIN_EMAILS="your-admin-email@example.com"
```

When running in AI Studio with Cloud SQL, `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD`, `SQL_ADMIN_USER`, and `SQL_ADMIN_PASSWORD` are provided automatically by the runtime.

---

## How to Add & Edit Books Without Coding

1. Open `/admin` in your browser and sign in with your authorized administrator Google account.
2. Select **Books** in the left sidebar.
3. Click **Add New Book** (or click **Edit** on any sample placeholder entry to replace it).
4. Upload a cover image (JPEG, PNG, or WebP, up to 5 MB), enter title, synopsis, category, language, and any official reading/purchase links.
5. Click **Preview Book** to inspect the public presentation.
6. Set **Publication Status** to **Draft** (hidden), **Upcoming** (appears in Books & Upcoming Releases), or **Published**, then click **Save Changes**. Your public site updates immediately.

To update your biography, author photograph, hero text, or social links, open **Site Settings** in `/admin` and click **Save Settings**.

---

## Standalone Supabase Setup (Optional Reference)

If you choose to mirror this database on Supabase PostgreSQL:

1. Create a new project in [Supabase](https://supabase.com).
2. Open **SQL Editor** and run `/supabase/schema.sql`. This creates all tables (`profiles`, `books`, `journal_posts`, `poems`, `notes`, `site_settings`, `contact_messages`), Row Level Security policies, and the `author-media` storage bucket.
3. In **Authentication → Providers → Email**, disable **Enable Sign Ups** so public visitors cannot register accounts.
4. Create your first admin user in **Authentication → Users → Add User**, copy their UUID, and run:

```sql
INSERT INTO public.profiles (uid, email, full_name, role)
VALUES ('PASTE_USER_UUID_HERE', 'your-admin-email@example.com', 'Vinit Singh Rajput', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin', uid = EXCLUDED.uid;
```

5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (never `service_role`) in your hosting environment.

---

## Uploading to GitHub & Deploying on Cloudflare Pages

1. Initialize and push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Vinit Singh Rajput author website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**:
   - Select your GitHub repository and `main` branch.
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - Add your required environment variables under **Settings → Environment variables**.
3. `/public/_redirects` is already included (`/* /index.html 200`) so all SPA routes (`/books/:slug`, `/journal/:slug`, `/poetry/:slug`, `/admin`) resolve cleanly on refresh.
4. Every push to `main` automatically deploys to your free `*.pages.dev` subdomain. Note that free tiers have monthly request, bandwidth, and database storage limits—monitor usage in your dashboard as traffic grows.

---

## Backing Up Your Database & Book Images

- **PostgreSQL / Cloud SQL**: Run `pg_dump` regularly or enable automated daily backups in your Google Cloud SQL / Supabase dashboard.
- **Uploaded Images**: Uploaded book covers and author photos are stored in the `media_assets` table (or the `author-media` storage bucket on Supabase), so database dumps or storage exports preserve your artwork alongside your catalog. Always keep original high-resolution cover files in a local folder or cloud drive as an additional copy.
