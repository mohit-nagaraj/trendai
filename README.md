# TrendPilot: Social Content Intelligence Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-doudoujay/mohit-blue?logo=github)](https://github.com/doudoujay/mohit)

## Overview

**TrendPilot** is a full-stack, AI-powered platform for analyzing social media content performance, surfacing emerging trends, and generating actionable content ideas. Built as part of a strategic work trial for Final Round AI, it combines robust analytics, trend intelligence, and ideation tools to empower marketers and creators.

This project was developed as a 7-day challenge to demonstrate the ability to independently assess social media performance, identify trends, and generate marketing ideas, with a focus on real-world deliverables and extensibility.

## Table of Contents

- [Features](#features)
- [Project Phases & Unique Additions](#project-phases--unique-additions)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage](#usage)
- [Demo Account](#demo-account)
- [Work Trial Context](#work-trial-context)
- [Extending the Platform](#extending-the-platform)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Authentication & Secure Access**: Supabase-powered login/logout, protected routes, and middleware.
- **Content Upload & Processing**: Upload CSVs, validate, deduplicate, and store content with metrics.
- **AI Analysis Pipeline**: Integrates Gemini 2.5 for content analysis, performance metrics, and insight generation.
- **Performance Dashboard**: Visualizes aggregate and post-level metrics with interactive charts.
- **Trend Intelligence System**: Tracks, scores, and displays trends from multiple sources, with AI-powered relevance.
- **Content Ideation Engine**: Generates content ideas, hooks, and visual styles, with performance predictions.
- **PDF Export**: Export generated ideas for sharing or reporting.
- **Command Palette**: Quick navigation and actions via Ctrl+K.
- **Modern UI**: Built with reusable, accessible components and responsive design.

## Project Phases & Unique Additions

This project was developed in well-defined phases, each with clear deliverables. Beyond the initial scope, several unique features and improvements were added to enhance usability and insight generation.

### Phase 1: Foundation & Authentication (MVP Core) ✅

- Next.js + TypeScript setup
- Supabase integration (DB + Auth)
- Authentication flow (login/logout)
- Routing structure
- UI components and pages (with dummy data)
- Database schema
- Protected route middleware
- **Command Palette (Ctrl+K) for quick search and navigation** ← _unique addition_

### Phase 2: Content Upload & Processing (MVP Content) ✅

- File upload with CSV validation
- CSV parsing, data extraction, and duplicate detection
- Content storage in DB (metrics, video scrape, upload)
- Processing status tracking
- Dashboard view for imported content

### Phase 3: AI Analysis Pipeline (MVP Intelligence) ✅

- Gemini AI service integration (Gemini 2.5)
- Content analysis pipeline
- Performance metric calculations
- AI insight storage and retrieval
- Insight display on frontend

### Phase 4: Performance Dashboard (MVP Visualization) ✅

- Aggregate metrics calculation
- Chart components (viewers)
- Detailed post analysis views

### Phase 5: Trend Intelligence System (MVP Trends) ✅

- Trend fetching from multiple sources
- 24-hour refresh logic
- AI-powered relevance scoring
- Trend storage and management
- Trend dashboard page
- Manual refresh capability

### Phase 6: Content Ideation Engine (MVP Ideas) ✅

- Content idea generation pipeline
- Hook and visual style suggestions
- Performance prediction model
- Idea storage and organization
- Detailed idea view with rationale
- Integration with trend data

### Further Enhancements

- **PDF export of ideas** ← _unique addition_
- **"View similar" feature to gather related ideas** ← _unique addition_
- **Planned: AI chat for content ideation, agent-based idea improvement** ← _unique roadmap_

## Architecture

- **Frontend**: Next.js (App Router), TypeScript, modular UI components, responsive design.
- **Backend/API**: Next.js API routes, Supabase for database and authentication.
- **AI Integration**: Gemini 2.5 for content analysis and ideation.
- **Data Processing**: CSV parsing, duplicate detection, and metrics calculation.
- **Visualization**: Custom chart components for analytics and trends.
- **State Management**: React context and hooks.
- **Security**: Protected routes, Supabase auth, middleware.

### Directory Structure

- `app/` — Next.js app directory (pages, API routes, middleware)
- `components/` — UI and visualization components
- `lib/` — Utility libraries (AI, analytics, ingestion, queue)
- `hooks/` — Custom React hooks
- `utils/` — CSV, PDF, and Supabase utilities

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/doudoujay/mohit.git
   cd mohit
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase and AI API keys.

4. **Run database migrations:**
   - Ensure your Supabase project is set up and run the SQL in `supabase/migrations/`.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Usage

- **Login** with your Supabase credentials (or use the demo account below).
- **Upload content** via CSV to analyze social posts.
- **View dashboards** for performance metrics and insights.
- **Explore trends** and generate new content ideas.
- **Export ideas** as PDF for sharing.
- **Use the command palette (Ctrl+K)** for fast navigation and actions.

## Extending the Platform

- **AI Chat for Ideation**: Planned feature for interactive idea refinement.
- **Agent-based Content Improvement**: Roadmap for autonomous idea enhancement.
- **Additional Trend Sources**: Easily add new APIs or scrapers.
- **Custom Analytics**: Extend charting and metrics as needed.

## Contributing

Contributions are welcome! Please open issues or pull requests for improvements, bug fixes, or new features.

## License

[MIT](LICENSE)

---

**_Built with ❤️ for the Final Round AI work trial. For questions or demo requests, contact [repo owner](https://github.com/doudoujay)._**
