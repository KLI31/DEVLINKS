"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { CustomizeValues } from "@/hooks/useCustomize";
import { CustomizeMenu } from "@/app/dashboard/customize/_sections/CustomizeMenu";
import { ProfileSection } from "@/app/dashboard/customize/_sections/ProfileSection";
import { TextSection } from "@/app/dashboard/customize/_sections/TextSection";
import { ButtonsSection } from "@/app/dashboard/customize/_sections/ButtonsSection";
import { WallpaperSection } from "@/app/dashboard/customize/_sections/WallpaperSection";
import { GitReposPanel } from "@/components/customize/GitReposPanel";
import { useAuthStore } from "@/store/auth-store";

interface AppearancePanelProps {
  values: CustomizeValues;
  update: (patch: Partial<CustomizeValues>) => void;
  userDisplayName?: string;
  userAvatarUrl?: string | null;
}

export function AppearancePanel({
  values,
  update,
  userDisplayName,
  userAvatarUrl,
}: AppearancePanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const section = searchParams.get("section");

  const setSection = (s: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (s) {
      params.set("section", s);
    } else {
      params.delete("section");
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (!section) {
    return (
      <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
        <CustomizeMenu onSelect={(id) => setSection(id)} />
      </div>
    );
  }

  const backToMenu = () => setSection(null);

  switch (section) {
    case "profile":
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <ProfileSection
            values={values}
            update={update}
            onBack={backToMenu}
            userAvatarUrl={userAvatarUrl}
            userDisplayName={userDisplayName}
          />
        </div>
      );
    case "text":
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <TextSection values={values} update={update} onBack={backToMenu} />
        </div>
      );
    case "buttons":
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <ButtonsSection values={values} update={update} onBack={backToMenu} />
        </div>
      );
    case "wallpaper":
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <WallpaperSection
            values={values}
            update={update}
            onBack={backToMenu}
          />
        </div>
      );
    case "repos":
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <div className="mb-3 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={backToMenu}
              className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              Repos de GitHub
            </span>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto pr-1">
            <GitReposPanel githubUsername={user?.githubUsername} />
          </div>
        </div>
      );
    case "stickers":
      return null;
    default:
      return (
        <div className="flex h-full min-h-0 w-[272px] shrink-0 flex-col overflow-hidden">
          <CustomizeMenu onSelect={(id) => setSection(id)} />
        </div>
      );
  }
}
