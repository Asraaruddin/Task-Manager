# 🚀 Task Manager Application (MERN + JWT + Tailwind + Vite)

A full-stack **Task Management Application** built using the **MERN stack** with real-time UI updates, priority-based task handling, authentication using JWT, clean dashboard experience, and a modern React + Vite frontend.

This project allows users to register, log in, create tasks, update tasks, mark tasks as completed, filter tasks by priority/date, and manage their personal to-do list with ease.

---

## 📌 Features

### 🔐 Authentication
- Secure user login & registration (JWT)
- Password hashing with bcrypt
- Protected backend routes

### 📝 Task Management
- Add tasks with title, description, priority, and date
- Edit tasks with instant UI update
- Delete tasks
- Mark tasks as completed / uncompleted
- Filter tasks by priority (High / Low)
- Search tasks by title
- Sort tasks by created date
- Real-time UI updates without refresh

### 🎨 UI/UX
- Modern dashboard with Vite + React
- Tailwind CSS styling
- Responsive layout
- Smooth animations and professional design
- Welcome message: **"Welcome back, {UserName}"**

---

## 🛠️ Tech Stack

### **Frontend**
- React (Vite)
- Tailwind CSS
- React Icons
- Axios
- React Toastify
- React Router

### **Backend**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- CORS enabled

---

## 📁 Project Folder Structure

```
Task-Manager/
│
├── backend/
│   ├── controllers/
│   │   └── taskController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Task.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── taskRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md
```

---

## ⚙️ Backend Setup

### Install dependencies:
```bash
cd backend
npm install
```

### Create `.env` file:
```
MONGO_URI=your-mongodb-url
JWT_SECRET=your-secret-key
PORT=5000
```

### Start the backend:
```bash
npm start
```

---

## 💻 Frontend Setup

### Install dependencies:
```bash
cd frontend
npm install
```

### Start frontend:
```bash
npm run dev
```

---

## 🔗 Connecting Frontend with Backend

In `frontend/src/api/api.js` update:

```js
export default axios.create({
  baseURL: "http://localhost:5000/api",
});
```

When deployed to Render/Vercel — change baseURL accordingly.

---

## 📡 API Endpoints

### **Auth Routes**
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### **Task Routes**
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/tasks` | Fetch all user tasks |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## 🚀 Deployment Guide

### Frontend (Vercel)
```
npm run build
```
Deploy the **dist** folder to Vercel.

### Backend (Render / Railway)
Add environment variables from `.env`.

---

## 👨‍💻 Author

**Asrar Uddin**  
Front-End / MERN Developer  
Passionate about building real-world applications with clean UI and optimized code.

---

## ⭐ Support

If you like this project, please ⭐ star the repo!

---

