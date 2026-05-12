-- AlterTable
ALTER TABLE "users" ADD COLUMN     "accent_color" TEXT NOT NULL DEFAULT '#0d9488',
ADD COLUMN     "bg_color" TEXT NOT NULL DEFAULT '#0f172a',
ADD COLUMN     "bg_type" TEXT NOT NULL DEFAULT 'flat',
ADD COLUMN     "button_style" TEXT NOT NULL DEFAULT 'rounded-fill',
ADD COLUMN     "font_family" TEXT NOT NULL DEFAULT 'inter';
