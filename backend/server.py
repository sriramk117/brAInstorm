import os
import json
from fastapi import FastAPI, UploadFile, File
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

# activate the virtual environment: .venv\Scripts\Activate.ps1
# run the server: uvicorn server:app --reload

app = FastAPI()

# Load environment variables from the .env file (if present)
load_dotenv()

origins = [
    'http://localhost:8000',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
)

app.text_snippets = []
app.audio_snippets = []

class Query(BaseModel):
    text: str

@app.post("/process_query")
async def process_query(json_file: UploadFile = File(...)):
    file_contents = await json_file.read()
    query = json.loads(file_contents)

    # Process the query
    print(query)
    app.text_snippets = query['text_snippets']
    print(app.text_snippets)

    app.audio_snippets = query['audio_snippets']
    process_audio(app.audio_snippets)
    print(app.audio_snippets)
    return {"message": "Query processed successfully"}

async def process_audio(audio_snippets: List[str]):
    # Use Whisper to transcribe the audio snippets into 
    # more text snippets
    pass

@app.get("/")
async def root():
    return {"message": "Hello World"}