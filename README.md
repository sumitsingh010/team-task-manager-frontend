# Team Task Manager — Frontend

A modern, responsive dashboard built with **React.js** and **Tailwind CSS** for managing team projects and tasks with role-based access control.

## 🚀 Live Demo

- **Frontend**: [https://team-task-manager-frontend-seven.vercel.app](https://team-task-manager-frontend-seven.vercel.app)
- **Backend API**: [https://team-task-manager-backend-l5zf.onrender.com](https://team-task-manager-backend-l5zf.onrender.com)

## 🛠 Tech Stack

- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS v3
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📋 Features

### Authentication
- Login / Signup with JWT
- First signup automatically becomes Admin
- Protected routes with auth context

### Dashboard
- Task statistics (Total, Completed, Overdue)
- Task status breakdown with progress bars
- Recent tasks with inline status updates
- Overdue task highlighting

### Project Management (Admin)
- Create / Edit / Delete projects
- Add and remove team members
- View project progress

### Task Management
- Create tasks with title, description, priority, due date
- Assign tasks to team members
- Update task status (To Do → In Progress → Completed)
- Filter by status, priority, project, and overdue
- Search tasks by keyword

### Role-Based Access
- **Admin**: Full CRUD on projects and tasks
- **Member**: View assigned projects/tasks, update own task status

## 🏗 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsCard.jsx
│   │   └── TaskCard.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── Projects.jsx
│   │   ├── Signup.jsx
│   │   └── Tasks.jsx
│   ├── utils/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── tailwind.config.js
└── package.json
```

## ⚙️ Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `https://your-backend.onrender.com/api`) |

## 🚀 Deployment

- **Frontend**: Deployed on [Vercel](https://vercel.com)
- **Backend**: Deployed on [Render](https://render.com)
- **Database**: MongoDB Atlas (Free Tier)
