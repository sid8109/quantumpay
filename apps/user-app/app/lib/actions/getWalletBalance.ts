"use server"

import { getServerSession } from "next-auth";
import prisma from "@repo/db/client";
import { authOptions } from "../auth";

export async function getWalletBalance() {
    const now = new Date().getTime();
    let selectedTimeInMilliseconds: number = now - 6 * 30 * 24 * 60 * 60 * 1000;

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
        return null
    }
    const balanceHistory = await prisma.balanceHistory.findMany({
        where: {
            userId: Number(userId),
            timestamp: {
                gte: new Date(new Date().getTime() - selectedTimeInMilliseconds)
            }
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    console.log(balanceHistory)
    return balanceHistory;
}