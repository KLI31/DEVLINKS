import { notFound } from "next/navigation";
import { userApi } from "@/lib/api/user.api";
import { githubApi } from "@/lib/api/github.api";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import type { Project, GithubStats } from "@/types";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await userApi.getPublicProfile(slug).catch(() => null);

  console.log(profile);

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

  const profile = await userApi.getPublicProfile(slug).catch(() => null);
  if (!profile) notFound();

  const [projects, githubStats] = await Promise.all([
    userApi.getPublicProjects(slug).catch(() => [] as Project[]),
    profile.githubUsername
      ? githubApi.getStats(profile.githubUsername).catch(() => null)
      : Promise.resolve(null as GithubStats | null),
  ]);

  const pageBg =
    profile.bgType === "gradient"
      ? `linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 85%, #000 15%) 0%, color-mix(in srgb, ${profile.bgColor} 60%, ${profile.accentColor} 40%) 100%)`
      : profile.bgColor;

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
