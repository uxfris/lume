/*
  Warnings:

  - You are about to drop the column `starred` on the `meeting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "meeting" DROP COLUMN "starred",
ADD COLUMN     "isStarred" BOOLEAN NOT NULL DEFAULT false;
