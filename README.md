<h1>JomKaya</h1>
Website : <a href="https://main.d2xt46nqbihpj9.amplifyapp.com/chat">https://main.d2xt46nqbihpj9.amplifyapp.com/chat</a>
Github : <a href="https://github.com/JokerHin/JomKaya">https://github.com/JokerHin/JomKaya</a>

Our project is an AI-powered Shariah-compliant investment assistant that helps users explore and understand Shariah-compliant investment opportunities in Malaysia. The system not only answers questions about stock compliance, Islamic screening rules, and sectors but also provides personalised investment recommendations that align with Shariah principles.

To make it more inclusive, the assistant can also communicate in Bahasa Melayu, so that even kampung investors (rural community investors) who may not be fluent in English can easily use the platform and gain confidence in making Shariah-compliant financial decisions.

<h1>❗ Problem We Are Solving</h1>

Many investors in Malaysia face challenges when it comes to understanding Shariah compliance in investments:

Lack of Accessibility – Information about Shariah-compliant stocks is often scattered and technical, making it difficult for ordinary investors to verify compliance quickly.

Language Barrier – Most existing tools and resources are in English or use technical financial jargon, which excludes rural or less tech-savvy investors.

Trust & Guidance – Retail investors often don’t know where to start when looking for trustworthy Shariah-compliant investments, leading to confusion or risky choices.

Our assistant solves these problems by:
✅ Providing instant answers about Shariah compliance and Islamic screening rules.
✅ Offering recommendations on Shariah-compliant investments.
✅ Supporting Bahasa Melayu for better accessibility among rural communities.
✅ Acting as a trusted, AI-powered guide for making informed and halal investment decisions.

<h1>🏗️ Architecture</h1>
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


<h1>🖥️ Running Locally</h1>

# Install dependencies
npm install

# Start dev server
npm run dev

# Build production
npm run build
npm start
