import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { buildPageGraph } from '@/components/seo/pageSchema';

export const metadata: Metadata = {
  title: 'System Status - Seraph',
  description: 'Real-time operational status of Notus Regalia websites, platforms, and services.',
  alternates: { canonical: '/status' },
  openGraph: {
    title: 'System Status - Seraph | Notus Regalia',
    description: 'Real-time operational status of Notus Regalia websites, platforms, and services.',
    url: '/status',
  },
};

const graph = buildPageGraph({
  title: 'System Status',
  description: 'Real-time operational status of Notus Regalia websites, platforms, and services.',
  canonical: '/status',
  crumbs: [
    { name: 'Home', path: '/' },
    { name: 'System Status', path: '/status' },
  ],
});

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={graph} />
      {children}
    </>
  );
}
