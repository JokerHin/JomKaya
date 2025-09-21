import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.userId && !body.assessmentData) {
      const userId = body.userId;
      const profile = await DatabaseService.getInvestorProfile(userId);

      return NextResponse.json({
        success: true,
        profile,
        message: profile ? "Profile found" : "Profile not found",
      });
    }

    const { userId, assessmentData } = body;

    // Validate input
    if (!userId || !assessmentData) {
      return NextResponse.json(
        { success: false, message: "User ID and assessment data are required" },
        { status: 400 }
      );
    }

    // Convert assessment data to DynamoDB format
    const profileData = DatabaseService.convertAssessmentToProfile(
      userId,
      assessmentData
    );

    // Check if profile already exists
    const existingProfile = await DatabaseService.getInvestorProfile(userId);

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await DatabaseService.updateInvestorProfile(
        userId,
        profileData
      );
    } else {
      // Create new profile
      profile = await DatabaseService.createInvestorProfile(profileData);
    }

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Failed to save assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Assessment saved successfully",
    });
  } catch (error) {
    const errAny = error as any;
    try {
      console.error("Assessment save error:", errAny, errAny?.stack);
    } catch (logErr) {
      console.error("Assessment save error (failed to print stack):", error);
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

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Please use POST with JSON body { userId }" },
    { status: 400 }
  );
}
