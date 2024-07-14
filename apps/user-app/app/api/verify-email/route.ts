import { NextRequest, NextResponse } from 'next/server';
import prisma from '@repo/db/client';
import { redirect } from 'next/navigation'

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');

    if (!token || typeof token !== 'string') {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: token,
            emailVerificationTokenExpires: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpires: null,
        },
    });

    redirect("/signin")
}
