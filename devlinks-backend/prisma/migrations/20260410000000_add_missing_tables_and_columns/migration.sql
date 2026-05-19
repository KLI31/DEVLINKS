-- AlterTable users: add location and stickers
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stickers" JSONB;

-- AlterTable links: add preview_image and is_primary
ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "preview_image" TEXT;
ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "is_primary" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable projects (without language — added by next migration)
CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "github_repo" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "projects_user_id_idx" ON "projects"("user_id");
CREATE INDEX IF NOT EXISTS "projects_user_id_pinned_stars_idx" ON "projects"("user_id", "pinned", "stars");

DO $$ BEGIN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable profile_views
CREATE TABLE IF NOT EXISTS "profile_views" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "visitor_ip" TEXT,
    "user_agent" TEXT,
    "referrer" TEXT,
    "country_code" TEXT,
    "viewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profile_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "profile_views_user_id_idx" ON "profile_views"("user_id");
CREATE INDEX IF NOT EXISTS "profile_views_viewed_at_idx" ON "profile_views"("viewed_at");

DO $$ BEGIN
    ALTER TABLE "profile_views" ADD CONSTRAINT "profile_views_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
