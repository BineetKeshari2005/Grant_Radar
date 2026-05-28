# 🔭 ScrapeScout AI

An autonomous, AI-powered platform for discovering and tracking global opportunities (grants, fellowships, accelerators, scholarships). Built with Next.js 15, Supabase, and OpenAI.

![ScrapeScout AI Dashboard Screenshot](/placeholder-screenshot.png)

## Tech Stack

*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4, Framer Motion
*   **Backend / DB**: Supabase (PostgreSQL), Edge Functions
*   **AI / NLP**: Groq (`llama-3.3-70b-versatile`)
*   **Scraping**: Cheerio
*   **Date Utils**: `date-fns`

## Features

1.  **AI Scraper Pipeline**: Autonomously scrapes aggregator sites and uses LLMs to extract structured JSON data (funding amounts, eligibility, deadlines).
2.  **Natural Language Search**: "Find women founder grants in Europe" uses AI to auto-populate exact database filters.
3.  **Application Kanban Tracker**: Drag-and-drop style application tracker with chronological milestones and markdown notes.
4.  **Smart Deadlines**: Calendar grid view to visualize upcoming opportunity deadlines.

---

## Local Setup

### 1. Database Setup (Supabase)
Create a new [Supabase](https://supabase.com) project. Go to the SQL Editor and run the schema file located at `supabase/schema.sql` to create the required tables and security policies.

### 2. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in the values:
```bash
cp .env.local.example .env.local
```
Required keys:
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
*   `SUPABASE_SERVICE_ROLE_KEY`
*   `GROQ_API_KEY`
*   `PIPELINE_SECRET` (A random string you create, e.g. `my-secret-token`)

### 3. Install & Run
```bash
npm install
npm run dev
```

---

## Pipeline Commands

The platform features an autonomous pipeline you can trigger locally via NPM scripts:

*   `npm run seed` - Inserts sample raw HTML records into the DB.
*   `npm run scrape` - Runs the Cheerio web scrapers against target websites.
*   `npm run process-raw` - Pipes all unprocessed `raw` records through OpenAI to extract structured JSON.
*   `npm run pipeline` - Runs the entire autonomous loop in sequence.

---

## Deployment

### Vercel Deployment
Deploy the Next.js app to Vercel. Ensure you add all the Environment Variables from your `.env.local` file into the Vercel project settings.

### GitHub Actions (Daily Scraper)
The repository includes a daily GitHub Actions workflow (`.github/workflows/daily-pipeline.yml`) that pings your deployed API every day at 2 AM UTC to automatically scrape and process new opportunities.

To enable this, go to your GitHub Repository Settings > Secrets and Variables > Actions, and add:
*   `APP_URL`: Your Vercel deployment URL (e.g., `https://scrapescout.vercel.app`)
*   `PIPELINE_SECRET`: The exact secret token you set in your environment variables.
