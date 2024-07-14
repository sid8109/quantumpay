"use server"

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth"
import { authOptions } from "../auth"

export async function createOnrampTransaction(provider: string, amount: number) {
    if(amount <= 0) return {
        error: "Negative Values not allowed"
    }

    const session = await getServerSession(authOptions)
    if(!session?.user || !session?.user?.id) {
        return {
            error: "Unauthenticated request"
        }
    }

    const token = Math.random().toString()

    await prisma.$transaction(async (tx) => {
        await prisma.onRampTransaction.create({
            data: {
                provider,
                status: "Processing",
                amount: amount * 100,
                userId: Number(session.user.id),
                startTime: new Date(), 
                token   
            }
        })
        
        await prisma.balance.update({
            where: {
                userId: Number(session.user.id)
            },
            data: {
                locked: {
                    increment: amount * 100
                }
            }
        })
    })

    return {
        message: "Transfer Initiated"
    }
}

export async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

export async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    txns.reverse()
    return txns.map(t => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider,
        token: t.token
    }))
}