# Chai AI Code Reviewer

<p align="center">
  <img src="./public/93506170-1cba-4fd5-b466-a1348ad9bd3a.png" alt="Chai AI Code Reviewer — AI Reviews Your PRs" width="100%" />
</p>

An AI-powered GitHub pull request reviewer that automatically analyzes code changes and posts actionable review comments on your PRs. Connect your GitHub App, and every opened, updated, or reopened pull request gets a structured markdown review — no manual sync required.

## Description

Chai AI Code Reviewer is a full-stack SaaS app built with Next.js. It listens for GitHub pull request webhooks, fetches the PR diff, uses vector search to find the most relevant code chunks, and generates a review with the Vercel AI SDK and OpenRouter. Reviews are posted back to GitHub as PR comments.

Optionally, you can sync an entire repository into Pinecone for richer context — for example, how changed code relates to other files outside the diff. PR reviews work without syncing; repo sync is an enhancement for deeper, cross-file feedback.

The dashboard lets you connect GitHub, browse repositories, track review history, monitor usage, and manage a Free or Pro subscription.

## Features

- **Automatic PR reviews** — Reviews run on `opened`, `synchronize`, and `reopened` PR events via GitHub webhooks
- **AI-generated feedback** — Structured markdown reviews covering correctness, security, performance, reliability, readability, and maintainability
- **GitHub App integration** — Install the app on your org or account to access repositories and post review comments
- **Vector-based context** — PR diffs are chunked and indexed in Pinecone so the model focuses on the most relevant changes
- **Optional repo sync** — Manually sync a repository’s codebase for extra context from files outside the PR diff
- **Dashboard** — Overview stats, repository list, pull request history, and GitHub connection status
- **Review activity tracking** — See recent reviews and their status (pending, processing, reviewed, rate-limited)
- **Authentication** — Sign in with GitHub using Better Auth
- **Subscription billing** — Free plan (5 reviews/month, public repos) and Pro plan (unlimited reviews, private repos) via Razorpay
- **Background jobs** — Long-running sync and review tasks handled reliably with Inngest
- **Dark mode** — Theme support across the dashboard UI

## Tech Stack & Tools

### Frontend

| Tool | Purpose |
|------|---------|
| [Next.js 16](https://nextjs.org/) | React framework (App Router) |
| [React 19](https://react.dev/) | UI library |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Accessible UI components |
| [TanStack Query](https://tanstack.com/query) | Server state, caching, and mutations |
| [Lucide React](https://lucide.dev/) | Icons |
| [Streamdown](https://github.com/vercel/streamdown) | Markdown rendering for AI reviews |
| [Recharts](https://recharts.org/) | Dashboard charts |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark / light mode |

### Backend & Data

| Tool | Purpose |
|------|---------|
| [PostgreSQL](https://www.postgresql.org/) | Primary database |
| [Prisma 7](https://www.prisma.io/) | ORM and migrations |
| [Better Auth](https://www.better-auth.com/) | GitHub OAuth and session management |
| [Inngest](https://www.inngest.com/) | Background jobs (PR reviews, repo sync) |

### AI & Search

| Tool | Purpose |
|------|---------|
| [Vercel AI SDK](https://sdk.vercel.ai/) | LLM integration (`generateText`) |
| [OpenRouter](https://openrouter.ai/) | AI model provider |
| [Pinecone](https://www.pinecone.io/) | Vector database for code chunk retrieval |

### GitHub & Payments

| Tool | Purpose |
|------|---------|
| [Octokit](https://github.com/octokit/octokit.js) | GitHub App API (PR files, repo contents, comments) |
| [GitHub App + Webhooks](https://docs.github.com/en/apps) | PR events and repository access |
| [Razorpay](https://razorpay.com/) | Subscriptions and billing webhooks |

### Dev Tools

| Tool | Purpose |
|------|---------|
| [ESLint](https://eslint.org/) | Linting |
| [Inngest CLI](https://www.inngest.com/docs/dev-server) | Local background job dev server |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- GitHub OAuth App + GitHub App
- Pinecone index (integrated embeddings: `llama-text-embed-v2`, field map `text=text`)
- OpenRouter API key
- Razorpay account (for subscriptions)

### Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Install & run

```bash
npm install
npx prisma migrate dev
npm run dev
```

For background jobs locally, run the Inngest dev server in a separate terminal:

```bash
npx inngest-cli@latest dev
```

Set `INNGEST_DEV=1` in your `.env` when using the local Inngest dev server.

Open [http://localhost:3000](http://localhost:3000), sign in with GitHub, connect the GitHub App, and open a pull request on a connected repository to trigger your first AI review.

## Project Structure

```
app/                    # Next.js routes and API endpoints
features/
  billing/              # Razorpay subscriptions and usage limits
  dashboard/            # Dashboard shell and navigation
  github/               # GitHub App, webhooks, installations
  overview/             # Dashboard overview and activity
  pull-requests/        # PR list and review display
  repo-sync/            # Optional full-repo indexing
  reviews/              # PR review pipeline (Inngest + AI)
components/             # Shared UI components
lib/                    # Auth, DB, server actions
prisma/                 # Schema and migrations
```


