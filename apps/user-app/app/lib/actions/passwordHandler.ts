"use server"

import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import z from "zod";

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Password must be at least 6 characters long"),
    newPassword: z.string().min(6, "Password must be at least 6 characters long")
});

export async function changePassword(id: string | undefined, currentPassword: string, newPassword: string) {
    const parsedCredentials = passwordSchema.safeParse({currentPassword, newPassword});
    if (!parsedCredentials.success) {
        return {
            error: "Invalid passwords!"
        };
    }

    const user = await prisma.user.findUnique({
        where: {
            id: Number(id)
        }
    });

    if (!user) {
        return {
            error: "User not found!"
        };
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
        return {
            error: "Invalid current password!"
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            password: hashedPassword
        }
    });

    return {
        message: "Password updated successfully!"
    };
}
