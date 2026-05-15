import { cache } from "react";
import { notFound } from "next/navigation";
import { userApi } from "@/lib/api/user.api";
import { githubApi } from "@/lib/api/github.api";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import type { Project, GithubStats } from "@/types";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

const isValidHex = (color: string | undefined) =>
  typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color);

const getCachedPublicProfile = cache((slug: string) =>
  userApi.getPublicProfile(slug).catch(() => null),
);

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getCachedPublicProfile(slug);

  return {
    title: profile?.displayName ?? slug,
    description: profile?.bio ?? `Perfil de ${slug} en DevLinks`,
    openGraph: {
      images: profile?.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;

  const profile = await getCachedPublicProfile(slug);
  if (!profile) notFound();

  const [projects, githubStats] = await Promise.all([
    userApi.getPublicProjects(slug).catch(() => [] as Project[]),
    profile.githubUsername
      ? githubApi.getStats(profile.githubUsername).catch(() => null)
      : Promise.resolve(null as GithubStats | null),
  ]);

  const safeBgColor = isValidHex(profile.bgColor) ? profile.bgColor : "#0f172a";
  const safeAccentColor = isValidHex(profile.accentColor)
    ? profile.accentColor
    : "#3b82f6";

  const pageBg =
    profile.bgType === "gradient"
      ? `linear-gradient(160deg, color-mix(in srgb, ${safeBgColor} 85%, #000 15%) 0%, color-mix(in srgb, ${safeBgColor} 60%, ${safeAccentColor} 40%) 100%)`
      : safeBgColor;

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-start px-4 py-16"
      style={{ background: pageBg }}
    >
      <PublicProfileCard
        profile={profile}
        projects={projects}
        githubStats={githubStats}
      />
    </main>
  );
}
