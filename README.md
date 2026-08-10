# StudyFlow

StudyFlow is a solo capstone project designed to help students organise assignments, manage study plans, and track academic progress. The application provides a simple dashboard where users can create courses, add assignments, mark work as complete, and filter tasks by date or course.

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

## Collaborative and Engineering Tools Used

- Git and GitHub for version control and collaboration
- GitHub Issues / project tracking style backlog management
- GitHub Actions for continuous integration and continuous delivery checks
- Vitest and Testing Library for automated testing
- Vite + React + TypeScript for rapid frontend development

## CI/CD

The repository includes a GitHub Actions workflow that automatically runs on every push and pull request.

The workflow performs:

- dependency installation
- automated test execution
- production build validation

This ensures that new changes are checked before being merged or deployed.

## Project Structure

- src/App.tsx: main application UI and feature logic
- src/styles.css: styling for the interface
- src/App.test.tsx: automated tests for the first sprint stories
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

## Testing

Automated tests cover core first-sprint functionality, including:

- authentication flow
- assignment creation
- assignment completion
- assignment filtering

## Deployment Recommendation

A cloud-based deployment approach is recommended for this project. A practical option is to host the frontend on Vercel and connect it to a managed PostgreSQL service if the application is extended beyond the current prototype.
