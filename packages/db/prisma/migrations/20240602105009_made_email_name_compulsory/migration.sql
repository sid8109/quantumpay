/*
  Warnings:

  - You are about to drop the `webSocketConnection` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email,number]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "webSocketConnection" DROP CONSTRAINT "webSocketConnection_userId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "webSocketConnection";

-- CreateIndex
CREATE UNIQUE INDEX "User_email_number_key" ON "User"("email", "number");
