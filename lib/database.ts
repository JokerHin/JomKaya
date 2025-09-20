import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { DBUser, DBInvestorProfile } from "@/components/auth-provider";
import { dynamoClient, TABLES } from "@/lib/utils";
import bcrypt from "bcryptjs";

export class DatabaseService {
  static async createUser(
    email: string,
    password: string,
    name: string
  ): Promise<DBUser> {
    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();
    const userId = `user_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const user: DBUser = {
      user_id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoClient.send(
      new PutCommand({
        TableName: TABLES.USERS,
        Item: user,
        ConditionExpression: "attribute_not_exists(email)",
      })
    );

    return user;
  }

  static async getUserByEmail(email: string): Promise<DBUser | null> {
    try {
      const result = await dynamoClient.send(
        new ScanCommand({
          TableName: TABLES.USERS,
          FilterExpression: "email = :email",
          ExpressionAttributeValues: {
            ":email": email,
          },
        })
      );

      return (result.Items?.[0] as DBUser) || null;
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  }

  static async getUserById(id: string): Promise<DBUser | null> {
    try {
      const result = await dynamoClient.send(
        new GetCommand({
          TableName: TABLES.USERS,
          Key: { user_id: id },
        })
      );

      return (result.Item as DBUser) || null;
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  }

  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static async createInvestorProfile(
    profile: Omit<DBInvestorProfile, "createdAt" | "updatedAt">
  ): Promise<DBInvestorProfile> {
    const now = new Date().toISOString();
    const fullProfile: DBInvestorProfile = {
      ...profile,
      createdAt: now,
      updatedAt: now,
    };

    await dynamoClient.send(
      new PutCommand({
        TableName: TABLES.INVESTOR_PROFILES,
        Item: fullProfile,
      })
    );

    return fullProfile;
  }

  static async getInvestorProfile(
    userId: string
  ): Promise<DBInvestorProfile | null> {
    try {
      // Since profileId is the partition key, we need to scan with filter to find by user_id
      const result = await dynamoClient.send(
        new ScanCommand({
          TableName: TABLES.INVESTOR_PROFILES,
          FilterExpression: "user_id = :userId",
          ExpressionAttributeValues: {
            ":userId": userId,
          },
        })
      );

      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as DBInvestorProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting investor profile:", error);
      return null;
    }
  }

  static async updateInvestorProfile(
    userId: string,
    updates: Partial<
      Omit<DBInvestorProfile, "profileId" | "user_id" | "createdAt">
    >
  ): Promise<DBInvestorProfile | null> {
    try {
      // First, find the existing profile to get the profileId
      const existingProfile = await this.getInvestorProfile(userId);
      if (!existingProfile) {
        console.error("Profile not found for user:", userId);
        return null;
      }

      const updateExpression = Object.keys(updates)
        .map((key) => `#${key} = :${key}`)
        .join(", ");
      const expressionAttributeNames = Object.keys(updates).reduce(
        (acc, key) => ({ ...acc, [`#${key}`]: key }),
        {}
      );
      const expressionAttributeValues = Object.keys(updates).reduce(
        (acc, key) => ({
          ...acc,
          [`:${key}`]: updates[key as keyof typeof updates],
        }),
        { ":updatedAt": new Date().toISOString() }
      );

      const result = await dynamoClient.send(
        new UpdateCommand({
          TableName: TABLES.INVESTOR_PROFILES,
          Key: { profileId: existingProfile.profileId }, // Use profileId as the key
          UpdateExpression: `SET ${updateExpression}, #updatedAt = :updatedAt`,
          ExpressionAttributeNames: {
            ...expressionAttributeNames,
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      return (result.Attributes as DBInvestorProfile) || null;
    } catch (error) {
      console.error("Error updating investor profile:", error);
      return null;
    }
  }

  static convertAssessmentToProfile(
    userId: string,
    assessment: {
      investmentGoals?: string[];
      riskAppetite?: string;
      investmentExperience?: string;
      investmentHorizon?: string;
      initialInvestmentAmount?: number | string;
      monthlyIncome?: number | string;
      preferredSectors?: string[];
      shariahCompliantOnly?: boolean;
      liquidityNeeds?: string;
    }
  ): Omit<DBInvestorProfile, "createdAt" | "updatedAt"> {
    return {
      profileId: `profile_${userId}_${Date.now()}`, // Generate unique profile ID
      user_id: userId,
      investmentGoals: assessment.investmentGoals || [],
      riskTolerance: this.mapRiskTolerance(assessment.riskAppetite || ""),
      investmentExperience: this.mapInvestmentExperience(
        assessment.investmentExperience || ""
      ),
      timeHorizon: this.mapTimeHorizon(assessment.investmentHorizon || ""),
      investmentAmount: assessment.initialInvestmentAmount?.toString() || "0",
      incomeRange: assessment.monthlyIncome?.toString() || "0",
      geographicPreferences: assessment.preferredSectors || [],
      sustainabilityFocus: assessment.shariahCompliantOnly
        ? "Very Important"
        : "Not Important",
      liquidityNeeds: this.mapLiquidityNeeds(assessment.liquidityNeeds || ""),
      taxConsiderations: "Somewhat Important",
    };
  }

  private static mapRiskTolerance(
    riskAppetite: string
  ): "Conservative" | "Moderate" | "Aggressive" {
    switch (riskAppetite) {
      case "low":
        return "Conservative";
      case "medium":
        return "Moderate";
      case "high":
      case "critical":
        return "Aggressive";
      default:
        return "Moderate";
    }
  }

  private static mapInvestmentExperience(
    experience: string
  ): "Beginner" | "Intermediate" | "Advanced" {
    switch (experience) {
      case "none":
      case "1-3-years":
        return "Beginner";
      case "3-5-years":
        return "Intermediate";
      case "5-plus-years":
        return "Advanced";
      default:
        return "Beginner";
    }
  }

  private static mapTimeHorizon(
    horizon: string
  ): "1-2 years" | "3-5 years" | "5-10 years" | "10+ years" {
    switch (horizon) {
      case "short":
        return "1-2 years";
      case "medium":
        return "3-5 years";
      case "long":
        return "10+ years";
      default:
        return "5-10 years";
    }
  }

  private static mapLiquidityNeeds(needs: string): "High" | "Medium" | "Low" {
    switch (needs) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Medium";
    }
  }
}
