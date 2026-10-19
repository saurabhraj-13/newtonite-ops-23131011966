# Newtonite Operations Center

A full-stack operations management application for creating, assigning, tracking, and resolving work items. Built with React, Express.js, Prisma ORM, and PostgreSQL.

## Features

- **Work Item Management:** Create, view, edit, and delete work items.
- **Team Assignment:** Claim unassigned work items and track ownership.
- **Priority Management:** Organize work by Low, Medium, High, and Critical priority.
- **Workflow Management:** Track work through Open, In Progress, Awaiting Approval, Resolved, and Closed.
- **Approval Workflow:** Restrict approval actions according to user roles.
- **Activity History:** Track work item changes and actions.
- **Comments and Updates:** Add investigation notes to work items.
- **Search and Filters:** Find work items by keyword, status, priority, assignee, and team.
- **Dashboard Statistics:** View operational counts calculated from the database.
- **Role-Based Access:** Support Viewer, Member, Lead, and Admin roles.

## Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JSON Web Tokens (JWT)

## Prerequisites

Install the following before running the application:

- Node.js (LTS version recommended)
- npm (included with Node.js)
- PostgreSQL
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/saurabhraj-13/newtonite-ops-23SCSE1012732.git
cd newtonite-ops-23SCSE1012732
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server/` directory by copying `.env.example`.

On Windows Command Prompt:

```cmd
copy .env.example .env
```

Update `server/.env` with your local PostgreSQL database credentials:

```env
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/newtonite_ops?schema=public"
JWT_SECRET="REPLACE_WITH_A_LONG_RANDOM_SECRET"
PORT=5000
CLIENT_ORIGIN="http://localhost:5173"
```

Replace the database username, password, and JWT secret with your own values. Never commit your `.env` file to GitHub.

### 5. Create the PostgreSQL database

Create a PostgreSQL database named `newtonite_ops` using pgAdmin or the PostgreSQL command line.

Make sure the database exists and the connection string in `server/.env` matches your local configuration.

### 6. Generate Prisma Client and create tables

From the `server/` directory, run:

```bash
npx prisma generate
npx prisma db push
```

If the project includes a seed script, load the initial demo data using the command configured in `server/package.json`. For example, if it defines a seed script:

```bash
npm run seed
```

### 7. Start the backend

From the `server/` directory:

```bash
npm start
```

The backend should run at:

```text
http://localhost:5000
```

Check the health endpoint:

```text
http://localhost:5000/api/health
```

### 8. Start the frontend

Open a **second terminal** in the project root directory:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

Keep both the frontend and backend terminals running while using the application.

## Project Structure

```text
newtonite-ops-23SCSE1012732/
├── src/
│   ├── main.jsx
│   └── styles.css
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── index.html
├── package.json
├── .gitignore
└── README.md
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL database connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `PORT` | Backend server port |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS |

## Testing

Check the following before using the application:

- The backend health endpoint reports a successful database connection.
- Users can authenticate with valid credentials.
- New work items remain available after refreshing the page.
- Claiming an item updates its assignee.
- Status transitions follow the configured workflow.
- Comments and activity history persist in PostgreSQL.
- Unauthorized operations are rejected by the backend.

## Engineering Decisions

See [ENGINEERING_DECISIONS.md](ENGINEERING_DECISIONS.md) for the key architectural choices, alternatives considered, trade-offs, and implementation limitations.

## Security Notes

- Never commit `.env`, database passwords, JWT secrets, or real credentials.
- Use `.env.example` to document required configuration without exposing secrets.
- Backend endpoints must enforce authorization; hiding a frontend button is not sufficient.
- Use a strong, unique JWT secret for each deployment.

## Current Limitations

Document any incomplete features, known bugs, or limitations in the repository before submitting or deploying the application.

## Author

**Saurabh Raj**

GitHub: [saurabhraj-13](https://github.com/saurabhraj-13)

## License

This project was developed as a software engineering challenge. Add a license if you intend to distribute or reuse the project publicly.
