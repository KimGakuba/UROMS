# UROMS Backend

Express + SQLite REST API

## Setup
```bash
cd backend
npm install
npm run dev      # development (nodemon)
npm start        # production
```

Runs on **http://localhost:3001**

## Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register |
| GET | /api/stats | Dashboard stats |
| GET/POST | /api/rooms | Rooms |
| GET/POST | /api/bookings | Room bookings |
| PUT | /api/bookings/:id/status | Approve/Reject booking |
| GET/POST | /api/lecturers | Lecturers |
| POST | /api/lecturers/:id/workload | Assign workload |
| GET/POST | /api/equipment | Equipment |
| GET/POST | /api/equipment-bookings | Equipment bookings |
| GET/POST | /api/events | Events |
| POST | /api/events/:id/register | Register for event |
| GET/POST | /api/accreditation | Reports |
| PUT | /api/accreditation/:id/submit | Submit report |
| GET/POST | /api/users | Users |
| GET/POST | /api/lab-sessions | Lab sessions |

## Demo credentials
- admin@uroms.ac / admin123
- sarah@uroms.ac / pass123
