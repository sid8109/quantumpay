import express from "express";
import db from "@repo/db/client";
import axios from "axios";

const app = express();

app.use(express.json())

app.post("/hdfcWebhook", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    console.log(paymentInformation)
    let newBalanceHistory
    try {
        await db.$transaction(async (tx) => {
            await tx.balance.update({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                data: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    },
                    locked: {
                        decrement: Number(paymentInformation.amount)
                    }
                }
            })
            const balance = await tx.balance.findFirst({
                where: {
                    userId: Number(paymentInformation.userId)
                }
            })

            if (balance !== null) {
                newBalanceHistory = await tx.balanceHistory.create({
                    data: {
                        userId: Number(paymentInformation.userId),
                        amount: balance.amount,
                        timestamp: new Date()
                    }
                })
            }

            await tx.onRampTransaction.update({
                where: {
                    token: paymentInformation.token
                },
                data: {
                    status: "Success",
                }
            })
        });

        console.log(newBalanceHistory)

        const response = await axios.post("http://localhost:8080/hdfcWebhook", {
            userId: paymentInformation.userId,
            amount: paymentInformation.amount,
            newBalanceHistory,
            token: paymentInformation.token
        })

        res.json({
            response: response.data,
            message: "Captured"
        })
    } catch (e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})

app.listen(3003);