import { createHash } from 'node:crypto';

// WordPress address comes from the build variable WP_URL (no trailing slash needed).
const WP_URL = (process.env.WP_URL ?? import.meta.env.WP_URL ?? '').replace(/\/+$/, '');

/**
 * Reads one page from WordPress at build time.
 * Returns the list of sections (Flexible Content rows) and a hash of that list.
 */
export async function getPage(slug) {
  if (!WP_URL) {
    throw new Error('WP_URL is not set: add the WordPress address to the build variables.');
  }

  const url = `${WP_URL}/wp-json/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,modified_gmt,acf`;
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`WordPress answered ${response.status} for ${url}`);
  }

  const pages = await response.json();
  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error(`Page "${slug}" was not found in WordPress.`);
  }

  const page = pages[0];
  // An empty Flexible Content field comes back as false, not as an empty list.
  const sections = Array.isArray(page.acf?.sections) ? page.acf.sections : [];

  return {
    id: page.id,
    slug: page.slug,
    title: page.title?.rendered ?? '',
    modified: page.modified_gmt ?? '',
    sections,
    hash: createHash('sha256').update(JSON.stringify(sections)).digest('hex').slice(0, 12),
  };
}
