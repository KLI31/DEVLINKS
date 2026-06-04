import { cache } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { userApi } from "@/lib/api/user.api";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { getProfileUrl } from "@/lib/utils";
import type { Project } from "@/types";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

const isValidHex = (color: string | undefined) =>
  typeof color === "string" && /^#[0-9A-Fa-f]{6}$/.test(color);

const getCachedPublicProfile = cache((slug: string, clientIp: string) =>
  userApi.getPublicProfile(slug, clientIp || undefined).catch(() => null),
);

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    ""
  );
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const clientIp = await getClientIp();
  const profile = await getCachedPublicProfile(slug, clientIp);

  const title = profile?.displayName
    ? `${profile.displayName} (@${profile.username})`
    : slug;
  const description = profile?.bio ?? `Perfil de ${slug} en DevLinks`;
  const url = getProfileUrl(slug);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: profile?.avatarUrl
        ? [
            {
              url: profile.avatarUrl,
              width: 400,
              height: 400,
              alt: `Avatar de ${profile.displayName ?? slug}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: profile?.avatarUrl ? [profile.avatarUrl] : [],
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const clientIp = await getClientIp();

  const profile = await getCachedPublicProfile(slug, clientIp);
  if (!profile) notFound();

  const projects = await userApi.getPublicProjects(slug).catch(() => [] as Project[]);

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
      className="flex min-h-screen flex-col items-center justify-start overflow-x-hidden px-4 py-16 scrollbar-hide"
      style={{ background: pageBg }}
    >
      <PublicProfileCard
        profile={profile}
        projects={projects}
      />
    </main>
  );
}
