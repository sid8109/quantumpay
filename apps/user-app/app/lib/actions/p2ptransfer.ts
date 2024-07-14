"use server"

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function getP2PTransaction() {
    const session = await getServerSession(authOptions);

    const txns = await prisma.p2pTransfer.findMany({
        where: {
            OR: [
                { fromUser: { id: Number(session?.user?.id) } },
                { toUser: { id: Number(session?.user?.id) } }
            ]
        },
        include: {
            fromUser: { select: { name: true, id: true } },
            toUser: { select: { name: true, id: true } }
        },
        orderBy: {
            timestamp: 'desc'
        }
    });
    
    const p2ptransfers = txns.map(t => ({
        id: t.id,
        time: t.timestamp,
        amount: t.amount,
        fromUser: t.fromUser.name,
        toUser: t.toUser.name,
        fromUserId: t.fromUser.id,
        toUserId: t.toUser.id,
        status: t.status,
        remarks: t.remarks
    }))

    const requestedp2ptransfers = p2ptransfers.filter(t => t.status === 'Requested' && t.fromUserId === Number(session?.user?.id))

    return {p2ptransfers, requestedp2ptransfers}
}