import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { buildPageGraph } from '@/components/seo/pageSchema';

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'Every page across Notus Regalia, organized by website and area.',
  alternates: { canonical: '/sitemap' },
  openGraph: {
    title: 'Sitemap | Notus Regalia',
    description: 'Every page across Notus Regalia, organized by website and area.',
    url: '/sitemap',
  },
};

const graph = buildPageGraph({
  title: 'Sitemap',
  description: 'Every page across Notus Regalia, organized by website and area.',
  canonical: '/sitemap',
  crumbs: [
    { name: 'Home', path: '/' },
    { name: 'Sitemap', path: '/sitemap' },
  ],
});

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph} />
      {children}
    </>
  );
}
