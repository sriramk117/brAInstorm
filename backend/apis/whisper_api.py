import librosa 
from typing import List
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import numpy as np
from fastapi import UploadFile


model_ids = {
    "Distil-Whisper": [
        "distil-whisper/distil-large-v2",
        "distil-whisper/distil-large-v3",
        "distil-whisper/distil-medium.en",
        "distil-whisper/distil-small.en",
    ],
    "Whisper": [
        "openai/whisper-large-v3-turbo" "openai/whisper-large-v3",
        "openai/whisper-large-v2",
        "openai/whisper-large",
        "openai/whisper-medium",
        "openai/whisper-small",
        "openai/whisper-base",
        "openai/whisper-tiny",
        "openai/whisper-medium.en",
        "openai/whisper-small.en",
        "openai/whisper-base.en",
        "openai/whisper-tiny.en",
    ],  
}

processor = None
pt_model = None

def init_model():
    model_id = "distil-whisper/distil-small.en"
    processor = AutoProcessor.from_pretrained(model_id)
    pt_model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id)

def convert_wav_to_array(wav_path):
    print("WAV PATH: " + str('file_uploads/' + wav_path.filename))
    y, sr = librosa.load('file_uploads/' + wav_path.filename, sr=16000)
    return y
    
def extract_input_features(audio_array, sampling_rate):
    processor = AutoProcessor.from_pretrained('distil-whisper/distil-small.en')
    input_features = processor(
        audio_array,
        sampling_rate=sampling_rate,
        return_tensors="pt",
    ).input_features
    return input_features    

async def return_transcription(audio_snippets: List[UploadFile]):
    # Use Whisper to transcribe the audio snippets into 
    # more text snippets
    #init_model()
    print("RETURNING TRANSCRIPTION")
    transcriptions = []
    for audio_file in audio_snippets:
        audio = convert_wav_to_array(audio_file)
        print(audio)
        input_features = extract_input_features(audio, sampling_rate=16000) 
        # if not pt_model:s
        model_id = "distil-whisper/distil-small.en"
        pt_model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id)
        predicted_ids = pt_model.generate(input_features)
        processor = AutoProcessor.from_pretrained('distil-whisper/distil-small.en')
        transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)
        transcriptions.append(transcription[0])
    
    return transcriptions[0]



