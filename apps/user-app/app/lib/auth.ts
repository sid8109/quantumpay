import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";
import { sendVerificationEmail } from "./actions/signupHandler";
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const credentialsSchema = z.object({
    number: z.string().min(10, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
                password: { label: "Password", type: "password", required: true }
            },
            async authorize(credentials: any) {
                const parsedCredentials = credentialsSchema.safeParse(credentials);
                if (!parsedCredentials.success) {
                    throw new Error("Invalid input data");
                }

                const existingUser = await db.user.findFirst({
                    where: {
                        number: credentials.number
                    },
                    include: {
                        Balance: {select: {amount: true, locked: true}}
                    }
                });

                if (existingUser && await bcrypt.compare(credentials.password, existingUser.password)) {
                    if (!existingUser.emailVerified) {
                        const emailVerificationToken = uuidv4();
                        const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

                        await db.user.update({
                            where: { id: existingUser.id },
                            data: {
                                emailVerificationToken,
                                emailVerificationTokenExpires
                            }
                        });

                        await sendVerificationEmail(existingUser.email, emailVerificationToken);

                        throw new Error("Email not verified. Please check your email for the verification link!");
                    }

                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.email,
                        number: existingUser.number,
                        balance: existingUser.Balance[0]?.amount,
                        locked: existingUser.Balance[0]?.locked
                    };
                }

                throw new Error("Invalid credentials");
            },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.email = user.email;
                token.number = user.number;
                token.balance = user.balance; 
                token.locked = user.locked
            }
            return token;
        },
        async session({ token, session }: any) {
            session.user.id = token.id;
            session.user.name = token.name;
            session.user.email = token.email;
            session.user.number = token.number;
            session.user.balance = token.balance;
            session.user.locked = token.locked;
            return session;
        }
    },
    pages: {
        signIn: "/signin"
    }
} satisfies NextAuthOptions;