"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";
import type { UserProfile, PublicProfile, LinkItem } from "@/types";
import { useLinksStore } from "@/store/links-store";
import { Button } from "@/components/ui/button";
import { LinkList } from "./LinkList";
import { LinkFormModal } from "./LinkFormModal";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { iconUrl } from "@/lib/icons";

interface LinksClientProps {
  initialLinks: LinkItem[];
  userProfile: UserProfile | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function LinksClient({ initialLinks, userProfile }: LinksClientProps) {
  const { links, setLinks } = useLinksStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks, setLinks]);

  const handleAdd = () => {
    setSheetOpen(true);
  };

  const isLimitReached = links.length >= 20;

  const activeSortedLinks = useMemo(
    () =>
      [...links]
        .filter((l) => l.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [links],
  );

  const primaryLinks = useMemo(
    () => activeSortedLinks.filter((l) => l.isPrimary),
    [activeSortedLinks],
  );

  const previewProfile: PublicProfile | null = useMemo(() => {
    if (!userProfile) return null;
    return {
      id: userProfile.id,
      username: userProfile.username,
      displayName: userProfile.displayName,
      bio: userProfile.bio,
      location: userProfile.location,
      avatarUrl: userProfile.avatarUrl,
      githubUsername: userProfile.githubUsername,
      theme: userProfile.theme,
      accentColor: userProfile.accentColor,
      buttonStyle: userProfile.buttonStyle,
      fontFamily: userProfile.fontFamily,
      bgType: userProfile.bgType,
      bgColor: userProfile.bgColor,
      profileLayout: userProfile.profileLayout,
      coverImageUrl: userProfile.coverImageUrl,
      stickers: null,
      links: activeSortedLinks,
      projects: [],
    };
  }, [userProfile, activeSortedLinks]);

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-1 gap-6"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center overflow-hidden rounded-full bg-muted ring-2 ring-border">
            {userProfile?.avatarUrl ? (
              <Image
                src={userProfile.avatarUrl}
                alt={userProfile.displayName}
                width={56}
                height={56}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-sm font-medium text-muted-foreground">
                {getInitials(userProfile?.displayName ?? "?")}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-base font-semibold">
              {userProfile?.displayName ?? "Tu nombre"}
            </p>
            <p className="text-sm text-muted-foreground">
              {userProfile?.bio ?? "Tu biografía"}
            </p>
            {primaryLinks.length > 0 && (
              <div className="mt-1 flex items-center gap-2">
                {primaryLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.title}
                    className="flex size-7 items-center justify-center rounded-full bg-muted transition-opacity hover:opacity-70"
                  >
                    {link.icon ? (
                      <Image
                        src={iconUrl(link.icon)}
                        alt={link.title}
                        width={14}
                        height={14}
                        className="size-3.5 object-contain"
                        unoptimized
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {link.title.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLimitReached ? (
          <Button
            disabled
            className="h-12 gap-2 rounded-full text-base"
            title="Límite alcanzado"
          >
            <Plus className="size-5" />
            Agregar link
          </Button>
        ) : (
          <Button
            onClick={handleAdd}
            className="h-12 gap-2 rounded-full text-base"
          >
            <Plus className="size-5" />
            Agregar link
          </Button>
        )}

        <LinkList />

        <LinkFormModal
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          editingLink={null}
        />
      </div>

      <div className="hidden w-[380px] shrink-0 flex-col gap-4 lg:flex">
        <div className="sticky top-0 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vista previa
          </p>
          <div className="max-h-[calc(100vh-8rem)] overflow-y-auto scroll-thin rounded-3xl p-4">
            {previewProfile ? (
              <PublicProfileCard
                profile={previewProfile}
                projects={previewProfile.projects}
                githubStats={null}
                hideShare
              />
            ) : (
              <div className="flex h-[400px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Carga tu perfil para ver la preview
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
