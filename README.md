# 🎓 University Management System

<div align="center">

### A Role-Based MERN Stack Web Application for Streamlining University Operations

Manage Students • Faculty • Courses • Attendance • Study Materials • Academic Records

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

The system simplifies user management, course management, attendance tracking, study material sharing, result management, and notice handling through a centralized platform.

---

## ✨ Features

### 👨‍💼 Admin Module

* Secure Admin Authentication
* Manage Students
* Manage Professors
* Manage Courses and Subjects
* Assign Professors to Courses
* Manage Notices
* Approve or Reject Leave Requests
* Monitor Academic Activities

### 👨‍🏫 Professor Module

* Secure Authentication
* View Assigned Courses
* Upload Notes and Study Materials
* Manage Student Attendance
* Enter Marks and Results
* Apply for Leave
* View Notices

### 👨‍🎓 Student Module

* Registration and Login
* View Enrolled Courses
* Check Attendance Records
* View Marks and Results
* Download Study Materials
* Apply for Leave
* View Notices

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
│   ├── vite.config.js
│   └── vercel.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── scripts/
│   ├── seed.js
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

## ⚙️ Installation

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/baraiyash/University-Management-System.git
cd University-Management-System
```

### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4️⃣ Configure Environment Variables

Create a `.env` file inside the `backend/` directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 5️⃣ Seed Demo Data (Optional)

```bash
cd backend
node seed.js
```

### 6️⃣ Run Backend Server

```bash
npm run dev
```

### 7️⃣ Run Frontend

```bash
cd ../frontend
npm run dev
```

### 8️⃣ Open in Browser

```text
http://localhost:5173
```

---

## 🔐 User Roles

| Role      | Access                                                                     |
| --------- | -------------------------------------------------------------------------- |
| Admin     | Manage users (Professors, Students), courses, subjects, notices and leaves |
| Professor | Manage attendance, materials, leaves, marks and view notices               |
| Student   | View attendance, materials, profile, notices and results                   |

---

## 🚀 Future Enhancements

* Fee Management System
* Timetable Scheduling
* Email Notifications
* Video Lecture Integration
* Online Examination System
* AI-Based Student Performance Analysis

---

## 🧠 Project Highlights

Through the development of this project, I gained hands-on experience in:

* Full-Stack MERN Stack Development
* RESTful API Design and Development
* JWT Authentication & Authorization
* Protected Routes and Middleware
* Role-Based Access Control (RBAC)
* MongoDB Database Design and Schema Modeling
* State Management in React
* Frontend Development using React and Tailwind CSS
* File Upload Handling and Validation
* API Integration using Axios
* Git and GitHub Version Control
* Deployment using Vercel and Render
* Debugging and Performance Optimization

---

## 👨‍💻 Author

**Yash Barai**

* GitHub: https://github.com/baraiyash

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

## 📜 License

This project is developed for educational and learning purposes.
