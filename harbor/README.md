# Harbor

AI Visibility Intelligence Platform - See how AI sees your brand.

## Project Structure

```
harbor/
├── apps/
│   ├── web/              # Next.js dashboard application
│   └── worker/           # Serverless functions (Vercel/Cloudflare Workers)
├── packages/
│   ├── adapters/         # LLM model adapters (OpenAI, Anthropic, Gemini)
│   ├── crawler/          # Website crawler & schema validator
│   ├── parsers/          # Normalize model outputs
│   └── db/              # Supabase client & types
└── scripts/
    └── cron/            # Scheduled jobs (weekly scans)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Supabase account
- API keys for: OpenAI, Anthropic, Google (Gemini)

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up Supabase database:
   - Run the SQL schema from `harbor_supabase_schema.sql` in your Supabase SQL Editor
   - Enable Supabase Auth

5. Build packages:
   ```bash
   npm run build
   ```

6. Start development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## Development

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps and packages
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages
- `npm run clean` - Clean build artifacts

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **LLMs**: OpenAI, Anthropic, Google Gemini
- **Queues**: Upstash Redis / Vercel Queues
- **Payments**: Stripe

## Architecture

Harbor uses a monorepo structure with Turbo for efficient builds. The core workflow:

1. **Intelligence Layer**: Four modules (Shopping, Brand, Conversations, Website)
2. **Scan Pipeline**: Orchestrated jobs with caching and cost controls
3. **Optimization**: Task generation with validators and verification re-scans
4. **Verification**: Surgical re-scans of changed content only

## Design System

Harbor follows a sophisticated, minimal aesthetic:

- **Primary Navy**: `#101A31` (background)
- **Accent Coral**: `#FF6B4A` (CTAs, focus states)
- **Cerulean Blue**: `#2979FF` (secondary actions)
- **Soft Gray**: `#F4F6F8` (text)

**Typography**:
- Headings: Space Grotesk (500-700)
- Body/UI: Source Code Pro (400-500)

See `harbor_visual_styling_playbook_v_1.md` for complete design guidelines.

## License

Proprietary - All rights reserved
