import express from 'express'
import { WebSocketServer } from 'ws';
import { SocketManager } from './SocketManager';
import prisma from '@repo/db/client';
import url from 'url';
import { otpMiddleware } from './middlewares/otpMiddleware';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

const app = express()
app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const httpServer = app.listen(8080)

const wss = new WebSocketServer({ server: httpServer });
const socketManager = SocketManager.getInstance();

const otpLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, 
    max: 3, 
    message: 'Too many requests, please try again after 5 minutes',
    standardHeaders: true, 
    legacyHeaders: false, 
});

app.post('/hdfcWebhook', async (req, res) => {
    const { userId, amount, newBalanceHistory, token } = req.body;
    console.log("on ramp", userId)
    console.log("on ramp", newBalanceHistory)
    socketManager.broadcastSingleUser(userId, JSON.stringify({
        type: 'ONRAMP',
        amount,
        newBalanceHistory,
        token
    }))
    res.json({ message: 'success' })
})

app.post('/pay', otpLimiter, otpMiddleware, async (req, res) => {
    const { to, amount, remarks, from } = req.body;
    try {
        const result = await p2pTransfer(to, amount, remarks, from);
        if (result?.error) {
            res.status(400).json({ message: result.error });
        } else {
            console.log("Payment successful");
            res.status(200).json({ message: "Payment successful" });
        }
    } catch (error) {
        console.error("Error in /pay endpoint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/request', otpLimiter, async (req, res) => {
    const { to, amount, remarks, from } = req.body;
    try {
        const result = await p2pRequest(to, amount, remarks, from);
        if (result?.error) {
            return res.status(400).json({ error: result.error });
        }
        return res.status(200).json({ message: "Request successful" });
    } catch (error) {
        console.error("Error in /request endpoint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

app.post('/paytherequest', otpLimiter, otpMiddleware, async (req, res) => {
    const { transferId } = req.body
    console.log("paytherequest")
    try {
        const result = await payTheRequest(transferId)
        if (result?.error) {
            console.log(result?.error)
            return res.status(400).json({ error: result.error });
        }
        return res.status(200).json({ message: "Payment successful" });
    } catch (error) {
        console.error("Error in /paytherequest endpoint:", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

wss.on('connection', function connection(ws, req) {
    const parsedUrl = url.parse(req.url || '', true);
    const userId: string = parsedUrl.query.userId as string;
    console.log('userId:', userId);
    if (userId === undefined || userId === '') {
        ws.close();
        return;
    }
    socketManager.addSocket(ws, userId);

    ws.on('message', function message(data) {
        console.log(data)
    });

    ws.on('close', function close() {
        socketManager.removeSocket(ws);
    });
});

async function p2pTransfer(to: string, amount: number, remarks: string, from: string) {
    if (!from) {
        return {
            error: "Error while sending"
        }
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            error: "User not found"
        }
    }

    if (Number(from) === toUser.id) {
        return {
            error: "You cannot pay yourself"
        }
    }

    const timestamp = new Date();

    const fromUserWithBalance = await prisma.user.findUnique({
        where: { id: Number(from) },
        include: {
            Balance: true
        }
    });

    if (!fromUserWithBalance || fromUserWithBalance.Balance[0]?.amount < amount) {
        return {
            error: "Insufficient Funds!"
        }
    }

    await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;
        await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${toUser.id} FOR UPDATE`;

        const toBalance = await tx.balance.findUnique({
            where: { userId: toUser.id },
        });

        await Promise.all([
            tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
            }),
            tx.balance.update({
                where: { userId: toUser.id },
                data: { amount: { increment: amount } },
            }),
            tx.balanceHistory.create({
                data: {
                    userId: Number(from),
                    amount: fromUserWithBalance.Balance[0].amount - amount,
                    timestamp,
                },
            }),
            tx.balanceHistory.create({
                data: {
                    userId: toUser.id,
                    amount: (toBalance ? toBalance.amount : 0) + amount,
                    timestamp,
                },
            }),
            tx.p2pTransfer.create({
                data: {
                    fromUserId: Number(from),
                    toUserId: toUser.id,
                    amount,
                    timestamp,
                    remarks,
                    status: 'Paid',
                },
            })
        ]);
    });

    socketManager.broadcast(from, toUser.id.toString(), JSON.stringify({
        type: 'PAID',
        amount,
        remarks,
        fromUserId: from,
        toUserId: toUser.id.toString(),
        fromUser: fromUserWithBalance.name, 
        toUser: toUser.name,
        timestamp,
        status: 'Paid'
    }));
}

async function p2pRequest(to: string, amount: number, remarks: string, from: string) {
    console.log('p2pRequest', to, amount, remarks, from);
    if (!from) {
        return {
            error: "Error while sending"
        };
    }

    const [toUser, fromUser] = await Promise.all([
        prisma.user.findFirst({
            where: {
                number: to
            }
        }),
        prisma.user.findUnique({
            where: {
                id: Number(from)
            }
        })
    ]);

    if (!toUser) {
        return {
            error: "User not found"
        };
    }

    if (Number(from) === toUser.id) {
        return {
            error: "You cannot pay yourself"
        };
    }

    if (!fromUser) {
        return {
            error: "Sender not found"
        };
    }

    const timestamp = new Date();

    const newTransferRequest = await prisma.p2pTransfer.create({
        data: {
            fromUserId: toUser.id,
            toUserId: Number(from),
            amount,
            timestamp,
            remarks,
            status: 'Requested'
        }
    });

    socketManager.broadcast(from, toUser.id.toString(), JSON.stringify({
        type: 'REQUESTED',
        id: newTransferRequest.id,
        amount,
        remarks,
        fromUserId: toUser.id.toString(),
        toUserId: from,
        fromUser: toUser.name,
        toUser: fromUser.name,
        timestamp,
        status: 'Requested'
    }));
}

const payTheRequest = async (transferId: number) => {
    console.log(transferId)
    const transfer = await prisma.p2pTransfer.findUnique({
        where: {
            id: transferId
        }
    });

    if (!transfer) {
        return {
            error: "Transfer not found"
        }
    }
    console.log(transfer)

    const usersWithBalance = await prisma.user.findMany({
        where: {
            OR: [
                { id: transfer.fromUserId },
                { id: transfer.toUserId }
            ]
        },
        include: {
            Balance: { select: { amount: true } }
        }
    });

    const fromUserWithBalance = usersWithBalance.find(user => user.id === transfer.fromUserId);
    const toUserWithBalance = usersWithBalance.find(user => user.id === transfer.toUserId);

    if (!fromUserWithBalance || !toUserWithBalance) {
        return {
            error: "User not found"
        }
    }

    const fromBalance = fromUserWithBalance.Balance[0]?.amount;
    const toBalance = toUserWithBalance.Balance[0]?.amount;

    if(!fromBalance || fromBalance < transfer.amount) {
        return {
            error: "Insufficient Funds"
        }
    }

    const timestamp = new Date();

    if (transfer.status === 'Requested') {
        await prisma.$transaction(async (tx) => {
            await Promise.all([
                tx.balance.update({
                    where: { userId: transfer.fromUserId },
                    data: { amount: { decrement: transfer.amount } },
                }),
                tx.balance.update({
                    where: { userId: transfer.toUserId },
                    data: { amount: { increment: transfer.amount } },
                }),
                tx.balanceHistory.create({
                    data: {
                        userId: transfer.fromUserId,
                        amount: fromBalance - transfer.amount,
                        timestamp,
                    }
                }),
                tx.balanceHistory.create({
                    data: {
                        userId: transfer.toUserId,
                        amount: toBalance + transfer.amount,
                        timestamp,
                    }
                })
            ]);

            await tx.p2pTransfer.update({
                where: { id: transfer.id },
                data: {
                    status: 'Paid',
                    timestamp: new Date()
                }
            })
        });

        const fromUserName = fromUserWithBalance.name;
        const toUserName = toUserWithBalance.name;

        socketManager.broadcast(fromUserWithBalance.id.toString(), toUserWithBalance.id.toString(), JSON.stringify({
            type: 'PAIDTHEREQUEST',
            id: transfer.id,
            amount: transfer.amount,
            remarks: transfer.remarks,
            fromUserId: fromUserWithBalance.id.toString(),
            toUserId: toUserWithBalance.id.toString(),
            fromUserName,
            toUserName,
            timestamp: transfer.timestamp,
            status: 'Paid'
        }))
    }
}