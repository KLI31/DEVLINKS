import { Suspense } from "react";
import { linksApi } from "@/lib/api";
import { LinksClient } from "@/components/links/LinksClient";
import { LinksSkeleton } from "@/components/links/LinksSkeleton";

export default function DashboardLinksPage() {
  return (
    <Suspense fallback={<LinksSkeleton />}>
      <LinksPageContent />
    </Suspense>
  );
}

async function LinksPageContent() {
  const links = await linksApi.getAll();
  return <LinksClient initialLinks={links} />;
}
