# SYNAR Frontend

React + Vite frontend for SYNAR, a UV risk and personalized sun exposure guidance app.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Leaflet / React Leaflet

## Getting Started

```bash
npm install
npm run dev
```

The app expects the backend API at `http://localhost:3000/api` by default.
Set `VITE_API_URL` to override it.

```env
VITE_API_URL=http://localhost:3000/api
```

## Scripts

```bash
npm run dev
npm run build
npx tsc --noEmit
```
