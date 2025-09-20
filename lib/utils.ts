import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const dynamoClient = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || "Users",
  INVESTOR_PROFILES:
    process.env.DYNAMODB_INVESTOR_PROFILES_TABLE || "InvestorProfiles",
} as const;
