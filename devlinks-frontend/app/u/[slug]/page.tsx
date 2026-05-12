import { notFound } from "next/navigation";
import { userApi } from "@/lib/api/user.api";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import type { Project } from "@/types";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await userApi.getPublicProfile(slug).catch(() => null);

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

  const [profile, projects] = await Promise.all([
    userApi.getPublicProfile(slug).catch(() => null),
    userApi.getPublicProjects(slug).catch(() => [] as Project[]),
  ]);

  if (!profile) {
    notFound();
  }

  const pageBg = profile.bgType === "gradient"
    ? `linear-gradient(160deg, color-mix(in srgb, ${profile.bgColor} 85%, #000 15%) 0%, color-mix(in srgb, ${profile.bgColor} 60%, ${profile.accentColor} 40%) 100%)`
    : profile.bgColor;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{ background: pageBg }}
    >
      <PublicProfileCard profile={profile} projects={projects} />
    </main>
  );
}