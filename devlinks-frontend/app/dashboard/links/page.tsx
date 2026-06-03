import { Suspense } from "react";
import { linksApi, userApi } from "@/lib/api";
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
  const [links, user] = await Promise.all([
    linksApi.getAll().catch(() => [] as import("@/types").LinkItem[]),
    userApi.me().catch(() => null),
  ]);
  return <LinksClient initialLinks={links} userProfile={user} />;
}
