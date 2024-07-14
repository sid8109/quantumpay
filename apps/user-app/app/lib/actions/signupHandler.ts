"use server"

import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import { z } from "zod";
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from "../email";

const createUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    number: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

type CreateUserInput = z.infer<typeof createUserSchema>;

export async function createUser(credentials: { name: string; email: string; number: string; password: string; }) {
    const parsedCredentials = createUserSchema.safeParse(credentials);
    if (!parsedCredentials.success) {
        return {
            error: "Invalid input data"
        };
    }
    const hashedPassword = await bcrypt.hash(credentials.password, 10);
    const emailVerificationToken = uuidv4();
    const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await sendVerificationEmail(credentials.email, emailVerificationToken);

    try {
        await prisma.user.create({
            data: {
                name: credentials.name,
                email: credentials.email,
                number: credentials.number,
                password: hashedPassword,
                emailVerificationToken,
                emailVerificationTokenExpires,
                Balance: {
                    create: {
                        amount: 0,
                        locked: 0
                    }
                },
                BalanceHistory: {
                    create: {
                        amount: 0,
                        timestamp: new Date()
                    }
                }
            }
        });
        return {
            message: "User created successfully"
        };
    } catch (e) {
        console.error(e);
        return {
            error: "Something went wrong"
        };
    }
}

export async function sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `http://localhost:3001/api/verify-email?token=${token}`;
    await sendEmail({
        to: email,
        subject: 'Verify Your Email Address - QuantumPay',
        text: `Welcome to QuantumPay!
    
    Thank you for joining QuantumPay - your ultimate solution for seamless and secure digital payments.
    
    Please verify your email address to complete your registration and unlock the full potential of QuantumPay.
    
    Click the link to verify your email: ${verificationUrl}
    
    If you did not create an account with QuantumPay, please ignore this email.
    
    Best regards,
    The QuantumPay Team
    Empowering Your Financial Future`,
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #ddd;
                }
                .header h2 {
                    color: #00baf2;
                    margin: 0;
                }
                .content {
                    text-align: left;
                    padding: 20px 0;
                }
                .content p {
                    margin: 10px 0;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    margin: 20px 0;
                    background-color: #00baf2;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #777;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Welcome to QuantumPay!</h2>
                </div>
                <div class="content">
                    <p>Thank you for joining <strong>QuantumPay</strong> - your ultimate solution for seamless and secure digital payments.</p>
                    <p>Please verify your email address to complete your registration and unlock the full potential of QuantumPay.</p>
                    <p>
                        <a href="${verificationUrl}" class="button">Verify Your Email</a>
                    </p>
                    <p>If the button above doesn't work, please copy and paste the following URL into your web browser:</p>
                    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                    <p>If you did not create an account with QuantumPay, please ignore this email.</p>
                    <p>Best regards,</p>
                    <p>The QuantumPay Team</p>
                </div>
                <div class="footer">
                    <p>Empowering Your Financial Future</p>
                </div>
            </div>
        </body>
        </html>
        `,
    });
    
}