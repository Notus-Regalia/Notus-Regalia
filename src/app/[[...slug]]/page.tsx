import { notFound } from "next/navigation";
import ClientWrapper from "@/components/ui/ClientWrapper";
import { isRootTab } from "@/utils/routes";

// Optional catch-all so clean paths like /company/sectors and /technologies/defense
// all resolve server-side to the single-page app. "/" matches with no slug.
// Literal sibling routes (/contact, /information, /sitemap, ...) take precedence.
export default async function RootCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const tab = slug?.[0];
  // Home ("/") has no slug; otherwise the first segment must be a known tab.
  if (tab && (!isRootTab(tab) || tab === "home")) {
    notFound();
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--surface-primary)', color: 'var(--content-primary)' }}>
      <ClientWrapper />
    </main>
  );
}
