/*
  Warnings:

  - Changed the type of `status` on the `p2pTransfer` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "OnP2PStatus" AS ENUM ('Paid', 'Requested');

-- AlterTable
ALTER TABLE "p2pTransfer" DROP COLUMN "status",
ADD COLUMN     "status" "OnP2PStatus" NOT NULL;
