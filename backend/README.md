# SYNAR Backend API

Express API for SYNAR, covering authentication, UV/weather data, prediction proxying, and user history.

## Tech Stack

- Node.js
- Express 5
- Firebase Firestore
- JWT authentication
- Open-Meteo and OpenStreetMap integrations

## Getting Started

```bash
npm install
npm run dev
```

For production:

```bash
npm start
```

## Environment Variables

Create a local `.env` file for development. On Render/Railway, add the same keys in the service environment settings.

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | API port. Defaults to `3000`. |
| `JWT_SECRET` | Yes | Secret used to sign JWTs. |
| `JWT_EXPIRES_IN` | No | Token lifetime. Defaults to `30d`. |
| `FIREBASE_SERVICE_ACCOUNT` | Yes | Firebase service account JSON as a single-line string. |
| `AI_SERVICE_URL` | Yes | ML service prediction endpoint, for example `http://127.0.0.1:5000/predict` locally. |
| `FRONTEND_URL` | No | Frontend URL used in reset-password links. Defaults to `http://localhost:5173`. |
| `SMTP_HOST` | No | SMTP host for password reset emails. |
| `SMTP_PORT` | No | SMTP port for password reset emails. |
| `SMTP_SECURE` | No | Use TLS for SMTP. Set to `true` or `false`. |
| `SMTP_USER` | No | SMTP username. |
| `SMTP_PASS` | No | SMTP password. |
| `SMTP_FROM` | No | Sender email. Defaults to `SMTP_USER`. |

React does not send reset emails directly. The frontend calls `/api/auth/forgot-password`, then the backend sends the email using SMTP so email credentials stay private.

For deployment:

- Set `FRONTEND_URL` to the deployed frontend URL, for example `https://synar.vercel.app`.
- Set `AI_SERVICE_URL` to the deployed ML API prediction endpoint.
- Set `SMTP_*` values from an email provider if password reset must send real emails.
- Set `VITE_API_URL` in the frontend deployment to the deployed backend API URL, for example `https://synar-api.onrender.com/api`.

## Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check. |
| `POST` | `/api/auth/register` | No | Register a user. |
| `POST` | `/api/auth/login` | No | Login and receive a JWT. |
| `POST` | `/api/auth/forgot-password` | No | Request a password reset email. |
| `POST` | `/api/auth/reset-password` | No | Reset password using a reset token. |
| `GET` | `/api/auth/me` | Yes | Get the current user profile. |
| `PUT` | `/api/auth/me` | Yes | Update the current user profile. |
| `DELETE` | `/api/auth/me` | Yes | Delete the current user and owned history records. |
| `GET` | `/api/weather/realtime?lat=&lon=` | No | Get realtime weather and UV data. |
| `GET` | `/api/weather/geocode/search?q=` | No | Search locations. |
| `GET` | `/api/weather/geocode/reverse?lat=&lon=` | No | Resolve coordinates into a display location. |
| `POST` | `/api/predict` | No | Proxy prediction request to the ML service. |
| `POST` | `/api/history` | Yes | Save a UV check result. |
| `GET` | `/api/history/:userId` | Yes | Get the authenticated user's history. |
| `DELETE` | `/api/history/:historyId` | Yes | Delete a history record. |

## Response Format

Successful responses:

```json
{
  "error": false,
  "data": {}
}
```

Error responses:

```json
{
  "error": true,
  "message": "Error description"
}
```

## API Contract and Schema

- API contract: `../docs/api_contract.md`
- Firestore schema: `../docs/database_schema.md`
