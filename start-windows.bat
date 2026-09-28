@echo off
echo Starting Library Management System...
start "Backend" cmd /k "cd backend && npm install && if not exist .env copy .env.example .env && npm run seed && npm run dev"
start "Frontend" cmd /k "cd frontend && npm install && if not exist .env copy .env.example .env && npm run dev"
echo Two terminal windows will open.
