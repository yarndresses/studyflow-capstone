# StudyFlow

StudyFlow is a solo capstone project designed to help students organise assignments, manage study plans, and track academic progress. The application provides a simple dashboard where users can create courses, add assignments, mark work as complete, and filter tasks by date or course.

**Live application:** [https://studyflow-capstone.vercel.app/](https://studyflow-capstone.vercel.app/)

## Project Goals

- Help students manage deadlines more effectively
- Provide a simple, responsive study planning experience
- Demonstrate full-stack web development skills in a solo capstone project
- Apply software engineering best practices such as testing, documentation, and CI/CD

## Key Features

- User authentication flow for login and account access
- Course management
- Assignment creation, editing, completion, and deletion
- Task filtering by course and due date
- Responsive interface for desktop and mobile use

## Software Engineering Methodology

This project follows an Agile-style development approach using short, iterative sprints:

- Sprint 1: core user management, course setup, assignment creation, completion, and filtering
- Sprint 2: study planning and progress tracking enhancements
- Sprint 3: analytics, polish, and refinement

The backlog was organised using user stories and acceptance criteria, which makes the development process easier to manage for a solo developer while still following professional software engineering practices. 

The Trello board can be found here: https://trello.com/invite/b/6a7a3221e12380ca57e9bfd2/ATTI26e771090bbcaa148698c28866857b160E7120E4/my-trello-board .

## Collaborative and Engineering Tools Used

- Git and GitHub for version control and collaboration
- GitHub Issues / project tracking style backlog management
- GitHub Actions for continuous integration and continuous delivery checks
- Vitest and Testing Library for automated testing
- Vite + React + TypeScript for rapid frontend development
- Supabase Auth for user sign-up and sign-in
- Neon Postgres and Neon Functions for user-scoped application data

## CI/CD

The repository includes a GitHub Actions workflow that automatically runs on every push and pull request.

The workflow performs:

- dependency installation
- automated test execution
- production build validation

This ensures that new changes are checked before being merged or deployed.

## Project Structure

- src/App.tsx: main application UI and feature logic
- src/api.ts: authenticated client for the Neon API
- src/styles.css: styling for the interface
- src/App.test.tsx: automated tests for the first sprint stories
- functions/studyflow-api.ts: authenticated Neon Function API
- database/migrations/001_initial_schema.sql: StudyFlow Postgres schema
- neon.ts: Neon Function deployment configuration
- DESIGN_AND_TESTING.md: detailed design and testing documentation

## Local Development

1. Install dependencies:
   npm install
2. Start the development server:
   npm run dev
3. Run the tests:
   npm test
4. Build for production:
   npm run build

## Data Architecture

Supabase provides authentication only. Once a user signs in, the React client sends the Supabase access token to the `studyflowapi` Neon Function. The function validates that JWT against Supabase's JWKS endpoint and uses the token subject as the `user_id` for all Neon Postgres queries.

The Neon database contains `courses`, `assignments`, `study_plan_items`, and `study_sessions`. The function enforces ownership in every query, so the browser never receives a database connection string.

## Environment Setup

Create `.env.local` with the Supabase values, Neon values pulled by `neon link`, and the deployed function URL:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_anon_key
SUPABASE_URL=https://your-project.supabase.co
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
VITE_NEON_API_BASE_URL=https://your-branch-studyflowapi.compute.neon.tech
```

`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_BRANCH` are managed by Neon and should remain local-only. Do not commit `.env.local`.

## Testing

Automated tests cover core first-sprint functionality, including:

- authentication flow
- assignment creation
- assignment completion
- assignment filtering

## Deployment

The Neon Function is deployed with:

```bash
neon deploy --env .env.local
```

The Vite frontend is deployed on Vercel at [https://studyflow-capstone.vercel.app/](https://studyflow-capstone.vercel.app/). Its `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_NEON_API_BASE_URL` values are configured as Vercel environment variables. The deployed URL is included in the Neon Function's `ALLOWED_ORIGINS`; do not use `*` for allowed origins.
