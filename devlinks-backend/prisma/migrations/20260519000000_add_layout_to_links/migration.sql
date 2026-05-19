-- AlterTable
ALTER TABLE "links" ADD COLUMN IF NOT EXISTS "layout" TEXT NOT NULL DEFAULT 'classic';
