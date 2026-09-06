# FastAPI Cloud API

## Run locally

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate       # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for the OpenAPI UI.

The default runtime uses an in-memory telemetry store for local development. Set `SIH_DATABASE_URL` and `SIH_REDIS_URL` when wiring production persistence and live broadcast infrastructure.
