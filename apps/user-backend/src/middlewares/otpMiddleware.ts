import { Request, Response, NextFunction } from 'express';
import prisma from '@repo/db/client';

export const otpMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { from, otp } = req.body;

    if (!from || !otp) {
        res.status(400).send('From and OTP are required');
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: Number(from) },
        select: {
            otp: true,
            otpExpiresAt: true
        }
    });

    if (!user) {
        res.status(400).send('User not found');
        return;
    }

    if (user.otp !== otp) {
        res.status(400).send('Invalid OTP');
        return;
    }

    if (user.otpExpiresAt !== null && user.otpExpiresAt < new Date()) {
        res.status(400).send('OTP has expired');
        return;
    }

    console.log("middleware")

    await prisma.user.update({
        where: { id: Number(from) },
        data: {
            otp: null,
            otpExpiresAt: null
        }
    });

    next();
};