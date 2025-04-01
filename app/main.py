from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

app = FastAPI(title="WagerGenie API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# The Odds API configuration
ODDS_API_KEY = os.getenv("ODDS_API_KEY")
ODDS_API_BASE_URL = "https://api.the-odds-api.com/v4"

class Pick(BaseModel):
    sport: str
    match: str
    prediction: str
    confidence: float
    odds: float

@app.get("/")
async def read_root():
    return {"message": "Welcome to WagerGenie API"}

@app.get("/api/sports")
async def get_sports():
    """Get all available sports from The Odds API"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ODDS_API_BASE_URL}/sports",
            params={"apiKey": ODDS_API_KEY}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch sports")
        return response.json()

@app.get("/api/odds/{sport}")
async def get_odds(sport: str, regions: str = "us"):
    """Get odds for a specific sport"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{ODDS_API_BASE_URL}/sports/{sport}/odds",
            params={
                "apiKey": ODDS_API_KEY,
                "regions": regions,
                "markets": "h2h,spreads",
                "oddsFormat": "american"
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch odds")
        return response.json()

@app.get("/api/picks")
async def get_picks(user_id: str):
    """Get picks for a specific user"""
    try:
        response = supabase.table("picks").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/picks")
async def create_pick(pick: Pick, user_id: str):
    """Create a new pick for a user"""
    try:
        data = {
            "user_id": user_id,
            **pick.dict()
        }
        response = supabase.table("picks").insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 