# 🎓 University Management System

<div align="center">

### A Full-Stack MERN Application for Managing University Operations

Manage Students • Professors • Courses • Attendance • Study Materials • Academic Records

![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?style=for-the-badge\&logo=mongodb)
![Express](https://img.shields.io/badge/Express.js-4.x-black?style=for-the-badge\&logo=express)
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge\&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge\&logo=node.js)
![Vite](https://img.shields.io/badge/Vite-6.x-purple?style=for-the-badge\&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge\&logo=tailwindcss)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange?style=for-the-badge)

</div>

---

## 📖 Overview

The **University Management System** is a role-based web application designed to streamline academic and administrative operations within a university.

The platform provides dedicated dashboards for:

* 👨‍💼 Admin
* 👨‍🏫 Professor
* 👨‍🎓 Student

The system simplifies user management, course management, attendance tracking, study material sharing, and result management through a centralized platform.

---

## ✨ Key Features

### 👨‍💼 Admin Panel

* Secure Authentication
* Manage Students
* Manage Professors
* Manage Courses
* Assign Professors to Courses
* Publish Notices
* Monitor Academic Activities

### 👨‍🏫 Professor Panel

* Secure Login
* View Assigned Subjects
* Upload Notes & Study Materials
* Manage Student Attendance
* Enter Marks & Results
* Apply for Leave

### 👨‍🎓 Student Panel

* Registration & Login
* View Enrolled Courses
* Check Attendance
* Access Study Materials
* View Results & Marks
* Apply for Leave

---

## 🏗️ System Architecture

```text
Frontend (React + Vite)
          │
          ▼
Backend (Node.js + Express.js)
          │
          ▼
Database (MongoDB Atlas)
```

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose ODM

### Authentication

* JWT Authentication
* Role-Based Authorization

### Deployment

* Vercel (Frontend)
* Render (Backend)

### Version Control

* Git
* GitHub

---

## 📂 Project Structure

```text
University-Management-System/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── scripts/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## 📚 Core Modules

* Authentication & Authorization
* Student Management
* Professor Management
* Course Management
* Attendance Management
* Result Management
* Leave Management
* Notice Management
* Study Material Upload
* Dashboard Analytics

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/baraiyash/University-Management-System.git
cd University-Management-System
```

### Install Backend Dependencies

```bash
cd backend
npm install
```

### Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Configure Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

---

## ▶️ Run Backend

```bash
cd backend
npm run dev
```

---

## ▶️ Run Frontend

```bash
cd frontend
npm run dev
```

---

## 🌐 Application URL

```text
http://localhost:5173
```

---

## 🔐 User Roles & Permissions

| Role      | Permissions                                           |
| --------- | ----------------------------------------------------- |
| Admin     | Manage students, professors, courses, notices, leaves |
| Professor | Manage attendance, materials, leaves, marks           |
| Student   | View attendance, materials, profile, notices, results |

---

## 🚀 Future Enhancements

* Fee Management System
* Timetable Scheduling
* Email Notifications
* Video Lecture Integration
* Online Examination System
* AI-Based Student Performance Analysis

---

## 🧠 Learning Outcomes

Through this project, I gained practical experience in:

* Full-Stack MERN Development
* RESTful API Design
* JWT Authentication
* Protected Routes
* MongoDB Schema Design
* File Upload Handling
* Role-Based Access Control
* Deployment Workflows

---

## 📸 Screenshots

Add screenshots of:

* Login Page
* Admin Dashboard
* Professor Dashboard
* Student Dashboard
* Course Management
* Attendance Management

---

## 👨‍💻 Author

**Yash Barai**

* GitHub: https://github.com/baraiyash

---

## ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

---

## 📜 License

This project is developed for educational and learning purposes.
