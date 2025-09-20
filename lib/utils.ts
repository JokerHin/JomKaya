import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const clientConfig: any = {
  region: process.env.REGION || "us-east-1",
};

if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  };
} else {
  console.warn(
    "AWS credentials not fully provided via env vars. Relying on default credential provider chain."
  );
}

const client = new DynamoDBClient(clientConfig);

export const dynamoClient = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: process.env.DYNAMODB_USERS_TABLE || "Users",
  INVESTOR_PROFILES:
    process.env.DYNAMODB_INVESTOR_PROFILES_TABLE || "InvestorProfiles",
} as const;
