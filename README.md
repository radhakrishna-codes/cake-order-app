# Cake Order App

Cross-platform cake shop order manager with a React + Electron frontend.

The Python API lives in a separate repo: [rr-cake-order-backend](https://github.com/radhakrishna-codes/rr-cake-order-backend).

## Project Structure

```
cake-order-app/
└── frontend/   # React + Vite + Electron (Mac desktop + responsive web UI)
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

## Backend (separate repo)

Clone and run the API from [rr-cake-order-backend](https://github.com/radhakrishna-codes/rr-cake-order-backend):

```bash
git clone https://github.com/radhakrishna-codes/rr-cake-order-backend.git
cd rr-cake-order-backend
cp .env.example .env   # add MongoDB credentials
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The Vite dev server proxies `/api` and `/uploads` to `http://127.0.0.1:8000`.

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
- **iPhone / iOS**: Electron does not run on iOS. The React UI is responsive and can be served as a web/PWA app, or wrapped later with Capacitor for a native iOS build.
