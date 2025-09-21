import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Get user by email
    const user = await DatabaseService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await DatabaseService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user has completed assessment
    const investorProfile = await DatabaseService.getInvestorProfile(
      user.user_id
    );

    type DBUser = { [key: string]: unknown } & { password?: string };
    const userCopy = { ...user } as DBUser;
    delete userCopy.password;

    return NextResponse.json({
      success: true,
      user: {
        ...userCopy,
        id: user.user_id,
        hasCompletedAssessment: !!investorProfile,
        assessmentData: investorProfile || undefined,
      },
      message: "Login successful",
    });
  } catch (error) {
    const errAny = error as any;
    try {
      console.error("Login error:", errAny, errAny?.stack);
    } catch (logErr) {
      console.error("Login error (failed to print stack):", error);
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
