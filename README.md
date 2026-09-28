# Library Management System — MERN

A complete college-project-ready Library Management System built with MongoDB, Express.js, React.js and Node.js.

## Features
- JWT authentication
- Student and Admin roles
- Student registration/login
- Admin dashboard
- Add/edit/delete books
- Search and filter books
- Issue/borrow books
- Return books
- Automatic late-fine calculation
- Student borrowing history
- Admin transaction management
- Responsive React UI

## Requirements
- Node.js 18+
- MongoDB local installation OR MongoDB Atlas
- npm

## 1. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/library_management
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
FINE_PER_DAY=5
```

Then:

```bash
npm run dev
```

Backend: http://localhost:5000

## 2. Frontend setup

Open another terminal:

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173

## Default admin

Create an admin account using the register API or MongoDB. The easiest method is to register a normal user and change its `role` to `admin` in MongoDB.

A seed script is also included:

```bash
cd backend
npm run seed
```

Seed admin:
- Email: admin@library.com
- Password: Admin@123

## API overview

Auth:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Books:
- GET /api/books
- GET /api/books/:id
- POST /api/books
- PUT /api/books/:id
- DELETE /api/books/:id

Transactions:
- POST /api/transactions/issue
- GET /api/transactions
- GET /api/transactions/my
- PUT /api/transactions/:id/return

## Project structure

```text
library-management-system/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```
