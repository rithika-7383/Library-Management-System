#!/bin/sh
cd backend && npm install && cp -n .env.example .env && npm run seed && npm run dev &
cd ../frontend && npm install && cp -n .env.example .env && npm run dev
