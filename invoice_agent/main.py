import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.v1.endpoints import router as agent_router
from config import BACKEND_API_URL

app = FastAPI(title="Invoice Deep Agent API")

# Configure CORS
# Allow frontend (localhost:5173) and potentially others
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(agent_router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {"status": "ok", "backend_url": BACKEND_API_URL}

def main():
    print("Starting Invoice Agent Server on port 8000...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

if __name__ == "__main__":
    main()
