# Cake Order App

Cross-platform cake shop order manager with a React + Electron frontend and Python backend.

## Project Structure

```
cake-order-app/
├── frontend/   # React + Vite + Electron (Mac desktop + responsive web UI)
└── backend/    # Python API (coming next)
```

## Frontend (run locally)

### Browser only (fastest for UI development)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5174

### Electron desktop app (Mac)

```bash
cd frontend
npm install
npm run electron:dev
```

## Cake Order Form

### Mandatory fields
- Customer name
- Flavor (Black Forest, Strawberry, Mango, Custom)
- Size (1 lb, 2 lb, 4 lb, 6 lb, 8 lb)
- Pick up date (calendar)
- Pick up time (clock picker)
- Total
- Advance paid
- Pending (auto-calculated)

### Optional fields
- Greetings
- Reference image upload
- Modifications

## Platform notes

- **Mac desktop**: Use `npm run electron:dev` in `frontend/`.
- **iPhone / iOS**: Electron does not run on iOS. The React UI is responsive and can be served as a web/PWA app, or wrapped later with Capacitor for a native iOS build once the Python backend is ready.

## Backend

The Python backend stub lives in `backend/`. API integration will connect the form to persistent storage in a follow-up step.
