import JsonLd from '@/components/seo/JsonLd';
import { buildPageGraph } from '@/components/seo/pageSchema';

export const metadata = {
  title: 'Contact',
  description: 'Get in touch with Notus Regalia. All enquiries: info@notusregalia.tech.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact | Notus Regalia',
    description: 'Get in touch with Notus Regalia. All enquiries: info@notusregalia.tech.',
    url: '/contact',
  },
  robots: { index: true, follow: true },
};

const graph = buildPageGraph({
  title: 'Contact',
  description: 'Get in touch with Notus Regalia. All enquiries: info@notusregalia.tech.',
  canonical: '/contact',
  crumbs: [
    { name: 'Home', path: '/' },
    { name: 'Contact', path: '/contact' },
  ],
});

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <JsonLd data={graph} />
      <div style={{ padding: 24, textAlign: 'center' }}>
        <h1>Contact</h1>
        <p>This is a placeholder contact page. Content will be added later.</p>
      </div>
    </main>
  );
}
