import { useEffect } from 'react';

interface DocumentMetaOptions {
  title: string;
  description: string;
  type?: 'website' | 'article' | 'book';
  image?: string;
  jsonLd?: Record<string, unknown> | null;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
}

export function useDocumentMeta({
  title,
  description,
  type = 'website',
  image,
  jsonLd,
}: DocumentMetaOptions) {
  useEffect(() => {
    document.title = title;
    const canonicalUrl = `${window.location.origin}${window.location.pathname}`;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });

    if (image) {
      const fullImage = image.startsWith('http')
        ? image
        : `${window.location.origin}${image}`;
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: fullImage });
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: fullImage });
    }

    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;

    const existingLd = document.head.querySelector('script[data-dynamic-ld="true"]');
    if (existingLd) existingLd.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-ld', 'true');
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const dynamicLd = document.head.querySelector('script[data-dynamic-ld="true"]');
      if (dynamicLd) dynamicLd.remove();
    };
  }, [title, description, type, image, jsonLd]);
}
