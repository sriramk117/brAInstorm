import os
import json
from fastapi import FastAPI, UploadFile, File, Request
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from apis.openai_api import inspo_generation
from apis.whisper_api import process_audio

# activate the virtual environment: .venv\Scripts\Activate.ps1
# run the server: python -m uvicorn server:app --reload

app = FastAPI()

# Load environment variables from the .env file (if present)
load_dotenv()

origins = [
    'http://localhost:8000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.snippets = []

class Query(BaseModel):
    text: str

async def process_query(json_file):
    query = json_file

    # Process the query
    print(query)
    text_snippets = query['text_snippets']
    print(text_snippets)

    audio_snippets = query['audio_snippets']
    print(audio_snippets)
    transcribed_audio = []
    transcribed_audio = process_audio(audio_snippets)
    
    # Merge the text snippets and the transcribed audio snippets
    # into a single list of snippets
    app.snippets = text_snippets + transcribed_audio

async def process_audio(audio_snippets: List[str]):
    # Use Whisper to transcribe the audio snippets into 
    # more text snippets
    pass

@app.post("/brainstorm")
async def run_brainstorm(request: Request):
    # Process the json file from the clien as a list of text snippets
    # and audio snippets
    query = await request.json()
    await process_query(json_file=query)
    
    # Generate inspiration based on the text snippets
    response_json = await inspo_generation(app.snippets)
    print(response_json)
    return response_json

@app.get("/")
async def root():
    return {"message": "Hello World"}