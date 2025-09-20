import { NextRequest, NextResponse } from "next/server";
import { DatabaseService } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { userId, assessmentData } = await request.json();

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
    console.error("Assessment save error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const profile = await DatabaseService.getInvestorProfile(userId);

    return NextResponse.json({
      success: true,
      profile,
      message: profile ? "Profile found" : "Profile not found",
    });
  } catch (error) {
    console.error("Get assessment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
