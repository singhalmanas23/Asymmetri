# FormulaFortress - AI Assistant

A premium AI-powered assistant built with Next.js 15, AI SDK v6, and Drizzle ORM.

## Deployment to Vercel

To host this application on Vercel, follow these steps:

### 1. Push to GitHub
The project is already pushed to [Asymmetri GitHub Repository](https://github.com/singhalmanas23/Asymmetri.git).

### 2. Connect to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project**.
3. Import the `Asymmetri` repository.

### 3. Environment Variables
Add the following environment variables in the Vercel project settings:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Your Neon/PostgreSQL connection string |
| `NEXTAUTH_SECRET` | A random 32-character string |
| `NEXTAUTH_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Client Secret |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Your Gemini/Google AI API Key |
| `GROQ_API_KEY` | Your Groq API Key |
| `OPENAI_API_KEY` | Your OpenAI API Key |
| `OPENWEATHER_API_KEY` | Your OpenWeatherMap API Key |
| `ALPHA_VANTAGE_API_KEY` | Your AlphaVantage API Key |
| `LLM_PROVIDER` | Set to `GEMINI`, `GROQ`, or `OPENAI` |

### 4. Database Setup
Vercel will build the app automatically. Before the first run, ensure your database schema is pushed:
```bash
npm run db:push
```
(You can run this locally while pointing `DATABASE_URL` to your production database).

## Features
- **Real-time Tools**: Weather, Stocks, and F1 updates using Gemini/Groq.
- **Persistent Chat**: History saved via Drizzle ORM and Neon DB.
- **Authentication**: Google and GitHub login via NextAuth.
- **Premium UI**: Sleek dark mode with glassmorphism and animations.
