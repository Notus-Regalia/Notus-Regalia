import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Info Center',
  description: 'Newsroom, investor relations, legal, and corporate documents for Notus Regalia.',
};

export default function InformationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
