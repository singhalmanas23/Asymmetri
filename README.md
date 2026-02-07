# Asymmetri AI Assistant

A powerful, real-time AI assistant built with Next.js 16, Vercel AI SDK, and Google Gemini.

## ✨ Key Features
- **Real-time Streaming**: Instant responses using Vercel AI SDK.
- **Tool Calling**: Integrated with live weather, stock prices, and F1 schedules.
- **Session Management**: Persistent chat history using Drizzle ORM and PostgreSQL.
- **Dark Mode Support**: Premium aesthetics with theme-aware UI components.
- **Rate Limit Resilience**: Specific error handling for API quota limits with toast notifications.
- **NextAuth Integration**: Secure login with Google and GitHub.

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your `.env` file with database and API keys
4. Run migrations: `npm run db:push`
5. Start development: `npm run dev`
