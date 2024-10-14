import os
import json
from fastapi import FastAPI, UploadFile, File, Request
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from apis.openai_api import inspo_generation
from apis.whisper_api import return_transcription

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
    
    # Merge the text snippets and the transcribed audio snippets
    # into a single list of snippets
    app.snippets = text_snippets

@app.post('/uploadFile')
async def process_audio(file_upload: UploadFile):
    print("PROCESSING")
    data = await file_upload.read()
    save_to = "file_uploads/" + file_upload.filename
    with open(save_to, 'wb') as f:
        f.write(data)
    ml_output = await return_transcription([file_upload])
    print("ML OUTPUT")
    print(ml_output)
    return {"output": ml_output}

# @app.post("/api/transcribe")
# async def transcribe_audio(file: UploadFile = File(...)):

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