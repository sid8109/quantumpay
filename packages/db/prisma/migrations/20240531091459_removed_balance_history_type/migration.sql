/*
  Warnings:

  - You are about to drop the column `changeType` on the `BalanceHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BalanceHistory" DROP COLUMN "changeType";

-- DropEnum
DROP TYPE "BalanceChangeType";
