# Design and Testing Document

## Project Title
StudyFlow – a solo capstone project for managing study plans, assignments, and progress tracking.

## 1. Project Overview
StudyFlow is a web-based study management application designed for students who need a simple and effective way to organise academic tasks, track study sessions, and review progress over time. The system allows users to create accounts, manage courses and assignments, plan study sessions, and view progress reports.

The project is being developed as a solo capstone, so the design prioritises:
- simplicity
- maintainability
- rapid development
- clear documentation
- deployable functionality within a realistic timeframe

## 2. Goals and Non-Functional Requirements
### Functional Goals
- Allow users to register and authenticate securely.
- Allow users to create and manage courses and assignments.
- Allow users to plan and log study sessions.
- Allow users to view progress summaries and study history.
- Provide a clear and responsive interface across desktop and mobile devices.

### Non-Functional Goals
- Usability: the interface should be intuitive for students.
- Maintainability: the codebase should be readable and modular.
- Reliability: core features should work consistently.
- Security: user authentication and data protection should be handled properly.
- Performance: essential actions such as loading tasks and updating progress should be fast.

## 3. Design and Architecture Decisions

### 3.1 Recommended Technology Stack
The following stack is recommended for the capstone because it is modern, widely supported, and practical for a solo developer.

- Frontend: Next.js with React and TypeScript
  - Reason: provides a strong developer experience, component-based UI development, and built-in routing and rendering support.
- Backend: Next.js API routes (or a lightweight Express service if later required)
  - Reason: reduces the need to manage multiple frameworks and keeps the application easier to deploy.
- Database: PostgreSQL
  - Reason: reliable relational data model suitable for courses, assignments, sessions, and user accounts.
- ORM: Prisma
  - Reason: provides type-safe database access and simplifies schema management.
- Authentication: Auth.js / NextAuth
  - Reason: straightforward integration for session-based authentication and secure login flows.
- Styling: Tailwind CSS
  - Reason: allows rapid and consistent UI development without excessive custom CSS.
- State Management: React Query / TanStack Query for server state
  - Reason: simplifies fetching, caching, and updating data from the API.
- Testing: Vitest, React Testing Library, and Playwright
  - Reason: supports unit, integration, and end-to-end testing with a modern toolchain.
- Version Control and CI: GitHub + GitHub Actions
  - Reason: suitable for managing a solo project and automating validation checks.

### 3.2 Architectural Style
The application is designed using a layered architecture with clear separation of concerns.

#### Presentation Layer
- Responsible for rendering the user interface.
- Built using React components and pages.
- Handles forms, navigation, and user interaction.

#### Application Layer
- Contains business logic for workflows such as creating assignments, marking tasks complete, and generating study summaries.
- Keeps the UI focused on presentation while business rules remain testable.

#### Data Access Layer
- Responsible for interacting with the PostgreSQL database through Prisma.
- Encapsulates database queries and schema operations.

### 3.3 Architectural Patterns Used
- Component-Based Architecture
  - The UI is built from reusable components such as forms, cards, dashboards, and task lists.
  - This reduces duplication and improves maintainability.
- Layered Architecture
  - Separates presentation, logic, and data access concerns.
  - Makes the system easier to extend as new features are added.
- Service Layer Pattern
  - Core operations such as assignment creation, study session logging, and progress calculations are handled in dedicated service modules.
  - This improves testability and keeps the controllers or page handlers simple.
- RESTful API Design
  - API routes follow a clear resource-based structure for users, courses, assignments, and study sessions.
  - This makes the backend easier to understand and maintain.

### 3.4 Data Model Design
The system uses a relational model with the following main entities:
- User
  - Stores authentication and profile information.
- Course
  - Represents a class or subject the user is studying.
- Assignment
  - Stores task details such as title, due date, course, and completion status.
- StudySession
  - Records completed study activity including date and duration.
- StudyPlan
  - Optional structure for weekly or daily study planning.

This relational design is appropriate because the data naturally connects through user, course, and assignment relationships.

### 3.5 Security Considerations
- Passwords are handled through secure authentication practices.
- Authentication sessions are managed using server-side session handling.
- Sensitive user data is not exposed through unsafe routes.
- Input validation is applied to forms and API requests to reduce injection and malformed data issues.

## 4. Deployment Strategy
### Recommended Deployment Option
The recommended deployment approach is a cloud-hosted setup using:
- Vercel for the frontend and API deployment
- Neon or Supabase for PostgreSQL hosting
- GitHub Actions for automated checks and deployment pipelines

### Why This Choice Is Recommended
- Low operational overhead for a solo developer.
- Quick deployment and simple scaling.
- Good integration with Next.js and GitHub.
- Suitable for a capstone demonstration and future extension.

### Cost Implications
- Vercel: low-cost for small projects, with free tiers available for development and light production use.
- PostgreSQL hosting: low to moderate cost depending on usage and database size.
- Total expected cost: very low for the MVP, especially if using free tiers during development.

### Alternative Deployment Options
- On-premises deployment: not recommended for this project because it adds setup complexity and maintenance cost without adding significant academic value.
- Traditional VPS hosting: possible but less convenient for a solo capstone due to server management overhead.

## 5. Software Testing Strategy
Testing is an important part of the project because it ensures the app remains reliable as features are added. The testing strategy for StudyFlow is divided into automated and manual testing.

### 5.1 Testing Objectives
- Verify that core user flows work correctly.
- Ensure that assignment management and study tracking features behave as expected.
- Detect regressions when new features are introduced.
- Improve confidence in the implementation before presentation or deployment.

### 5.2 Automated Testing Plan

#### Unit Tests
Unit tests will be used for small, isolated logic such as:
- date formatting and due date calculations
- validation rules for assignment creation
- progress calculations for study streaks or completed tasks
- helper functions used in the UI

Tools:
- Vitest
- React Testing Library for UI-related utility testing

Reason:
- Fast to run and suitable for validating logic in isolation.

#### Integration Tests
Integration tests will be used to verify that components and routes work together correctly, including:
- user registration and login flows
- creating, reading, updating, and deleting assignments
- adding study sessions and updating summaries
- filtering tasks by course or date

Tools:
- Vitest with API and component integration support
- Supertest for API route testing if needed

Reason:
- Ensures that the main feature flows work end-to-end at the application boundary.

#### End-to-End Tests
End-to-end tests will cover key user journeys such as:
- signing up and logging in
- creating a course
- adding an assignment
- marking an assignment complete
- logging a study session
- viewing the dashboard and progress history

Tools:
- Playwright

Reason:
- Provides confidence that the system works from the user’s perspective.

### 5.3 Manual Testing
Manual testing will also be performed during development to validate:
- page layout and navigation
- responsive behaviour on mobile and desktop
- usability issues not caught by automated tests
- form validation and error handling

This is particularly important for a solo project because it helps identify interface improvements that automated tests may miss.

### 5.4 Static Quality Checks
The following checks will be included as part of the development workflow:
- Type checking
- Linting
- Formatting checks

Tools:
- TypeScript compiler
- ESLint
- Prettier

Reason:
- These help maintain code quality and reduce avoidable bugs early in development.

### 5.5 CI/CD Testing Workflow
A simple continuous integration workflow should be established:
1. Run linting and type checks.
2. Run unit and integration tests.
3. Run end-to-end tests for critical flows.
4. Block deployment if tests fail.

This ensures that new changes do not introduce regressions before the project is presented or deployed.

## 6. Testing Coverage Summary
The testing approach for StudyFlow will prioritise the following high-value areas:
- authentication
- assignment lifecycle
- study session logging
- progress summary calculations
- task filtering and sorting
- dashboard usability and responsiveness

These are the most important flows because they represent the core value of the application.

## 7. Conclusion
The proposed design for StudyFlow balances simplicity, maintainability, and modern development practices. The architecture is appropriate for a solo capstone because it is practical to build, straightforward to test, and suitable for cloud deployment. The testing strategy combines automated and manual validation to improve reliability and provide a strong foundation for the final project demonstration.
