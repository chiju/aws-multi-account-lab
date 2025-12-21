import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { handleApiError } from '@/lib/errorHandler';

export async function POST(req: NextRequest) {
  try {
    const { email, username, name, password } = await req.json();

    // Server-side validation
    if (!email || !username || !name || !password) {
      return new NextResponse("All fields are required", { status: 400 });
    }

    if (!email.includes('@')) {
      return new NextResponse("Invalid email format", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", { status: 400 });
    }

    if (username.length < 3) {
      return new NextResponse("Username must be at least 3 characters", { status: 400 });
    }

    // Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return new NextResponse("Email or username already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        name,
        hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}
