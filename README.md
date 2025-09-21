<h1>JomKaya</h1>

JomKaya is a full-stack financial web platform built with Next.js, AWS Amplify, DynamoDB, and Amazon Bedrock AI.
It provides authentication, investor profile management, and an AI-powered chatbot for financial guidance.

✨ Features

🔐 Authentication (Login & Register with DynamoDB backend)

👤 Investor Profiles (Manage user investment data)

💬 AI Chatbot (Powered by Amazon Bedrock or OpenAI)

📊 Assessment Tools (Basic financial assessments)

☁️ Deployed on AWS Amplify with auto-deploy from GitHub

🏗️ Architecture
[ User Browser ]
      |
      v
[ Next.js Frontend (Amplify Hosting) ]
      |
      v
[ Next.js API Routes -> Amplify Lambda Functions ]
      |                   |
      |                   +--> [ DynamoDB Tables (Users, Profiles, Chat) ]
      |                   |
      |                   +--> [ AI Provider: Amazon Bedrock / OpenAI ]
      |
      v
[ Response Rendered in Chat UI ]

📸 Screenshots
🔐 Login Page

📝 Register Page

💬 AI Chatbot

📊 Investor Profile Dashboard

⚠️ Replace the image links with your actual screenshots stored in docs/screenshots/.

⚙️ Environment Variables

Create a .env file for local development:

REGION=us-east-1
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=Users
NEXT_PUBLIC_DYNAMODB_INVESTOR_PROFILES_TABLE=InvestorProfiles

# AI Provider
NEXT_PUBLIC_BEDROCK_REGION=us-east-1
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key   # if using OpenAI


⚠️ Do not prefix with AWS_ in Amplify — these are reserved. Use NEXT_PUBLIC_ for frontend-accessible values.
In production, add the same variables under Amplify → App Settings → Environment Variables.

🖥️ Running Locally
# Install dependencies
npm install

# Start dev server
npm run dev

# Build production
npm run build
npm start

🚀 Deployment

Amplify Hosting:
Every push to GitHub → triggers an Amplify build → deploys automatically.

Ensure Amplify IAM Role has permissions:

dynamodb:GetItem, PutItem, UpdateItem, Query

bedrock:InvokeModel (if using Bedrock)

ssm:GetParameter (if using SSM secrets)
