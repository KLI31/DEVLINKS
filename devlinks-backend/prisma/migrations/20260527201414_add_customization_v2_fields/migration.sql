-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "alt_title_font" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "button_color" TEXT NOT NULL DEFAULT '#0D9488',
ADD COLUMN     "button_radius" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "button_shadow" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "button_text_color" TEXT NOT NULL DEFAULT '#FFFFFF',
ADD COLUMN     "button_variant" TEXT NOT NULL DEFAULT 'solid',
ADD COLUMN     "layout" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN     "page_text_color" TEXT NOT NULL DEFAULT '#F8FAFC',
ADD COLUMN     "title" TEXT,
ADD COLUMN     "title_color" TEXT NOT NULL DEFAULT '#F8FAFC',
ADD COLUMN     "title_style" TEXT NOT NULL DEFAULT 'text';
