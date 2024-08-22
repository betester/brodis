from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from routers import auth, matchmaking
from db import Base, engine
import os

app = FastAPI()

location = os.environ.get("LOCATION","Unknown location")

Base.metadata.create_all(bind=engine)

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(matchmaking.router)

@app.get("/")
async def root():
    return {"message": location}
