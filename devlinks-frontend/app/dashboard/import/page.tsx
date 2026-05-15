import { userApi } from "@/lib/api/user.api";
import { ImportPageClient } from "./ImportPageClient";
import type { ProfileExportJson, UserProfile } from "@/types";

export default async function ImportPage() {
  let currentConfig: ProfileExportJson | null = null;
  let user: UserProfile | null = null;

  try {
    [currentConfig, user] = await Promise.all([
      userApi.exportProfile(),
      userApi.me(),
    ]);
  } catch {
    try {
      user = await userApi.me();
    } catch {}
  }

  return <ImportPageClient currentConfig={currentConfig} user={user} />;
}
