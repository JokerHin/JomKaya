import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user data
    const user = await DatabaseService.getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get investor profile
    const profile = await DatabaseService.getInvestorProfile(userId);

    // Return user without password
    type DBUser = { [key: string]: unknown } & { password?: string };
    const userCopy = { ...user } as DBUser;
    delete userCopy.password;

    return NextResponse.json({
      success: true,
      user: {
        ...userCopy,
        hasCompletedAssessment: !!profile,
        profileData: profile || null,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Please use POST with JSON body { userId }" },
    { status: 400 }
  );
}
