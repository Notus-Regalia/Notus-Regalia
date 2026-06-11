import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Status - Seraph',
  description: 'Real-time operational status of Notus Regalia websites, platforms, and services.',
};

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
