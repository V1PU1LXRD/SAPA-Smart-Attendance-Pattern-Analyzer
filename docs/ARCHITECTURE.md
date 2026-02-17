# 🏗️ System Architecture

## Overview

SAPA follows a **3-tier architecture** with clear separation of concerns.

┌─────────────────────────────────────────────────┐
│                   CLIENT (React)                │
│  Vite + React 18 + Tailwind CSS + Framer Motion │
│         Components → Context → API Layer        │
└──────────────────────┬──────────────────────────┘
│ HTTP/REST
▼
┌─────────────────────────────────────────────────┐
│                 SERVER (Express.js)             │
│   Routes → Controllers → Analytics Engine       │
│          JWT Auth Middleware                    │
└──────────────────────┬──────────────────────────┘
│ Mongoose ODM
▼
┌─────────────────────────────────────────────────┐
│              DATABASE (MongoDB Atlas)           │
│    Users │ Attendance │ Notifications │ Reports │
└─────────────────────────────────────────────────┘

## Frontend Architecture

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (utility-first)
- **Animations:** Framer Motion
- **State:** React Context API
- **Charts:** Recharts
- **HTTP:** Axios

## Backend Architecture

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + bcrypt + OTP (Nodemailer)
- **File Processing:** XLSX library
- **Analytics:** Custom linear regression engine

## Key Design Decisions

1. **Linear Regression for Predictions** — Simple, interpretable, effective for
   trending attendance data with limited data points.
2. **Risk Scoring (0-100)** — Weighted composite of average attendance, at-risk
   ratio, and critical ratio for actionable insights.
3. **Split Auth Flow** — Register → OTP Verify → Login ensures email ownership.