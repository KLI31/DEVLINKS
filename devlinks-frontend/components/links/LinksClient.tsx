"use client";

import { useEffect, useMemo, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import { ExternalLink, Eye, Plus } from "lucide-react";
import type { UserProfile, PublicProfile, LinkItem } from "@/types";
import { useLinksStore } from "@/store/links-store";
import { userApi } from "@/lib/api/user.api";
import { getScheduleState } from "@/lib/links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LinkList } from "./LinkList";
import { LinkFormModal } from "./LinkFormModal";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";

const MAX_LINKS = 20;

interface LinksClientProps {
  initialLinks: LinkItem[];
  userProfile: UserProfile | null;
}

export function LinksClient({ initialLinks, userProfile: initialUserProfile }: LinksClientProps) {
  const { links, setLinks } = useLinksStore();
  const [formOpen, setFormOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUserProfile);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks, setLinks]);

  // El fetch SSR puede fallar (sin access token en el servidor); se reintenta en cliente.
  useEffect(() => {
    if (!userProfile) {
      userApi.me().then(setUserProfile).catch(() => {});
    }
  }, [userProfile]);

  const isLimitReached = links.length >= MAX_LINKS;

  const activeSortedLinks = useMemo(
    () =>
      [...links]
        .filter((l) => l.isActive && ["none", "live"].includes(getScheduleState(l)))
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [links],
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
      layout: userProfile.layout ?? "classic",
      title: userProfile.title ?? null,
      titleStyle: userProfile.titleStyle ?? "text",
      titleColor: userProfile.titleColor ?? "#F8FAFC",
      pageTextColor: userProfile.pageTextColor ?? "#F8FAFC",
      buttonVariant: userProfile.buttonVariant ?? "solid",
      buttonRadius: userProfile.buttonRadius ?? 8,
      buttonShadow: userProfile.buttonShadow ?? "none",
      buttonColor: userProfile.buttonColor ?? userProfile.accentColor,
      buttonTextColor: userProfile.buttonTextColor ?? "#FFFFFF",
      altTitleFont: userProfile.altTitleFont ?? false,
      stickers: null,
      links: activeSortedLinks,
      titleFont: userProfile.titleFont ?? "inter",
      projects: [],
    };
  }, [userProfile, activeSortedLinks]);

  const preview = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Vista previa</p>
        {userProfile && (
          <a
            href={`/u/${userProfile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Abrir perfil
            <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      <div className="h-[min(680px,calc(100dvh-12rem))] rounded-[2.25rem] border border-border bg-muted/40 p-1.5">
        <div className="scroll-thin h-full overflow-y-auto overscroll-contain rounded-[1.875rem] bg-background">
          {previewProfile ? (
            <PublicProfileCard
              profile={previewProfile}
              projects={previewProfile.projects}
              githubStats={null}
              hideShare
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center">
              <p className="text-sm text-muted-foreground">
                Completa tu perfil para ver la vista previa
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex flex-1 items-start gap-8"
      >
        <section className="flex min-w-0 flex-1 flex-col gap-5">
          <header className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold leading-none">Links</h1>
            <p className="text-xs text-muted-foreground tabular-nums">
              {links.length} de {MAX_LINKS} · arrastra para reordenar
            </p>
          </header>

          <Button
            onClick={() => setFormOpen(true)}
            disabled={isLimitReached}
            title={isLimitReached ? "Límite alcanzado" : undefined}
            className="h-12 w-full cursor-pointer gap-2 text-sm font-semibold"
          >
            <Plus className="size-4" />
            Agregar link
          </Button>

          <LinkList onAdd={() => setFormOpen(true)} />
        </section>

        <aside className="sticky top-0 hidden w-[340px] shrink-0 flex-col gap-3 lg:flex">
          {preview}
        </aside>

        <Button
          onClick={() => setPreviewOpen(true)}
          className="fixed bottom-5 right-5 z-40 h-12 cursor-pointer gap-2 rounded-full px-5 shadow-lg lg:hidden"
        >
          <Eye className="size-4" />
          Vista previa
        </Button>

        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetContent className="gap-3 overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle className="font-mono">Vista previa</SheetTitle>
            </SheetHeader>
            {preview}
          </SheetContent>
        </Sheet>

        <LinkFormModal
          open={formOpen}
          onOpenChange={setFormOpen}
          editingLink={null}
        />
      </motion.div>
    </MotionConfig>
  );
}
