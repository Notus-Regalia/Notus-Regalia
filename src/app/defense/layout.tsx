import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { buildPageGraph } from '@/components/seo/pageSchema';

export const metadata: Metadata = {
  title: 'NR Defense Systems',
  description: 'Notus Regalia — Defense Systems Division',
  alternates: { canonical: '/defense' },
  openGraph: {
    title: 'NR Defense Systems | Notus Regalia',
    description: 'Notus Regalia — Defense Systems Division',
    url: '/defense',
    // Defining openGraph overrides the opengraph-image.tsx file convention,
    // which would otherwise drop og:image. Re-attach it so social platforms
    // (Messenger, Instagram, Telegram, WhatsApp, Facebook, LinkedIn, etc.)
    // render the share card.
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Notus Regalia — At the Core of Critical Operations.' }],
  },
};

const graph = buildPageGraph({
  title: 'NR Defense Systems',
  description: 'Notus Regalia — Defense Systems Division',
  canonical: '/defense',
  crumbs: [
    { name: 'Home', path: '/' },
    { name: 'Defense Systems', path: '/defense' },
  ],
});

export default function DefenseLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph} />
      {children}
    </>
  );
}
