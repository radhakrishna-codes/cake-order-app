# Cake Order API (Python + FastAPI + MongoDB)

## Setup

1. Replace `YOUR_PASSWORD_HERE` in `backend/.env` with your Atlas database user password.

2. Create a virtual environment and install dependencies:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Run the API:

```bash
uvicorn app.main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

## Environment variables (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `cake_order_app`) |
| `CORS_ORIGINS` | Comma-separated frontend URLs |

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/orders` | List all orders |
| `GET` | `/api/orders/{id}` | Get one order |
| `POST` | `/api/orders` | Create order |
| `PUT` | `/api/orders/{id}` | Update order |
| `DELETE` | `/api/orders/{id}` | Delete order |

### Create order example

```json
{
  "customer_name": "Priya Sharma",
  "flavor": "Butter Scotch",
  "size": "2 lb",
  "pickup_date": "2026-06-04",
  "pickup_time": "10:00",
  "total": 900,
  "advance_paid": 400,
  "pending": 500,
  "greetings": "Happy Birthday",
  "modifications": "Gold lettering",
  "reference_image_name": null,
  "reference_images": []
}
```
