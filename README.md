<h1>JomKaya</h1>
</div>

A web application that helps users instantly check the Shariah compliance status of securities in Malaysia. The platform provides AI-powered insights on:

✅ Whether a stock is Shariah-compliant

📊 Sector classifications and screening criteria

📖 Explanations of Islamic screening rules

Built with Next.js, AWS Amplify, and DynamoDB, the assistant makes it easy for investors to make informed and ethical investment decisions.

✨ Features
🔐 Authentication: Login and Register with DynamoDB backend.

👤 Investor Profiles: Manage user investment data.

💬 AI Chatbot: Powered by Amazon Bedrock or OpenAI.

📊 Assessment Tools: Basic financial assessments.

☁️ Deployment: Deployed on AWS Amplify with auto-deploy from GitHub.

🏗️ Architecture
[ User Browser ]
      |
      v
[ Next.js Frontend (Amplify Hosting) ]
      |
      v
[ Next.js API Routes -> Amplify Lambda Functions ]
      |                       |
      |                       +--> [ DynamoDB Tables (Users, Profiles, Chat) ]
      |                       |
      |                       +--> [ AI Provider: Amazon Bedrock / OpenAI ]
      |
      v
[ Response Rendered in Chat UI ]
📸 Screenshots
🔐 Login Page
<img src="docs/screenshots/login.png" alt="Login Page" width="600"/>

📝 Register Page
<img src="docs/screenshots/register.png" alt="Register Page" width="600"/>

💬 AI Chatbot
<img src="docs/screenshots/chatbot.png" alt="AI Chatbot" width="600"/>

📊 Investor Profile Dashboard
<img src="docs/screenshots/dashboard.png" alt="Investor Profile Dashboard" width="600"/>

⚠️ Note: Replace the image links with your actual screenshots stored in docs/screenshots/.

⚙️ Environment Variables
Create a .env file for local development:

REGION=us-east-1
NEXT_PUBLIC_DYNAMODB_USERS_TABLE=Users
NEXT_PUBLIC_DYNAMODB_INVESTOR_PROFILES_TABLE=InvestorProfiles

# AI Provider
NEXT_PUBLIC_BEDROCK_REGION=us-east-1
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key   # if using OpenAI
⚠️ Warning: Do not prefix with AWS_ in Amplify — these are reserved. Use NEXT_PUBLIC_ for frontend-accessible values. In production, add the same variables under Amplify → App Settings → Environment Variables.

🖥️ Running Locally
Bash

# Install dependencies
npm install

# Start dev server
npm run dev

# Build production
npm run build
npm start
