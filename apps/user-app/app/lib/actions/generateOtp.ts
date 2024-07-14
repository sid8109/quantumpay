"use server"

import crypto from 'crypto'
import { sendEmail } from '../email';
import prisma from '@repo/db/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';

export async function generateOtp() {
    const session = await getServerSession(authOptions)
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
        await prisma.user.update({
            where: { id: Number(session?.user?.id) },
            data: {
                otp,
                otpExpiresAt: expiresAt
            }
        });
        await sendOtp(session?.user.email, otp)
    } catch {
        return {
            error: "Failed to send OTP!"
        }
    }

    return {
        message: "OTP sent on email!"
    };
}

async function sendOtp(email: string, otp: string) {
    const subject = "Your OTP Code";
    const text = `Dear User,\n\nYour OTP code is: ${otp}\n\nPlease use this OTP to proceed with your transaction. This OTP is valid for 10 minutes.\n\nIf you did not request this OTP, please ignore this email or contact our support team immediately.\n\nBest regards,\nQuantumPay`;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    background-color: #f9f9f9;
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #00baf2;
                }
                .content {
                    text-align: left;
                }
                .footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>QuantumPay</h1>
                    <p>Empowering Your Financial Future</p>
                </div>
                <div class="content">
                    <p>Dear User,</p>
                    <p>Your OTP code is: <strong>${otp}</strong></p>
                    <p>Please use this OTP to proceed with your transaction. This OTP is valid for 10 minutes.</p>
                    <p>If you did not request this OTP, please ignore this email or contact our support team immediately.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 QuantumPay. All rights reserved.</p>
                    <p>Empowering Your Financial Future</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await sendEmail({
        to: email,
        subject,
        text,
        html,
    });
}

export async function verifyOtp(userId: number, otp: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            otp: true,
            otpExpiresAt: true
        }
    });

    if (!user) {
        return {
            error: 'User not found'
        };
    }

    if (user.otp !== otp) {
        return {
            error: 'Invalid OTP'
        };
    }

    if (user.otpExpiresAt !== null) {
        if (user.otpExpiresAt < new Date()) {
            return {
                error: 'OTP has expired'
            };
        }
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            otp: null,
            otpExpiresAt: null
        }
    });

    return {
        message: "Otp Verified"
    };
};
