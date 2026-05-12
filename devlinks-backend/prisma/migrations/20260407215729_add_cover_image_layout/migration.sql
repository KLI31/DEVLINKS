-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cover_image_url" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "profile_layout" TEXT NOT NULL DEFAULT 'classic';
