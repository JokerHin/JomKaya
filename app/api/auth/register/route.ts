import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
    }

    // Create new user
    const user = await DatabaseService.createUser(email, password, name);

    type DBUser = { [key: string]: unknown } & { password?: string };
    const userCopy = { ...user } as DBUser;
    delete userCopy.password;

    const userId = (user as { user_id?: string }).user_id;

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        ...userCopy,
      },
      message: "User created successfully",
    });
  } catch (_error) {
    const errAny = _error as any;
    try {
      console.error("Registration error:", errAny, errAny?.stack);
    } catch (logErr) {
      console.error("Registration error (failed to print stack):", _error);
    }

    if (errAny && typeof errAny.message === "string") {
      return NextResponse.json(
        { success: false, message: errAny.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
