# 📡 API Reference

**Base URL:** `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## 🔐 Authentication

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | `/auth/register`      | Register new faculty | No   |
| POST   | `/auth/verify-otp`    | Verify email OTP     | No   |
| POST   | `/auth/resend-otp`    | Resend OTP           | No   |
| POST   | `/auth/login`         | Login                | No   |
| PUT    | `/auth/update-profile`| Update profile       | Yes  |
| PUT    | `/auth/change-pin`    | Change security PIN  | Yes  |

## 📊 Attendance

| Method | Endpoint                  | Description           | Auth |
|--------|---------------------------|-----------------------|------|
| GET    | `/attendance/template`    | Download .xlsx template | Yes |
| POST   | `/attendance/upload`      | Upload & analyze sheet | Yes |
| GET    | `/attendance`             | Get all records        | Yes |
| GET    | `/attendance/:id`         | Get single record      | Yes |
| DELETE | `/attendance/:id`         | Delete record          | Yes |

## 📈 Analytics

| Method | Endpoint                       | Description              | Auth |
|--------|--------------------------------|--------------------------|------|
| GET    | `/analytics/dashboard`         | Dashboard summary        | Yes  |
| GET    | `/analytics/subject/:subject`  | Subject-level analytics  | Yes  |
| GET    | `/analytics/student/:rollNo`   | Student-level analytics  | Yes  |

## 🔔 Admin

| Method | Endpoint                             | Description           | Auth |
|--------|--------------------------------------|-----------------------|------|
| GET    | `/admin/notifications`               | Get all notifications | Yes  |
| PUT    | `/admin/notifications/:id/read`      | Mark as read          | Yes  |
| PUT    | `/admin/notifications/read-all`      | Mark all read         | Yes  |
| GET    | `/admin/reports`                     | Get all reports       | Yes  |
| POST   | `/admin/reports`                     | Create report         | Yes  |
| PUT    | `/admin/reports/:id`                 | Update report         | Yes  |
| DELETE | `/admin/reports/:id`                 | Delete report         | Yes  |