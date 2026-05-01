# SYNAR Backend API

REST API backend for **SYNAR** (System for UV & Sun Exposure Analysis and Recommendation), built with **Express.js**, **Firebase Firestore**, and **JWT Authentication**.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js v5
- **Database**: Firebase Firestore
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Security**: Helmet, CORS
- **Weather Data**: Open-Meteo API (free, no key required)

## Project Structure

```
backend/
├── config/
│   └── firebase.js              # Firebase Admin SDK initialization
├── controllers/
│   ├── authController.js        # Register & login logic
│   ├── weatherController.js     # Real-time weather data
│   ├── predictController.js     # AI prediction proxy
│   ├── historyController.js     # Prediction history CRUD
│   └── testController.js        # Test/debug endpoints
├── middlewares/
│   └── authMiddleware.js        # JWT token verification
├── models/
│   ├── User.js                  # Firestore users collection
│   └── History.js               # Firestore history collection
├── routes/
│   ├── authRoutes.js            # /api/auth routes
│   ├── weatherRoutes.js         # /weather routes
│   ├── predictRoutes.js         # /predict routes
│   ├── historyRoutes.js         # /history routes
│   └── testRoutes.js            # /api/test routes (dev only)
├── utils/
│   ├── AppError.js              # Custom error class with status codes
│   ├── asyncHandler.js          # Async wrapper for controllers
│   ├── responseHelper.js        # Standardized JSON response format
│   └── validators.js            # Input validation utilities
├── .env                         # Environment variables (not in git)
├── .env.example                 # Template for environment variables
├── .gitignore
├── package.json
├── README.md
└── server.js                    # Application entry point
```

## Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
cd backend
npm install
```

### 2. Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 3000) | No |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | **Yes** |
| `FIREBASE_SERVICE_ACCOUNT` | Full JSON of Firebase service account key (single line) | **Yes** |
| `AI_SERVICE_URL` | FastAPI URL from AI team for prediction proxy | No |

### 3. Run

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Check if API is running |

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT token |

### Weather

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/weather/realtime?lat=&lon=` | ❌ | Get real-time weather + UV data |

### Prediction (AI Proxy)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/predict` | ❌ | Proxy prediction request to AI service |

### History

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/history` | ✅ | Save prediction result to history |
| GET | `/history/:userId` | ✅ | Get prediction history for a user |

### Test (Development Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/test` | ❌ | Simple server test |
| GET | `/api/test/db` | ❌ | Test Firestore connectivity |
| GET | `/api/test/protected` | ✅ | Test JWT-protected route |

## Response Format

All responses follow the SYNAR API contract:

### Success

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Authentication

Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Tokens expire after **1 hour**.

## Database Schema (Firestore)

### `users` Collection
| Field | Type | Description |
|-------|------|-------------|
| email | string | User email (unique, lowercase) |
| password | string | Bcrypt hashed password |
| createdAt | timestamp | Registration date |

### `history` Collection
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Reference to user document ID |
| skin_type | number | Fitzpatrick skin type (1-6) |
| uv_index | number | UV index at time of prediction |
| temperature | number | Temperature (°C) |
| humidity | number | Humidity (%) |
| cloud_cover | number | Cloud coverage (%) |
| wind_speed | number | Wind speed (m/s) |
| recommended_duration | string | Recommended sun exposure duration |
| risk_level | string | UV risk level |
| recommendation | string | Safety recommendation text |
| createdAt | timestamp | Prediction date |
