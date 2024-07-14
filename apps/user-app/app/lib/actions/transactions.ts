"use server"

import prisma from "@repo/db/client";
const pageSize = 11;

export async function getTransactions(userId: string | undefined, page: number) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    console.log(userId, page);
    if (!userId) {
        return {
            error: 'UserId is required' 
        }
    }

    const skip = (Number(page) - 1) * Number(pageSize - 1);
    const take = Number(pageSize);
    
    const balance = await prisma.balanceHistory.findFirst({
        where: {
            userId: Number(userId)
        },
        orderBy: {
            timestamp: 'desc'
        },
        skip: skip,
    });
    
    const transactions = await prisma.$queryRaw`
        SELECT 
            'OnRampTransaction' as source, 
            id, 
            amount, 
            "startTime" as timestamp, 
            status::TEXT as status, 
            provider,
            NULL as "fromUserId",
            NULL as "toUserId",
            NULL as "otherUserName"
        FROM 
            "OnRampTransaction"
        WHERE 
            "userId" = ${Number(userId)} AND status = 'Success'
        UNION ALL
        SELECT 
            'p2pTransfer' as source, 
            p.id, 
            p.amount, 
            p.timestamp, 
            p.status::TEXT as status, 
            NULL as provider, 
            p."fromUserId", 
            p."toUserId",
            CASE 
                WHEN p."fromUserId" = ${Number(userId)} THEN u_to.name 
                ELSE u_from.name 
            END as "otherUserName"
        FROM 
            "p2pTransfer" p
        JOIN 
            "User" u_from ON p."fromUserId" = u_from.id
        JOIN 
            "User" u_to ON p."toUserId" = u_to.id
        WHERE 
            (p."fromUserId" = ${Number(userId)} OR p."toUserId" = ${Number(userId)}) 
            AND p.status = 'Paid'
        ORDER BY 
            timestamp DESC
        LIMIT ${take} OFFSET ${skip};
    `;

    console.log(transactions);

    return {
        transactions,
        balance: balance?.amount || 0
    }
}

export async function getTransactionsForPDF(userId: string | undefined, month: any, year: any) {
    if (!userId || !month || !year) {
        return { 
            error: 'UserId, month, and year are required' 
        }
    }

    try {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 1);

        const openingBalanceRecord = await prisma.balanceHistory.findFirst({
            where: {
                userId: Number(userId),
                timestamp: {
                    lt: startDate
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        });

        const openingBalance = openingBalanceRecord ? openingBalanceRecord.amount : 0;

        const transactions: any = await prisma.$queryRaw`
            SELECT 
                'OnRampTransaction' as source, 
                id, 
                amount, 
                "startTime" as timestamp, 
                status::TEXT as status, 
                provider,
                NULL as "fromUserId",
                NULL as "toUserId",
                NULL as "otherUserName"
            FROM 
                "OnRampTransaction"
            WHERE 
                "userId" = ${Number(userId)} AND
                "startTime" >= ${startDate} AND
                "startTime" < ${endDate} AND
                status = 'Success'
            UNION ALL
            SELECT 
                'p2pTransfer' as source, 
                p.id, 
                p.amount, 
                p.timestamp, 
                p.status::TEXT as status, 
                NULL as provider, 
                p."fromUserId", 
                p."toUserId",
                CASE 
                    WHEN p."fromUserId" = ${Number(userId)} THEN u_to.name 
                    ELSE u_from.name 
                END as "otherUserName"
            FROM 
                "p2pTransfer" p
            JOIN 
                "User" u_from ON p."fromUserId" = u_from.id
            JOIN 
                "User" u_to ON p."toUserId" = u_to.id
            WHERE 
                (p."fromUserId" = ${Number(userId)} OR p."toUserId" = ${Number(userId)}) AND
                p.timestamp >= ${startDate} AND
                p.timestamp < ${endDate} AND
                p.status = 'Paid'
            ORDER BY 
                timestamp ASC;
        `;
        console.log("pdf", transactions);

        return { 
            openingBalance, transactions 
        }
    } catch (error) {
        return { 
            error: 'Something went wrong' 
        }
    }
}