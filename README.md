# Team Task Manager (RBAC)

Production-ready full-stack Team Task Manager with JWT auth, role-based access (Admin/Member), project and task workflows, overdue tracking, and Railway deployment setup.

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, Axios, React Router, Context API
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, express-validator
- Database: MongoDB

## Folder Structure

```text
project-01/
  backend/
    src/
      config/
        db.js
      controllers/
        authController.js
        projectController.js
        taskController.js
        userController.js
      middleware/
        authMiddleware.js
        roleMiddleware.js
        validate.js
        errorMiddleware.js
      models/
        User.js
        Project.js
        Task.js
      routes/
        authRoutes.js
        projectRoutes.js
        taskRoutes.js
        userRoutes.js
      utils/
        AppError.js
        token.js
      validators/
        index.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      api/
        client.js
      components/
        Navbar.jsx
        ProtectedRoute.jsx
        LoadingSpinner.jsx
        ErrorAlert.jsx
        StatsCard.jsx
      context/
        AuthContext.jsx
      pages/
        LoginPage.jsx
        RegisterPage.jsx
        DashboardPage.jsx
        ProjectsPage.jsx
        TasksPage.jsx
      App.jsx
      main.jsx
      index.css
    .env.example
    package.json
  .gitignore
  README.md
```

## Backend Setup (Step-by-Step)

1. Go to backend:
   - `cd backend`
2. Install dependencies:
   - `npm install`
3. Configure env:
   - Copy `.env.example` to `.env`
4. Start dev server:
   - `npm run dev`

### Backend Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_ACCESS_SECRET=change_this_access_secret
JWT_REFRESH_SECRET=change_this_refresh_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

## Frontend Setup (Step-by-Step)

1. Go to frontend:
   - `cd frontend`
2. Install dependencies:
   - `npm install`
3. Configure env:
   - Copy `.env.example` to `.env`
4. Start dev server:
   - `npm run dev`

### Frontend Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login and receive access/refresh tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - List projects (admin: all, member: own/team)
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `DELETE /api/projects/:id` - Delete project (admin)
- `PATCH /api/projects/:id/members` - Add/remove team members (admin)

### Tasks
- `GET /api/tasks` - List tasks with filters (`projectId`, `assignedTo`, `status`)
- `GET /api/tasks/dashboard/stats` - Dashboard totals/completed/overdue
- `POST /api/tasks` - Create task (admin)
- `PUT /api/tasks/:id` - Update task details (admin)
- `PATCH /api/tasks/:id/status` - Update status (admin/member assigned user)
- `DELETE /api/tasks/:id` - Delete task (admin)

### Users
- `GET /api/users` - List users (for assignment/member management)

## Role-Based Access

- `admin`
  - Create/update/delete projects
  - Add/remove project members
  - Create/update/delete/assign tasks
- `member`
  - View assigned tasks
  - Update own task status
  - View relevant projects and dashboard stats

## Validation and Security

- Password hashing: `bcryptjs`
- JWT auth:
  - Access token for API auth
  - Refresh token for renewing sessions
- Middleware:
  - `protect` for authentication
  - `authorize` for role checks
  - `validate` for express-validator rules
- Centralized error handling middleware
- CORS configured by `CLIENT_URL`

## Dashboard and Overdue Logic

Dashboard endpoint computes:
- `totalTasks`
- `completedTasks`
- `overdueTasks` (tasks where `dueDate < now` and status is not `done`)

Frontend task page also highlights overdue tasks.

## Railway Deployment

Use two Railway services (recommended).

### 1) Backend Service
1. Create new Railway project and connect this repo.
2. Set root directory to `backend`.
3. Add env vars from backend `.env`.
4. Start command: `npm start`.
5. Deploy and copy backend public URL.

### 2) Frontend Service
1. Create second service in the same Railway project.
2. Set root directory to `frontend`.
3. Add env var:
   - `VITE_API_URL=<your-backend-url>/api`
4. Build command: `npm run build`
5. Start command: `npm run preview -- --host 0.0.0.0 --port $PORT`
6. Deploy.

## Production Notes

- Restrict signup role assignment in production if only admins should create admin users.
- Consider rotating refresh tokens + storing refresh tokens as secure httpOnly cookies for stronger security.
- Add tests (unit + integration) and optional seed scripts.

