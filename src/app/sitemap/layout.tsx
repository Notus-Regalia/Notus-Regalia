import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitemap - Notus Regalia',
  description: 'Every page across Notus Regalia, organized by website and area.',
};

export default function SitemapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
